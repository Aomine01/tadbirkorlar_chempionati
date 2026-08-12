import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf-8").split("\n")
    .filter(l => l.includes("="))
    .map(l => [l.split("=")[0].trim(), l.split("=").slice(1).join("=").trim()])
);

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function getCleanRegion(raw) {
  if (!raw) return "Toshkent shahri";
  const norm = raw.trim().toUpperCase().replace(/’|‘|`/g, "'");

  if (norm.includes("QORAQALPOG") || norm.includes("QORAQOLPOG") || norm.includes("KARAKALPAK") || norm.includes("NUKUS")) {
    return "Qoraqalpog'iston Respublikasi";
  }
  if (norm.includes("OLMALIQ") || norm.includes("TOSHKENT VILOYATI")) return "Toshkent viloyati";
  if (norm.includes("TOSHKENT SHAHRI") || norm.includes("TOSHKENT SHAHAR") || norm.includes("TOSHKENT SHAXAR")) return "Toshkent shahri";
  if (norm.includes("ANDIJON")) return "Andijon viloyati";
  if (norm.includes("BUXORO") || norm.includes("JONDOR")) return "Buxoro viloyati";
  if (norm.includes("FARG")) return "Farg'ona viloyati";
  if (norm.includes("JIZZAX")) return "Jizzax viloyati";
  if (norm.includes("XORAZM") || norm.includes("URGANCH")) return "Xorazm viloyati";
  if (norm.includes("NAMANGAN")) return "Namangan viloyati";
  if (norm.includes("NAVOIY")) return "Navoiy viloyati";
  if (norm.includes("QASHQADARYO") || norm.includes("NISHON")) return "Qashqadaryo viloyati";
  if (norm.includes("SAMARQAND") || norm.includes("JOMBOY") || norm.includes("PASTDARG")) return "Samarqand viloyati";
  if (norm.includes("SIRDARYO")) return "Sirdaryo viloyati";
  if (norm.includes("SURXONDARYO")) return "Surxondaryo viloyati";

  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

async function main() {
  console.log("🔄 Fetching all applications to update region names...");
  const { data, error } = await sb.from("applications").select("id, region");

  if (error) {
    console.error("Error fetching applications:", error);
    process.exit(1);
  }

  console.log(`Found ${data.length} applications.`);

  let updatedCount = 0;
  for (const app of data) {
    const clean = getCleanRegion(app.region);
    if (clean !== app.region) {
      const { error: updateErr } = await sb
        .from("applications")
        .update({ region: clean })
        .eq("id", app.id);

      if (updateErr) {
        console.error(`Failed to update ${app.id}:`, updateErr.message);
      } else {
        console.log(`Updated ${app.id}: "${app.region}" → "${clean}"`);
        updatedCount++;
      }
    }
  }

  console.log(`\n✅ Done! Updated ${updatedCount} applications to clean region names.`);
}

main();
