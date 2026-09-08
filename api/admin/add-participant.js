import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const supabaseUrl =
      process.env.VITE_SUPABASE_URL || "https://orxgpsqmadgfkmeqkvpy.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return res
        .status(500)
        .json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured in environment" });
    }

    const adminSb = createClient(supabaseUrl, serviceRoleKey);
    const payload = req.body || {};

    const sanitizePath = (str) =>
      (str || "")
        .replace(/[\u2018\u2019\u02bc']/g, "")
        .replace(/[^\w\s\-_.()]/g, "_")
        .replace(/\s+/g, " ")
        .trim();

    const safeFolder =
      sanitizePath(payload.founderName || "participant") || `participant_${Date.now()}`;
    const BUCKET = "participant-media";

    let portraitUrl = "";
    if (payload.portraitBase64) {
      const matches = payload.portraitBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const contentType = matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        const ext = contentType.includes("png")
          ? "png"
          : contentType.includes("jpeg") || contentType.includes("jpg")
          ? "jpg"
          : "webp";
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

    const galleryUrls = [];
    if (Array.isArray(payload.galleryBase64)) {
      for (let i = 0; i < payload.galleryBase64.length; i++) {
        const item = payload.galleryBase64[i];
        if (!item?.data) continue;
        const matches = item.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const contentType = matches[1];
          const buffer = Buffer.from(matches[2], "base64");
          const ext = contentType.includes("png")
            ? "png"
            : contentType.includes("jpeg") || contentType.includes("jpg")
            ? "jpg"
            : "webp";
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
      ? payload.goals.filter((g) => typeof g === "string" && g.trim().length > 0)
      : [];
    const cleanImpacts = Array.isArray(payload.potential_impact)
      ? payload.potential_impact.filter((i) => typeof i === "string" && i.trim().length > 0)
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
      goals:
        cleanGoals.length > 0
          ? cleanGoals
          : ["Biznesni rivojlantirish va yangi bosqichga olib chiqish."],
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
      return res.status(400).json({ error: insErr.message });
    }

    return res.status(200).json({ success: true, application: inserted });
  } catch (err) {
    console.error("Vercel api/admin/add-participant error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
