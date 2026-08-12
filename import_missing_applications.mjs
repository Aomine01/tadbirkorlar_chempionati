import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load env
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf-8").split("\n")
    .filter(l => l.includes("="))
    .map(l => [l.split("=")[0].trim(), l.split("=").slice(1).join("=").trim()])
);

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = "participant-media";
const USERS_DIR = "users";
const DEFAULT_USER_ID = "f8fdd430-05f6-4fd9-b662-bb40c7dfaf6a";

function sanitizePath(str) {
  return str
    .replace(/[\u2018\u2019\u02bc']/g, "")
    .replace(/[^\w\s\-_.()]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

function parseInfoTxt(folderPath, folderName) {
  const txts = fs.readdirSync(folderPath).filter(f => f.endsWith(".txt"));
  if (txts.length === 0) return null;
  const raw = fs.readFileSync(path.join(folderPath, txts[0]), "utf-8");

  const getMatch = (regex) => {
    const m = raw.match(regex);
    return m ? m[1].trim() : "";
  };

  const name = getMatch(/(?:^|\n)Name:\s*(.+)/i) || folderName;
  const region = getMatch(/(?:^|\n)Location:\s*(.+)/i) || getMatch(/(?:^|\n)Viloyat:\s*(.+)/i) || "TOSHKENT SHAHRI";
  const ageStr = getMatch(/(?:^|\n)age:\s*(.+)/i);
  const age = parseInt(ageStr, 10) || 25;
  const phone = getMatch(/(?:^|\n)phone:\s*(.+)/i) || "+998 90 123 45 67";
  const brand = getMatch(/(?:^|\n)Industry name:\s*(.+)/i) || folderName;
  const legal = getMatch(/(?:^|\n)Yuridik name:\s*(.+)/i) || brand;

  let about = "";
  const aboutMatch = raw.match(/About business:\s*([\s\S]*?)(?=\n(?:Maqsad|Potential impact|Yuridik name|phone|age):|$)/i);
  if (aboutMatch) about = aboutMatch[1].trim();

  const goals = [];
  const goalsMatch = raw.match(/Maqsad:\s*([\s\S]*?)(?=\n(?:Potential impact|Yuridik name|About business):|$)/i);
  if (goalsMatch) {
    goalsMatch[1].split("\n").map(l => l.trim()).filter(l => l.length > 3).forEach(g => goals.push(g));
  }

  const impact = [];
  const impactMatch = raw.match(/Potential impact:\s*([\s\S]*?)(?=\n(?:Maqsad|Yuridik name|About business):|$)/i);
  if (impactMatch) {
    impactMatch[1].split("\n").map(l => l.trim()).filter(l => l.length > 3).forEach(i => impact.push(i));
  }

  const isFemale = /(soba|eva|ova|qizi|girl|woman|female)/i.test(name) || /Ayol/i.test(raw);
  const gender = isFemale ? "female" : "male";

  return { name, region, age, phone, brand, legal, about, goals, impact, gender };
}

function findPortrait(folderPath, folderName) {
  const imgs = fs.readdirSync(folderPath).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
  const norm = s => s.replace(/[\u2018\u2019\u02bc']/g, "").toLowerCase();
  const exact = imgs.find(f => norm(path.parse(f).name) === norm(folderName));
  if (exact) return exact;
  return imgs.sort((a, b) =>
    fs.statSync(path.join(folderPath, b)).size - fs.statSync(path.join(folderPath, a)).size
  )[0] || null;
}

async function uploadFile(filePath, storagePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
  const contentType = mimeMap[ext] || "image/png";

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, { contentType, upsert: true });

  if (error) throw error;

  const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function main() {
  console.log("🚀 Starting import of missing user applications...\n");

  const { data: existingApps, error: fetchErr } = await sb
    .from("applications")
    .select("id, brand_name, business_description")
    .eq("is_deleted", false);

  if (fetchErr) {
    console.error("Failed to fetch applications:", fetchErr);
    process.exit(1);
  }

  const norm = s => (s || "").replace(/[\u2018\u2019\u02bc]/g, "'").toLowerCase().trim();

  const existingFounders = new Set();
  existingApps.forEach(app => {
    const raw = app.business_description || "";
    const m = raw.match(/\[Founder:\s*([^\]]+)\]/i);
    if (m) existingFounders.add(norm(m[1]));
    if (app.brand_name) existingFounders.add(norm(app.brand_name));
  });

  const folders = fs.readdirSync(USERS_DIR).filter(f => fs.statSync(path.join(USERS_DIR, f)).isDirectory());
  console.log(`📁 Found ${folders.length} user folders\n`);

  let insertedCount = 0;
  let skippedCount = 0;

  for (const folderName of folders) {
    const folderPath = path.join(USERS_DIR, folderName);
    const parsed = parseInfoTxt(folderPath, folderName);
    if (!parsed) continue;

    const normName = norm(parsed.name);
    const normFolder = norm(folderName);
    const normBrand = norm(parsed.brand);

    if (existingFounders.has(normName) || existingFounders.has(normFolder) || (normBrand && normBrand !== "n/a" && existingFounders.has(normBrand))) {
      skippedCount++;
      continue;
    }

    console.log(`➕ Importing new: ${parsed.name} (${parsed.brand})`);

    const allImgs = fs.readdirSync(folderPath).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
    const portrait = findPortrait(folderPath, folderName);
    const gallery = allImgs.filter(f => f !== portrait);
    const safeFolder = sanitizePath(folderName);

    let portraitUrl = null;
    const galleryUrls = [];

    if (portrait) {
      try {
        portraitUrl = await uploadFile(path.join(folderPath, portrait), `${safeFolder}/portrait.png`);
      } catch (e) {
        console.warn(`   ⚠️ Portrait upload failed: ${e.message}`);
      }
    }

    for (const gf of gallery) {
      try {
        const safeName = sanitizePath(path.parse(gf).name) + path.extname(gf).toLowerCase();
        const url = await uploadFile(path.join(folderPath, gf), `${safeFolder}/gallery/${safeName}`);
        galleryUrls.push(url);
      } catch (e) {
        // Ignore single image fail
      }
    }

    const fullDesc = `${parsed.about || "Loyiha bo'yicha batafsil ma'lumotlar taqdim etilgan."} [Founder: ${parsed.name}] [Gender: ${parsed.gender}] [Phone: ${parsed.phone}]`;

    const newApp = {
      user_id: DEFAULT_USER_ID,
      category: "business",
      age: parsed.age,
      region: parsed.region.toUpperCase(),
      brand_name: parsed.brand || folderName,
      legal_name: parsed.legal || parsed.brand || folderName,
      business_description: fullDesc,
      goals: parsed.goals.length > 0 ? parsed.goals : ["Biznesni kengaytirish va yangi bosqichga olib chiqish."],
      potential_impact: parsed.impact.length > 0 ? parsed.impact : ["Yangi ish o'rinlari yaratish va iqtisodiy o'sishni ta'minlash."],
      product_image_url: portraitUrl,
      product_image_urls: galleryUrls,
      avatar_url: portraitUrl,
      status: "approved",
      gender: parsed.gender,
      is_deleted: false,
    };

    const { error: insertErr } = await sb.from("applications").insert(newApp);

    if (insertErr) {
      console.error(`   ❌ Failed to insert ${parsed.name}:`, insertErr.message);
    } else {
      console.log(`   ✅ Successfully created application for ${parsed.name}`);
      insertedCount++;
      existingFounders.add(normName);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`🎉 IMPORT COMPLETE! Inserted: ${insertedCount}, Skipped (Already existed): ${skippedCount}`);
  console.log("=".repeat(60));
}

main();
