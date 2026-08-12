/**
 * clean_reupload.mjs
 * 
 * Step 1: Delete ALL files from participant-media bucket
 * Step 2: Re-upload every user from local `users/` folder
 * Step 3: Match ONLY by exact founder name from info.txt → [Founder: ...] in DB
 *         No fuzzy/partial matching. If no exact match → SKIP with clear warning.
 * 
 * Run: node clean_reupload.mjs
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// ─── Load env ────────────────────────────────────────────────────────────────
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf-8").split("\n")
    .filter(l => l.includes("="))
    .map(l => [l.split("=")[0].trim(), l.split("=").slice(1).join("=").trim()])
);

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = "participant-media";
const USERS_DIR = "users";

// ─── Helper: sanitize path (remove apostrophes/special chars for storage key) ─
function sanitizePath(str) {
  return str
    .replace(/[\u2018\u2019\u02bc']/g, "")  // all apostrophe variants → remove
    .replace(/[^\w\s\-_.()]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Helper: read info.txt from folder ────────────────────────────────────────
function readInfoTxt(folderPath) {
  const txts = fs.readdirSync(folderPath).filter(f => f.endsWith(".txt"));
  if (txts.length === 0) return { name: null, brand: null };
  const content = fs.readFileSync(path.join(folderPath, txts[0]), "utf-8");
  const nameMatch = content.match(/(?:^|\r?\n)Name:\s*(.+)/i);
  const brandMatch = content.match(/(?:^|\r?\n)Industry name:\s*(.+)/i);
  return {
    name: nameMatch ? nameMatch[1].trim() : null,
    brand: brandMatch ? brandMatch[1].trim() : null,
  };
}

// ─── Helper: find portrait file ───────────────────────────────────────────────
function findPortrait(folderPath, folderName) {
  const imgs = fs.readdirSync(folderPath).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
  // Normalize: strip apostrophes for comparison
  const norm = s => s.replace(/[\u2018\u2019\u02bc']/g, "").toLowerCase();
  const exact = imgs.find(f => norm(path.parse(f).name) === norm(folderName));
  if (exact) return exact;
  // Fallback: largest image
  return imgs.sort((a, b) =>
    fs.statSync(path.join(folderPath, b)).size - fs.statSync(path.join(folderPath, a)).size
  )[0] || null;
}

// ─── Helper: upload a file to storage ─────────────────────────────────────────
async function uploadFile(localPath, storagePath) {
  const buf = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const ct = ext === ".png" ? "image/png" : (ext === ".jpg" || ext === ".jpeg") ? "image/jpeg" : "image/webp";

  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, {
    contentType: ct,
    upsert: true,
    cacheControl: "31536000", // 1 year cache
  });

  if (error) throw new Error(error.message);
  return sb.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

// ─── Step 1: Delete ALL files from bucket ─────────────────────────────────────
async function clearBucket() {
  console.log("🗑️  Clearing bucket...");
  let deleted = 0;

  // List all top-level "folders" (prefixes)
  const { data: folders } = await sb.storage.from(BUCKET).list("", { limit: 1000 });
  if (!folders || folders.length === 0) {
    console.log("   Bucket already empty.");
    return;
  }

  for (const folder of folders) {
    if (!folder.name) continue;

    // List files in portrait level
    const { data: portraitFiles } = await sb.storage.from(BUCKET).list(folder.name, { limit: 1000 });
    if (portraitFiles) {
      const portraitPaths = portraitFiles.filter(f => f && f.name && f.name !== "gallery").map(f => `${folder.name}/${f.name}`);
      if (portraitPaths.length > 0) {
        await sb.storage.from(BUCKET).remove(portraitPaths);
        deleted += portraitPaths.length;
      }

      // List gallery subfolder
      const galleryFolder = portraitFiles.find(f => f.name === "gallery");
      if (galleryFolder) {
        const { data: galleryFiles } = await sb.storage.from(BUCKET).list(`${folder.name}/gallery`, { limit: 1000 });
        if (galleryFiles && galleryFiles.length > 0) {
          const galleryPaths = galleryFiles.map(f => `${folder.name}/gallery/${f.name}`);
          await sb.storage.from(BUCKET).remove(galleryPaths);
          deleted += galleryPaths.length;
        }
      }
    }
  }

  console.log(`   ✅ Deleted ${deleted} files from bucket.\n`);
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Clean re-upload starting...\n");

  // Fetch all DB applications
  const { data: dbApps, error: dbErr } = await sb
    .from("applications")
    .select("id, brand_name, business_description, status")
    .eq("is_deleted", false);

  if (dbErr) { console.error("DB fetch failed:", dbErr.message); process.exit(1); }

  // Build a lookup: normalized founder name → DB row
  const founderMap = new Map();
  for (const app of dbApps) {
    const m = (app.business_description || "").match(/\[Founder:\s*([^\]]+)\]/i);
    if (m) {
      const norm = m[1].trim().replace(/[\u2018\u2019\u02bc']/g, "'").toLowerCase();
      founderMap.set(norm, app);
    }
  }

  console.log(`📋 DB: ${dbApps.length} applications, ${founderMap.size} have [Founder:] tags\n`);

  // Clear bucket
  await clearBucket();

  // Reset ALL product_image_url and product_image_urls in DB first
  console.log("🧹 Clearing all existing image URLs in DB...");
  await sb.from("applications").update({
    product_image_url: null,
    product_image_urls: [],
  }).eq("is_deleted", false);
  console.log("   ✅ Done.\n");

  // Get all local folders
  const folders = fs.readdirSync(USERS_DIR)
    .filter(f => fs.statSync(path.join(USERS_DIR, f)).isDirectory());

  console.log(`📁 ${folders.length} local participant folders\n`);
  console.log("=".repeat(60));

  const results = { success: [], noMatch: [], failed: [], noImages: [] };

  for (const folderName of folders) {
    const folderPath = path.join(USERS_DIR, folderName);
    const info = readInfoTxt(folderPath);

    console.log(`\n👤 ${folderName}`);
    if (info.name) console.log(`   info.txt → Name: "${info.name}" | Brand: "${info.brand}"`);

    const allImgs = fs.readdirSync(folderPath).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
    if (allImgs.length === 0) {
      console.log("   [SKIP] No images");
      results.noImages.push(folderName);
      continue;
    }

    // ── EXACT MATCH ONLY ──
    // Normalize: replace apostrophe variants with standard apostrophe
    const norm = s => s.replace(/[\u2018\u2019\u02bc]/g, "'").toLowerCase().trim();

    let matchedApp = null;

    // 1. Match info.txt Name → [Founder:] in DB (most reliable)
    if (info.name) {
      matchedApp = founderMap.get(norm(info.name)) || null;
    }

    // 2. If no match, try folder name → [Founder:] in DB
    if (!matchedApp) {
      matchedApp = founderMap.get(norm(folderName)) || null;
    }

    if (!matchedApp) {
      console.log(`   [NO MATCH] No DB application found for "${info.name || folderName}"`);
      console.log(`   (Brand from info.txt: "${info.brand}")`);
      results.noMatch.push({ folder: folderName, name: info.name, brand: info.brand });
      continue;
    }

    console.log(`   ✓ Matched DB: [${matchedApp.id}] "${matchedApp.brand_name}"`);

    const portrait = findPortrait(folderPath, folderName);
    const gallery = allImgs.filter(f => f !== portrait);
    const safeFolder = sanitizePath(folderName);

    try {
      // Upload portrait
      console.log(`   📸 Portrait: ${portrait}`);
      const portraitUrl = await uploadFile(
        path.join(folderPath, portrait),
        `${safeFolder}/portrait.png`
      );

      // Upload gallery
      const galleryUrls = [];
      for (const gf of gallery) {
        const safeName = sanitizePath(path.parse(gf).name) + path.extname(gf).toLowerCase();
        try {
          const url = await uploadFile(
            path.join(folderPath, gf),
            `${safeFolder}/gallery/${safeName}`
          );
          galleryUrls.push(url);
        } catch (e) {
          console.log(`   ⚠️  Gallery skip (${gf}): ${e.message}`);
        }
      }
      console.log(`   🖼️  Gallery: ${galleryUrls.length} images uploaded`);

      // Update DB
      const { error: updateErr } = await sb
        .from("applications")
        .update({ product_image_url: portraitUrl, product_image_urls: galleryUrls })
        .eq("id", matchedApp.id);

      if (updateErr) throw new Error(updateErr.message);

      console.log(`   ✅ DB updated → ${matchedApp.brand_name}`);
      results.success.push({ folder: folderName, brand: matchedApp.brand_name, gallery: galleryUrls.length });
    } catch (e) {
      console.error(`   ❌ FAILED: ${e.message}`);
      results.failed.push({ folder: folderName, error: e.message });
    }
  }

  // ─── Summary ────────────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Uploaded & matched: ${results.success.length}`);
  console.log(`⚠️  No DB match:       ${results.noMatch.length}`);
  console.log(`❌ Failed:             ${results.failed.length}`);
  console.log(`⛔ No images:          ${results.noImages.length}`);

  if (results.noMatch.length > 0) {
    console.log("\n⚠️  These local folders have no DB application (they may not be approved yet):");
    results.noMatch.forEach(r => console.log(`   - ${r.folder} | Brand: ${r.brand}`));
  }
  if (results.failed.length > 0) {
    console.log("\n❌ Failed:");
    results.failed.forEach(r => console.log(`   - ${r.folder}: ${r.error}`));
  }

  fs.writeFileSync("clean_reupload_report.json", JSON.stringify(results, null, 2));
  console.log("\n📄 Report saved: clean_reupload_report.json");
  console.log("🎉 Done!");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
