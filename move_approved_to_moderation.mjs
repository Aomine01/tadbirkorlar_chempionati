import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf-8").split("\n")
    .filter(l => l.includes("="))
    .map(l => [l.split("=")[0].trim(), l.split("=").slice(1).join("=").trim()])
);

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("🔄 Updating all 'approved' applications (120) to 'submitted' (Moderatsiya)...");
  
  const { data, error } = await sb
    .from("applications")
    .update({ status: "submitted" })
    .eq("status", "approved")
    .select("id");

  if (error) {
    console.error("❌ Error updating applications:", error);
    process.exit(1);
  }

  console.log(`✅ Successfully updated ${data.length} applications to 'submitted' (Moderatsiya).`);

  // Verify new status counts
  const { data: allApps, error: fetchErr } = await sb.from("applications").select("id, status");
  if (!fetchErr && allApps) {
    const counts = {};
    allApps.forEach(app => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    console.log("📊 Updated DB Status Counts:", counts);
  }
}

main();
