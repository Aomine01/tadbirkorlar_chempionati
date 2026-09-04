import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf-8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.split("=")[0].trim(), l.split("=").slice(1).join("=").trim()])
);

const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const sb = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEFAULT_IMPORTER_ID = "f8fdd430-05f6-4fd9-b662-bb40c7dfaf6a";

// Parse CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const limitArgIdx = args.indexOf("--limit");
const limit = limitArgIdx !== -1 ? parseInt(args[limitArgIdx + 1], 10) : null;
const appIdArgIdx = args.indexOf("--app-id");
const specificAppId = appIdArgIdx !== -1 ? args[appIdArgIdx + 1] : null;
const defaultPassArgIdx = args.indexOf("--password");
const defaultPassword = defaultPassArgIdx !== -1 ? args[defaultPassArgIdx + 1] : "Chempionat2026!";

// Helper: Read real phones from users/ directory if available
function loadFolderPhones() {
  const folderPhones = new Map();
  const usersDir = "./users";
  if (!fs.existsSync(usersDir)) return folderPhones;

  const entries = fs.readdirSync(usersDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const folderPath = path.join(usersDir, entry.name);
      const files = fs.readdirSync(folderPath);
      const infoFile = files.find((f) => f.toLowerCase().includes("info") && f.endsWith(".txt"));
      if (infoFile) {
        try {
          const content = fs.readFileSync(path.join(folderPath, infoFile), "utf-8");
          const m = content.match(/phone(?:\s*number)?:\s*([^\r\n]+)/i);
          if (m) {
            folderPhones.set(entry.name.toLowerCase().trim(), m[1].trim());
          }
        } catch {
          // Ignore read errors
        }
      }
    }
  }
  return folderPhones;
}

// Helper: Normalize phone to clean digits
function normalizePhone(raw) {
  if (!raw) return "";
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("998")) return digits;
  if (digits.length === 9) return "998" + digits;
  return digits;
}

// Helper: Generate clean email/login identifier
function generateLoginEmail(founder, brand, phone, appId) {
  const cleanPhone = normalizePhone(phone);
  if (cleanPhone && cleanPhone !== "998901234567" && cleanPhone.length === 12) {
    return `${cleanPhone}@chempionat.uz`;
  }

  // Fallback slug from founder name or brand
  const base = (founder || brand || "participant")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 14);

  const shortId = appId.replace(/-/g, "").slice(0, 6);
  return `${base || "user"}_${shortId}@chempionat.uz`;
}

async function main() {
  console.log("=========================================================");
  console.log("   TADBIRKORLAR CHEMPIONATI - ACCOUNT PROVISIONING TOOL  ");
  console.log("=========================================================");
  if (isDryRun) {
    console.log("⚠️  RUNNING IN DRY-RUN MODE (No database changes will be made)\n");
  }

  const folderPhones = loadFolderPhones();
  console.log(`Loaded ${folderPhones.size} phone records from users/ folders.`);

  // 1. Fetch target applications
  let query = sb
    .from("applications")
    .select("id, brand_name, legal_name, business_description, user_id, category, region, status, created_at");

  if (specificAppId) {
    query = query.eq("id", specificAppId);
  } else {
    // Target applications that are still on the default importer ID
    query = query.eq("user_id", DEFAULT_IMPORTER_ID);
  }

  const { data: apps, error: fetchErr } = await query;
  if (fetchErr) {
    console.error("❌ Error fetching applications:", fetchErr);
    process.exit(1);
  }

  let targetApps = apps || [];
  if (limit && limit > 0) {
    targetApps = targetApps.slice(0, limit);
  }

  console.log(`Found ${targetApps.length} applications to process.\n`);
  if (targetApps.length === 0) {
    console.log("All applications are already linked to dedicated user accounts!");
    return;
  }

  // 2. Fetch existing auth users to avoid duplication
  const { data: authData } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const existingUsersByEmail = new Map();
  (authData?.users || []).forEach((u) => {
    if (u.email) existingUsersByEmail.set(u.email.toLowerCase(), u);
  });

  const results = [];
  let createdCount = 0;
  let linkedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < targetApps.length; i++) {
    const app = targetApps[i];
    const desc = app.business_description || "";

    // Extract metadata tags
    const founderMatch = desc.match(/\[Founder:\s*([^\]]+)\]/i);
    const phoneMatch = desc.match(/\[Phone:\s*([^\]]+)\]/i);

    const founder = founderMatch ? founderMatch[1].trim() : (app.legal_name || app.brand_name || "Ishtirokchi");
    let phone = phoneMatch ? phoneMatch[1].trim() : "";

    // Check folder fallback if phone is dummy or missing
    if (!phone || phone === "+998 90 123 45 67") {
      const folderPhone =
        folderPhones.get(founder.toLowerCase().trim()) ||
        folderPhones.get(app.brand_name.toLowerCase().trim());
      if (folderPhone) {
        phone = folderPhone;
      }
    }

    const email = generateLoginEmail(founder, app.brand_name, phone, app.id);
    const phoneDigits = normalizePhone(phone);
    const displayPhone = phoneDigits && phoneDigits !== "998901234567" ? `+${phoneDigits}` : phone;

    console.log(`[${i + 1}/${targetApps.length}] Processing: ${founder} (${app.brand_name})`);
    console.log(`     Login Email: ${email}`);
    console.log(`     Phone:       ${displayPhone || "N/A"}`);

    if (isDryRun) {
      results.push({
        id: app.id,
        founder,
        brand: app.brand_name,
        region: app.region,
        phone: displayPhone,
        login: email,
        password: defaultPassword,
        status: app.status,
      });
      continue;
    }

    try {
      let targetUserId = null;

      // Check if user already exists in auth.users
      if (existingUsersByEmail.has(email.toLowerCase())) {
        targetUserId = existingUsersByEmail.get(email.toLowerCase()).id;
        console.log(`     ℹ️ Existing auth user found (${targetUserId}). Reusing.`);
      } else {
        // Create new user in Supabase Auth
        const { data: newUser, error: createErr } = await sb.auth.admin.createUser({
          email,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: {
            full_name: founder,
            phone_number: displayPhone || "",
            brand_name: app.brand_name,
          },
        });

        if (createErr) {
          console.error(`     ❌ Failed to create auth user: ${createErr.message}`);
          failedCount++;
          continue;
        }

        targetUserId = newUser.user.id;
        existingUsersByEmail.set(email.toLowerCase(), newUser.user);
        createdCount++;
        console.log(`     ✅ Created auth user (${targetUserId})`);
      }

      // Ensure profile exists in public.profiles
      const { error: profileErr } = await sb.from("profiles").upsert(
        {
          id: targetUserId,
          full_name: founder,
          phone_number: displayPhone || "+998 90 000 00 00",
          role: "applicant",
        },
        { onConflict: "id" }
      );
      if (profileErr) {
        console.warn(`     ⚠️ Warning updating profile: ${profileErr.message}`);
      }

      // UPDATE applications.user_id to match the new user account!
      const { error: updateAppErr } = await sb
        .from("applications")
        .update({ user_id: targetUserId })
        .eq("id", app.id);

      if (updateAppErr) {
        console.error(`     ❌ Failed to update application user_id: ${updateAppErr.message}`);
        failedCount++;
        continue;
      }

      console.log(`     🔗 Successfully linked application ${app.id} to user ${targetUserId}`);
      linkedCount++;

      results.push({
        id: app.id,
        founder,
        brand: app.brand_name,
        region: app.region,
        phone: displayPhone,
        login: email,
        password: defaultPassword,
        status: app.status,
      });
    } catch (err) {
      console.error(`     ❌ Unexpected error: ${err.message}`);
      failedCount++;
    }
  }

  // 3. Export CSV report
  const csvHeader = "Ariza ID,Ism-Familiya,Brend Nomi,Viloyat,Telefon,Login,Parol,Holat,Havola\n";
  const csvRows = results.map((r) =>
    [
      `"${r.id}"`,
      `"${r.founder.replace(/"/g, '""')}"`,
      `"${r.brand.replace(/"/g, '""')}"`,
      `"${r.region}"`,
      `"${r.phone}"`,
      `"${r.login}"`,
      `"${r.password}"`,
      `"${r.status}"`,
      `"https://chempionat.yoshlar.gov.uz/auth/login"`,
    ].join(",")
  );

  const outputPath = isDryRun ? "participant_credentials_preview.csv" : "participant_credentials.csv";
  fs.writeFileSync(outputPath, "\uFEFF" + csvHeader + csvRows.join("\n"), "utf-8");

  console.log("\n=========================================================");
  console.log("                     SUMMARY                             ");
  console.log("=========================================================");
  console.log(`Processed:            ${targetApps.length}`);
  console.log(`New Auth Users:       ${createdCount}`);
  console.log(`Applications Linked:  ${linkedCount}`);
  console.log(`Failed:               ${failedCount}`);
  console.log(`Exported CSV File:    ${outputPath}`);
  console.log("=========================================================\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
