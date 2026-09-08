import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";
import { imagetools } from "vite-imagetools";

// https://vite.dev/config/
export default defineConfig({

  resolve: {
    alias: {
      "@": "/src",
    },
  },
  assetsInclude: [
    "**/*.riv",
    "**/*.woff2",
    "**/*.woff",
    "**/*.otf",
    "**/*.ttf",
  ],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    open: true,
    allowedHosts: [".ngrok-free.app", ".ngrok-free.dev"],
  },
  plugins: [
    react(),
    imagetools({
      include: ["**/*.png", "**/*.jpg", "**/*.jpeg"],
      defaultDirectives: new URLSearchParams("format=webp&quality=85"),
    }),
    svgr({
      svgrOptions: {
        exportType: "named",
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: "**/*.svg",
    }),
    tailwindcss(),
    {
      name: "admin-api-middleware",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === "/api/admin/add-participant" && req.method === "POST") {
            try {
              let rawBody = "";
              req.on("data", (chunk) => {
                rawBody += chunk;
              });
              req.on("end", async () => {
                try {
                  const { createClient } = await import("@supabase/supabase-js");
                  const fs = await import("fs");
                  const path = await import("path");

                  const envPath = path.resolve(process.cwd(), ".env.local");
                  let envVars: Record<string, string> = {};
                  if (fs.existsSync(envPath)) {
                    const content = fs.readFileSync(envPath, "utf-8");
                    content.split("\n").forEach((l) => {
                      const idx = l.indexOf("=");
                      if (idx > 0) {
                        envVars[l.substring(0, idx).trim()] = l.substring(idx + 1).trim();
                      }
                    });
                  }

                  const supabaseUrl =
                    envVars["VITE_SUPABASE_URL"] ||
                    process.env.VITE_SUPABASE_URL ||
                    "https://orxgpsqmadgfkmeqkvpy.supabase.co";
                  const serviceRoleKey =
                    envVars["SUPABASE_SERVICE_ROLE_KEY"] ||
                    process.env.SUPABASE_SERVICE_ROLE_KEY ||
                    "";

                  if (!serviceRoleKey) {
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured" }));
                    return;
                  }

                  const adminSb = createClient(supabaseUrl, serviceRoleKey);
                  const payload = JSON.parse(rawBody || "{}");

                  const sanitizePath = (str: string) =>
                    str
                      .replace(/[\u2018\u2019\u02bc']/g, "")
                      .replace(/[^\w\s\-_.()]/g, "_")
                      .replace(/\s+/g, " ")
                      .trim();

                  const safeFolder =
                    sanitizePath(payload.founderName || "participant") ||
                    `participant_${Date.now()}`;
                  const BUCKET = "participant-media";

                  let portraitUrl = "";
                  if (payload.portraitBase64) {
                    const matches = payload.portraitBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                    if (matches && matches.length === 3) {
                      const contentType = matches[1];
                      const buffer = Buffer.from(matches[2], "base64");
                      const ext = contentType.includes("png") ? "png" : contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "webp";
                      const filePath = `${safeFolder}/portrait_${Date.now()}.${ext}`;

                      const { error: upErr } = await adminSb.storage
                        .from(BUCKET)
                        .upload(filePath, buffer, { contentType, upsert: true });

                      if (!upErr) {
                        const { data: pubData } = adminSb.storage.from(BUCKET).getPublicUrl(filePath);
                        portraitUrl = pubData.publicUrl;
                      } else {
                        console.error("Storage upload error:", upErr);
                      }
                    }
                  }

                  const galleryUrls: string[] = [];
                  if (Array.isArray(payload.galleryBase64)) {
                    for (let i = 0; i < payload.galleryBase64.length; i++) {
                      const item = payload.galleryBase64[i];
                      if (!item?.data) continue;
                      const matches = item.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                      if (matches && matches.length === 3) {
                        const contentType = matches[1];
                        const buffer = Buffer.from(matches[2], "base64");
                        const ext = contentType.includes("png") ? "png" : contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "webp";
                        const filePath = `${safeFolder}/gallery/img_${Date.now()}_${i}.${ext}`;

                        const { error: upErr } = await adminSb.storage
                          .from(BUCKET)
                          .upload(filePath, buffer, { contentType, upsert: true });

                        if (!upErr) {
                          const { data: pubData } = adminSb.storage.from(BUCKET).getPublicUrl(filePath);
                          galleryUrls.push(pubData.publicUrl);
                        }
                      }
                    }
                  }

                  const description = (payload.description || "").trim();
                  const founderTag = `[Founder: ${payload.founderName.trim()}]`;
                  const genderTag = `[Gender: ${payload.gender || "male"}]`;
                  const phoneTag = payload.phone?.trim() ? `[Phone: ${payload.phone.trim()}]` : "";

                  let descriptionWithTags = description;
                  if (!descriptionWithTags.includes("[Founder:")) {
                    descriptionWithTags = `${descriptionWithTags} ${founderTag}`.trim();
                  }
                  if (!descriptionWithTags.includes("[Gender:")) {
                    descriptionWithTags = `${descriptionWithTags} ${genderTag}`.trim();
                  }
                  if (phoneTag && !descriptionWithTags.includes("[Phone:")) {
                    descriptionWithTags = `${descriptionWithTags} ${phoneTag}`.trim();
                  }

                  const cleanGoals = Array.isArray(payload.goals)
                    ? payload.goals.filter((g: any) => typeof g === "string" && g.trim().length > 0)
                    : [];
                  const cleanImpacts = Array.isArray(payload.potential_impact)
                    ? payload.potential_impact.filter((i: any) => typeof i === "string" && i.trim().length > 0)
                    : [];

                  const DEFAULT_USER_ID = "f8fdd430-05f6-4fd9-b662-bb40c7dfaf6a";

                  const newApp = {
                    user_id: payload.userId || DEFAULT_USER_ID,
                    category: payload.category || "business",
                    age: Number(payload.age) || 25,
                    region: (payload.region || "Toshkent shahri").trim(),
                    brand_name: (payload.brandName || "").trim(),
                    legal_name: (payload.legalName || payload.brandName || "").trim(),
                    business_description: descriptionWithTags,
                    goals: cleanGoals.length > 0 ? cleanGoals : ["Biznesni rivojlantirish va yangi bosqichga olib chiqish."],
                    potential_impact: cleanImpacts,
                    product_image_url: portraitUrl || (galleryUrls.length > 0 ? galleryUrls[0] : ""),
                    product_image_urls: galleryUrls,
                    avatar_url: portraitUrl || (galleryUrls.length > 0 ? galleryUrls[0] : ""),
                    status: payload.status || "under_review",
                    gender: payload.gender || "male",
                    is_deleted: false,
                  };

                  const { data: inserted, error: insErr } = await adminSb
                    .from("applications")
                    .insert(newApp)
                    .select()
                    .single();

                  if (insErr) {
                    console.error("Insert error via adminSb:", insErr);
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: insErr.message }));
                    return;
                  }

                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ success: true, application: inserted }));
                } catch (innerErr: any) {
                  console.error("admin-api error:", innerErr);
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ error: innerErr.message || "Internal error" }));
                }
              });
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: err.message || "Server error" }));
            }
            return;
          }
          next();
        });
      },
    },
  ],
});
