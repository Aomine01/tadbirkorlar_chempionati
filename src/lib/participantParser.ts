/**
 * participantParser.ts
 * 
 * Utilities to parse participant info.txt, normalize regions, detect gender,
 * classify portrait vs gallery images, and sanitize storage paths.
 */

export interface ParsedParticipantInfo {
  name: string;
  region: string;
  age: number;
  phone: string;
  brand: string;
  legal: string;
  about: string;
  goals: string[];
  impact: string[];
  gender: "male" | "female";
  category: "business" | "startup";
}

export const UZBEKISTAN_OFFICIAL_REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand viloyati",
  "Farg'ona viloyati",
  "Andijon viloyati",
  "Namangan viloyati",
  "Qashqadaryo viloyati",
  "Surxondaryo viloyati",
  "Jizzax viloyati",
  "Sirdaryo viloyati",
  "Navoiy viloyati",
  "Buxoro viloyati",
  "Xorazm viloyati",
  "Qoraqalpog'iston Respublikasi",
] as const;

/**
 * Normalizes any free-form region string into the official 14 regions of Uzbekistan
 */
export function normalizeRegionName(raw: string): string {
  if (!raw) return "Toshkent shahri";
  const norm = raw.trim().toUpperCase().replace(/[’‘`]/g, "'");

  if (
    norm.includes("QORAQALPOG") ||
    norm.includes("QORAQOLPOG") ||
    norm.includes("KARAKALPAK") ||
    norm.includes("NUKUS")
  ) {
    return "Qoraqalpog'iston Respublikasi";
  }
  if (norm.includes("TOSHKENT SHAHRI") || norm.includes("TOSHKENT SHAHAR") || norm.includes("TOSHKENT SHAXAR") || norm === "TOSHKENT") {
    return "Toshkent shahri";
  }
  if (norm.includes("TOSHKENT VILOYATI") || norm.includes("OLMALIQ") || norm.includes("ANGREN") || norm.includes("CHIRCHIQ")) {
    return "Toshkent viloyati";
  }
  if (norm.includes("ANDIJON")) return "Andijon viloyati";
  if (norm.includes("BUXORO") || norm.includes("JONDOR") || norm.includes("GIJDUVON")) return "Buxoro viloyati";
  if (norm.includes("FARG") || norm.includes("QO'QON") || norm.includes("MARG'ILON")) return "Farg'ona viloyati";
  if (norm.includes("JIZZAX")) return "Jizzax viloyati";
  if (norm.includes("XORAZM") || norm.includes("URGANCH") || norm.includes("XIVA")) return "Xorazm viloyati";
  if (norm.includes("NAMANGAN")) return "Namangan viloyati";
  if (norm.includes("NAVOIY") || norm.includes("ZARAFSHON")) return "Navoiy viloyati";
  if (norm.includes("QASHQADARYO") || norm.includes("QARSHI") || norm.includes("SHAHRISABZ") || norm.includes("NISHON")) return "Qashqadaryo viloyati";
  if (norm.includes("SAMARQAND") || norm.includes("JOMBOY") || norm.includes("PASTDARG") || norm.includes("URGUT")) return "Samarqand viloyati";
  if (norm.includes("SIRDARYO") || norm.includes("GULISTON")) return "Sirdaryo viloyati";
  if (norm.includes("SURXONDARYO") || norm.includes("TERMIZ") || norm.includes("DENOV")) return "Surxondaryo viloyati";

  // Default fallback if already matched title case
  for (const reg of UZBEKISTAN_OFFICIAL_REGIONS) {
    if (reg.toLowerCase() === raw.trim().toLowerCase()) return reg;
  }

  return "Toshkent shahri";
}

/**
 * Detects gender from name suffixes and explicit keywords
 */
export function detectGender(name: string, rawText?: string): "male" | "female" {
  if (rawText && /(?:jinsi|gender):\s*(?:ayol|female|woman)/i.test(rawText)) {
    return "female";
  }
  if (rawText && /(?:jinsi|gender):\s*(?:erkak|male|man)/i.test(rawText)) {
    return "male";
  }

  if (!name) return "male";
  const parts = name.toLowerCase().split(/[\s'’‘`_-]+/);
  const isFemale = parts.some(part =>
    part.endsWith("ova") ||
    part.endsWith("eva") ||
    part.endsWith("yeva") ||
    part.endsWith("ina") ||
    part.endsWith("qizi") ||
    part.endsWith("kyzy") ||
    part.endsWith("gizi")
  );

  return isFemale ? "female" : "male";
}

/**
 * Normalizes phone numbers into standard format e.g. +998 90 123 45 67
 */
export function formatPhoneNumber(raw: string): string {
  if (!raw) return "+998 90 123 45 67";
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("998")) digits = digits.slice(3);
  digits = digits.slice(0, 9);
  if (digits.length < 9) {
    digits = digits.padEnd(9, "0");
  }

  return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
}

/**
 * Parses raw info.txt content into a structured object
 */
export function parseInfoTxt(raw: string, folderNameFallback = ""): ParsedParticipantInfo {
  const getMatch = (regex: RegExp): string => {
    const m = raw.match(regex);
    return m && m[1] ? m[1].trim() : "";
  };

  const name =
    getMatch(/(?:^|\r?\n)(?:name|fio|ism|muassis):\s*(.+)/i) ||
    folderNameFallback ||
    "Ishtirokchi";

  const rawRegion =
    getMatch(/(?:^|\r?\n)(?:location|viloyat|hudud|shahar):\s*(.+)/i) ||
    "Toshkent shahri";
  const region = normalizeRegionName(rawRegion);

  const ageStr = getMatch(/(?:^|\r?\n)(?:age|yosh):\s*(\d+)/i);
  const age = ageStr ? parseInt(ageStr, 10) : 25;

  const phoneRaw = getMatch(/(?:^|\r?\n)(?:phone|tel|telefon):\s*(.+)/i);
  const phone = formatPhoneNumber(phoneRaw);

  const brand =
    getMatch(/(?:^|\r?\n)(?:industry name|brend|brand|loyiha nomi):\s*(.+)/i) ||
    folderNameFallback ||
    "Brend";

  const legal =
    getMatch(/(?:^|\r?\n)(?:yuridik name|yuridik nomi|legal name):\s*(.+)/i) ||
    brand;

  let about = "";
  const aboutMatch = raw.match(
    /(?:about business|biznes haqida|loyiha haqida):\s*([\s\S]*?)(?=\r?\n(?:maqsad|potential impact|yuridik name|phone|age|viloyat|location):|$)/i
  );
  if (aboutMatch) {
    about = aboutMatch[1].trim();
  }

  const goals: string[] = [];
  const goalsMatch = raw.match(
    /(?:maqsad|maqsadlar|goals):\s*([\s\S]*?)(?=\r?\n(?:potential impact|kutilayotgan ta'sir|yuridik name|about business):|$)/i
  );
  if (goalsMatch) {
    goalsMatch[1]
      .split(/\r?\n/)
      .map(l => l.replace(/^[-•*0-9.)\s]+/, "").trim())
      .filter(l => l.length > 3)
      .forEach(g => goals.push(g));
  }

  const impact: string[] = [];
  const impactMatch = raw.match(
    /(?:potential impact|kutilayotgan ta'sir|natija):\s*([\s\S]*?)(?=\r?\n(?:maqsad|yuridik name|about business):|$)/i
  );
  if (impactMatch) {
    impactMatch[1]
      .split(/\r?\n/)
      .map(l => l.replace(/^[-•*0-9.)\s]+/, "").trim())
      .filter(l => l.length > 3)
      .forEach(i => impact.push(i));
  }

  const gender = detectGender(name, raw);

  // Category detection heuristic
  const isStartup =
    /(?:startup|startap|texnologiya|platforma|ilova|dastur|it|ai)/i.test(brand) ||
    /(?:startup|startap|platforma|ilova|dasturiy)/i.test(about);
  const category: "business" | "startup" = isStartup ? "startup" : "business";

  return {
    name,
    region,
    age,
    phone,
    brand,
    legal,
    about: about || "Loyiha bo'yicha batafsil ma'lumotlar taqdim etilgan.",
    goals: goals.length > 0 ? goals : ["Biznesni kengaytirish va yangi bosqichga olib chiqish."],
    impact: impact.length > 0 ? impact : ["Yangi ish o'rinlari yaratish va iqtisodiy o'sishni ta'minlash."],
    gender,
    category,
  };
}

/**
 * Sanitizes strings for storage paths and database keys (removes apostrophes, special characters)
 */
export function sanitizePath(str: string): string {
  return str
    .replace(/[\u2018\u2019\u02bc'ʼ`]/g, "") // remove all apostrophe variants
    .replace(/[^\w\s\-_.()]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Classifies an array of image files into 1 portrait file and N gallery files.
 * Uses founder name matching, filename keywords, and fallbacks.
 */
export function classifyImages(
  files: File[],
  founderName: string,
  folderName = ""
): { portrait: File | null; gallery: File[] } {
  if (files.length === 0) return { portrait: null, gallery: [] };
  if (files.length === 1) return { portrait: files[0], gallery: [] };

  const norm = (s: string) =>
    s
      .replace(/[\u2018\u2019\u02bc'ʼ`]/g, "")
      .toLowerCase()
      .replace(/[._\-]/g, " ")
      .trim();

  const normFounder = norm(founderName);
  const normFolder = norm(folderName);

  // 1. Exact match on filename without extension
  const getBaseName = (filename: string) => {
    const lastDot = filename.lastIndexOf(".");
    return lastDot !== -1 ? filename.substring(0, lastDot) : filename;
  };

  let portraitIndex = files.findIndex(f => {
    const base = norm(getBaseName(f.name));
    return (
      (normFounder && base === normFounder) ||
      (normFolder && base === normFolder) ||
      base === "portrait" ||
      base === "avatar" ||
      base === "profile"
    );
  });

  // 2. Partial match on founder's last or first name
  if (portraitIndex === -1 && normFounder) {
    const nameWords = normFounder.split(" ").filter(w => w.length > 2);
    portraitIndex = files.findIndex(f => {
      const base = norm(getBaseName(f.name));
      // Make sure it doesn't look like a presentation slide e.g. "Frame 123", "Slide 1"
      if (/frame|slide|presentation|page|slayd/i.test(base)) return false;
      return nameWords.some(word => base.includes(word));
    });
  }

  // 3. Fallback: pick the image that does NOT have "frame" or "slide" in name
  if (portraitIndex === -1) {
    portraitIndex = files.findIndex(f => !/frame|slide|slayd/i.test(f.name));
  }

  // 4. Default: first image
  if (portraitIndex === -1) {
    portraitIndex = 0;
  }

  const portrait = files[portraitIndex];
  const gallery = files.filter((_, idx) => idx !== portraitIndex);

  return { portrait, gallery };
}
