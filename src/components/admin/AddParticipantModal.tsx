import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  User,
  Building2,
  RefreshCw,
  Upload,
  Target,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import CustomSelect from "../CustomSelect";
import {
  sanitizePath,
  UZBEKISTAN_OFFICIAL_REGIONS,
} from "../../lib/participantParser";
import { optimizeImageForUpload } from "../../lib/imageOptimizer";
import { broadcastParticipantChange } from "../../lib/realtimeSync";

interface ExistingParticipant {
  id: string;
  founder: string;
  brand: string;
  region: string;
}

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function getWordTokens(str: string): string[] {
  return normalizeName(str)
    .replace(/[^a-z0-9'а-яёўқғҳ]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .sort();
}

function isNameDuplicate(input: string, existing: string): boolean {
  const normInput = normalizeName(input);
  const normExisting = normalizeName(existing);
  if (!normInput || !normExisting) return false;

  if (normInput === normExisting) return true;

  const tokensInput = getWordTokens(input);
  const tokensExisting = getWordTokens(existing);
  if (
    tokensInput.length > 1 &&
    tokensExisting.length > 1 &&
    tokensInput.join(" ") === tokensExisting.join(" ")
  ) {
    return true;
  }

  if (
    tokensInput.length >= 2 &&
    tokensExisting.length >= 2 &&
    tokensInput.every((t) => tokensExisting.includes(t))
  ) {
    return true;
  }

  return false;
}

function isBrandDuplicate(input: string, existing: string): boolean {
  const normInput = input.toLowerCase().replace(/[^a-z0-9а-яёўқғҳ]/gi, "").trim();
  const normExisting = existing.toLowerCase().replace(/[^a-z0-9а-яёўқғҳ]/gi, "").trim();
  if (!normInput || !normExisting) return false;
  return normInput === normExisting;
}

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_USER_ID = "f8fdd430-05f6-4fd9-b662-bb40c7dfaf6a";
const BUCKET = "participant-media";

export default function AddParticipantModal({
  isOpen,
  onClose,
  onSuccess,
}: AddParticipantModalProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isLight = theme === "light";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ─── Form State ────────────────────────────────────────────────────────
  const [founderName, setFounderName] = useState("");
  const [age, setAge] = useState<number | "">(25);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [region, setRegion] = useState<string>("Toshkent shahri");

  const [brandName, setBrandName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [category, setCategory] = useState<"business" | "startup">("business");
  const [aboutBusiness, setAboutBusiness] = useState("");

  // Goals (Maqsad)
  const [goals, setGoals] = useState<string[]>([
    "Biznesni kengaytirish va yangi bosqichga olib chiqish.",
  ]);
  // Potential Impact (Potensial Ta'sir - ixtiyoriy)
  const [impacts, setImpacts] = useState<string[]>([]);

  // ─── Image State ───────────────────────────────────────────────────────
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const portraitInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [existingParticipants, setExistingParticipants] = useState<ExistingParticipant[]>([]);
  const [allowDuplicateOverride, setAllowDuplicateOverride] = useState(false);

  // Load existing participants on open to detect duplicates
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadExisting() {
      const { data } = await supabase
        .from("applications")
        .select("id, brand_name, legal_name, business_description, region")
        .eq("is_deleted", false);

      if (!isMounted || !data) return;

      const list: ExistingParticipant[] = data.map((app) => {
        const founderMatch = app.business_description?.match(/\[Founder:\s*([^\]]+)\]/i);
        const founder = founderMatch
          ? founderMatch[1].trim()
          : app.legal_name?.trim() || app.brand_name?.trim() || "";
        return {
          id: app.id,
          founder,
          brand: app.brand_name?.trim() || "",
          region: app.region || "",
        };
      });

      setExistingParticipants(list);
    }

    loadExisting();
    setAllowDuplicateOverride(false);

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Memoized duplicate checks
  const nameDuplicateMatch = useMemo(() => {
    if (!founderName.trim() || founderName.trim().length < 3) return null;
    return (
      existingParticipants.find((p) => isNameDuplicate(founderName, p.founder)) || null
    );
  }, [founderName, existingParticipants]);

  const brandDuplicateMatch = useMemo(() => {
    if (!brandName.trim() || brandName.trim().length < 2) return null;
    return (
      existingParticipants.find((p) => isBrandDuplicate(brandName, p.brand)) || null
    );
  }, [brandName, existingParticipants]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
      setAllowDuplicateOverride(false);
    }
  }, [isOpen]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (portraitPreview) URL.revokeObjectURL(portraitPreview);
      galleryPreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [portraitPreview, galleryPreviews]);

  if (!isOpen) return null;

  // Portrait selection
  const handleSelectPortrait = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (portraitPreview) URL.revokeObjectURL(portraitPreview);
    setPortraitFile(file);
    setPortraitPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  // Gallery selection
  const handleSelectGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      /\.(png|jpe?g|webp)$/i.test(f.name)
    );
    if (files.length === 0) return;

    setGalleryFiles((prev) => [...prev, ...files]);
    setGalleryPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  };

  // Swap Gallery image to Portrait (Zero misplacing safeguard)
  const handleSetAsPortrait = (galleryIndex: number) => {
    const selectedImg = galleryFiles[galleryIndex];
    const selectedPrev = galleryPreviews[galleryIndex];

    const prevPortrait = portraitFile;
    const prevPortraitPrev = portraitPreview;

    const newGallery = galleryFiles.filter((_, i) => i !== galleryIndex);
    const newPreviews = galleryPreviews.filter((_, i) => i !== galleryIndex);

    if (prevPortrait && prevPortraitPrev) {
      newGallery.push(prevPortrait);
      newPreviews.push(prevPortraitPrev);
    }

    setPortraitFile(selectedImg);
    setPortraitPreview(selectedPrev);
    setGalleryFiles(newGallery);
    setGalleryPreviews(newPreviews);
  };

  const handleRemoveGalleryImage = (index: number) => {
    const prev = galleryPreviews[index];
    if (prev) URL.revokeObjectURL(prev);

    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemovePortrait = () => {
    if (portraitPreview) URL.revokeObjectURL(portraitPreview);
    setPortraitFile(null);
    setPortraitPreview(null);
  };

  // Upload to Supabase Storage
  const uploadToStorage = async (file: File, storagePath: string): Promise<string> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const mimeMap: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
    };
    const contentType = mimeMap[ext] || "image/png";

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType, upsert: true });

    if (error) throw new Error(`Rasm yuklashda xatolik (${file.name}): ${error.message}`);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!founderName.trim()) {
      setErrorMessage("F.I.O. (Ism va familiya) kiritilishi shart.");
      return;
    }
    if (!brandName.trim()) {
      setErrorMessage("Brend yoki loyiha nomini kiriting.");
      return;
    }
    if (!portraitFile && !portraitPreview) {
      setErrorMessage("Iltimos, ishtirokchining asosiy fotosuratini (portret) yuklang.");
      return;
    }

    // Name & Brand duplicate safeguard
    if ((nameDuplicateMatch || brandDuplicateMatch) && !allowDuplicateOverride) {
      const dupReason = nameDuplicateMatch
        ? `Ism: "${nameDuplicateMatch.founder}" (Brend: ${nameDuplicateMatch.brand || "N/A"})`
        : `Brend: "${brandDuplicateMatch?.brand}" (Asoschi: ${brandDuplicateMatch?.founder || "N/A"})`;

      setErrorMessage(
        `⚠️ Takroriy ishtirokchi aniqlandi! ${dupReason} allaqachon mavjud. Takroriy qo'shishning oldi olindi. Agar bu boshqa shaxs bo'lsa, pastdagi tasdiqlash katakchasini belgilang.`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      setUploadStatus("Rasmlar optimizatsiya qilinmoqda...");
      const safeFolder = sanitizePath(founderName) || `participant_${Date.now()}`;

      // 1. Parallel Client-side Image Optimization
      const optPortraitPromise = portraitFile
        ? optimizeImageForUpload(portraitFile, 1200, 0.85)
        : Promise.resolve(null);

      const optGalleryPromises = galleryFiles.map((gf) =>
        optimizeImageForUpload(gf, 1600, 0.85)
      );

      const [optPortrait, ...optGallery] = await Promise.all([
        optPortraitPromise,
        ...optGalleryPromises,
      ]);

      setUploadStatus("Rasmlar yuklanmoqda (parallel)...");
      let portraitUrl: string | null = null;
      const galleryUrls: string[] = [];
      const uploadTasks: Promise<any>[] = [];

      // 2. Parallel upload for portrait
      if (optPortrait) {
        const ext = optPortrait.name.split(".").pop()?.toLowerCase() || "webp";
        const portraitPath = `${safeFolder}/portrait_${Date.now()}.${ext}`;
        uploadTasks.push(
          uploadToStorage(optPortrait, portraitPath).then((url) => {
            portraitUrl = url;
          })
        );
      }

      // 3. Parallel upload for gallery slides
      optGallery.forEach((gf, i) => {
        const safeName =
          sanitizePath(gf.name.replace(/\.[^/.]+$/, "")) +
          `_${Date.now()}_${i}.` +
          (gf.name.split(".").pop() || "webp");
        const galleryPath = `${safeFolder}/gallery/${safeName}`;
        uploadTasks.push(
          uploadToStorage(gf, galleryPath)
            .then((url) => {
              galleryUrls.push(url);
            })
            .catch((err) => {
              console.warn("Galereya rasmi yuklanmadi:", err);
            })
        );
      });

      await Promise.all(uploadTasks);

      // 4. Format payload & Database insert
      setUploadStatus("Ma'lumotlar saqlanmoqda...");
      const cleanGoals = goals.filter((g) => g.trim().length > 0);
      const cleanImpacts = impacts.filter((i) => i.trim().length > 0);

      const descriptionWithTags = `${aboutBusiness.trim() || "Loyiha bo'yicha ma'lumotlar taqdim etilgan."} [Founder: ${founderName.trim()}] [Gender: ${gender}]`;

      const newApp = {
        user_id: user?.id || DEFAULT_USER_ID,
        category,
        age: Number(age) || 25,
        region: region.trim(),
        brand_name: brandName.trim(),
        legal_name: legalName.trim() || brandName.trim(),
        business_description: descriptionWithTags,
        goals: cleanGoals.length > 0 ? cleanGoals : ["Biznesni rivojlantirish va yangi bosqichga olib chiqish."],
        potential_impact: cleanImpacts,
        product_image_url: portraitUrl,
        product_image_urls: galleryUrls,
        avatar_url: portraitUrl,
        status: "under_review",
        gender,
        is_deleted: false,
      };

      const { data: insertedData, error: insertErr } = await supabase
        .from("applications")
        .insert(newApp as any)
        .select();

      if (insertErr) {
        throw new Error(`Ma'lumotlar bazasiga saqlashda xatolik: ${insertErr.message}`);
      }

      // 5. Broadcast change instantly to ALL connected devices (phones, laptops, tabs)
      await broadcastParticipantChange("added", {
        id: insertedData?.[0]?.id,
        name: founderName.trim(),
        brand: brandName.trim(),
      });

      // 6. Reset form fields
      setFounderName("");
      setBrandName("");
      setLegalName("");
      setAboutBusiness("");
      setPortraitFile(null);
      setPortraitPreview(null);
      setGalleryFiles([]);
      setGalleryPreviews([]);
      setGoals(["Biznesni kengaytirish va yangi bosqichga olib chiqish."]);
      setImpacts([]);

      setSuccessMessage(`"${founderName}" (${brandName}) muvaffaqiyatli qo'shildi!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Kutilmagan xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
      setUploadStatus("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      data-lenis-prevent
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl z-10 overflow-hidden ${
          isLight ? "bg-white border-slate-200" : "bg-[#0b0e14] border-white/10 text-white"
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
            isLight ? "border-slate-100 bg-slate-50/80" : "border-white/5 bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00A8FF] to-blue-600 flex items-center justify-center text-white shadow-md shadow-[#00A8FF]/20">
              <User size={20} />
            </div>
            <div>
              <h2
                className="text-lg sm:text-xl font-bold uppercase tracking-wider"
                style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.04em" }}
              >
                Yangi Ishtirokchi Qo'shish
              </h2>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-white/50"}`}>
                Nomzodning shaxsiy ma'lumotlari, biznes ko'rsatkichlari, maqsadi va fotosuratlarini kiriting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
              isLight
                ? "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                : "border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
            <CheckCircle2 size={16} className="shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 no-scrollbar">
          {/* ── 1. SHAXSIY MA'LUMOTLAR ── */}
          <div
            className={`p-5 rounded-2xl border flex flex-col gap-4 ${
              isLight ? "bg-slate-50/70 border-slate-200" : "bg-white/[0.02] border-white/10"
            }`}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <User size={16} className="text-[#00A8FF]" />
              <h3
                className="text-xs font-bold uppercase tracking-wider text-slate-400"
                style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.05em" }}
              >
                1. Shaxsiy Ma'lumotlar
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* F.I.O. */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                  F.I.O. (Ism-sharifi) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={founderName}
                  onChange={(e) => {
                    setFounderName(e.target.value);
                    setAllowDuplicateOverride(false);
                  }}
                  placeholder="Masalan: Abbasov Abdullo"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border transition-all ${
                    nameDuplicateMatch
                      ? "border-emerald-500 bg-emerald-500/5 focus:border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold"
                      : isLight
                      ? "bg-white border-slate-300 text-slate-900 focus:border-[#00A8FF]"
                      : "bg-white/5 border-white/15 text-white focus:border-[#00A8FF]"
                  }`}
                />
                {nameDuplicateMatch && (
                  <div
                    className={`mt-2 p-3 rounded-xl border flex items-start gap-2.5 transition-all animate-fade-in ${
                      isLight
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    }`}
                  >
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                      <p className="font-bold flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                        <span>Ushbu ishtirokchi tizimda mavjud!</span>
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          ID: ...{nameDuplicateMatch.id.slice(-6)}
                        </span>
                      </p>
                      <p className="mt-1 text-slate-700 dark:text-white/80">
                        Ism: <strong className="text-slate-900 dark:text-white font-semibold">"{nameDuplicateMatch.founder}"</strong>
                        {nameDuplicateMatch.brand ? ` | Brend: "${nameDuplicateMatch.brand}"` : ""}
                        {nameDuplicateMatch.region ? ` | Hudud: ${nameDuplicateMatch.region}` : ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Viloyat (Dropdown) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                  Viloyat / Hudud
                </label>
                <CustomSelect
                  value={region}
                  onChange={setRegion}
                  options={UZBEKISTAN_OFFICIAL_REGIONS.map((r) => ({ value: r, label: r }))}
                />
              </div>

              {/* Yosh */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                  Yoshi
                </label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setAge(val === "" ? "" : parseInt(val, 10));
                  }}
                  placeholder="25"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border transition-all ${
                    isLight
                      ? "bg-white border-slate-300 text-slate-900 focus:border-[#00A8FF]"
                      : "bg-white/5 border-white/15 text-white focus:border-[#00A8FF]"
                  }`}
                />
              </div>

              {/* Jinsi (Dropdown) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                  Jinsi
                </label>
                <CustomSelect
                  value={gender}
                  onChange={(v) => setGender(v as "male" | "female")}
                  options={[
                    { value: "male", label: "Erkak" },
                    { value: "female", label: "Ayol" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* ── 2. BIZNES VA LOYIHA MA'LUMOTLARI ── */}
          <div
            className={`p-5 rounded-2xl border flex flex-col gap-4 ${
              isLight ? "bg-slate-50/70 border-slate-200" : "bg-white/[0.02] border-white/10"
            }`}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Building2 size={16} className="text-[#00A8FF]" />
              <h3
                className="text-xs font-bold uppercase tracking-wider text-slate-400"
                style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.05em" }}
              >
                2. Biznes va Loyiha Ma'lumotlari
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Brend nomi */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                  Brend / Loyiha Nomi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => {
                    setBrandName(e.target.value);
                    setAllowDuplicateOverride(false);
                  }}
                  placeholder="Masalan: BERT AGRO"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border transition-all ${
                    brandDuplicateMatch
                      ? "border-emerald-500 bg-emerald-500/5 focus:border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold"
                      : isLight
                      ? "bg-white border-slate-300 text-slate-900 focus:border-[#00A8FF]"
                      : "bg-white/5 border-white/15 text-white focus:border-[#00A8FF]"
                  }`}
                />
                {brandDuplicateMatch && (
                  <div
                    className={`mt-2 p-3 rounded-xl border flex items-start gap-2.5 transition-all animate-fade-in ${
                      isLight
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    }`}
                  >
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                      <p className="font-bold flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                        <span>Ushbu brend tizimda mavjud!</span>
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          ID: ...{brandDuplicateMatch.id.slice(-6)}
                        </span>
                      </p>
                      <p className="mt-1 text-slate-700 dark:text-white/80">
                        Brend: <strong className="text-slate-900 dark:text-white font-semibold">"{brandDuplicateMatch.brand}"</strong>
                        {brandDuplicateMatch.founder ? ` | Asoschi: "${brandDuplicateMatch.founder}"` : ""}
                        {brandDuplicateMatch.region ? ` | Hudud: ${brandDuplicateMatch.region}` : ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Yuridik nomi */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                  Yuridik Tashkilot Nomi
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Masalan: 'BERT AGRO' MChJ"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border transition-all ${
                    isLight
                      ? "bg-white border-slate-300 text-slate-900 focus:border-[#00A8FF]"
                      : "bg-white/5 border-white/15 text-white focus:border-[#00A8FF]"
                  }`}
                />
              </div>

              {/* Yo'nalish (Dropdown) */}
              <div className="sm:col-span-2 md:col-span-4">
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                  Yo'nalish (Kategoriya)
                </label>
                <CustomSelect
                  value={category}
                  onChange={(v) => setCategory(v as any)}
                  options={[
                    { value: "business", label: "An'anaviy Biznes" },
                    { value: "startup", label: "Startap" },
                  ]}
                />
              </div>

              {/* Biznes haqida tavsif */}
              <div className="sm:col-span-2 md:col-span-4">
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                  Biznes Haqida Qisqacha Tavsif
                </label>
                <textarea
                  rows={3}
                  value={aboutBusiness}
                  onChange={(e) => setAboutBusiness(e.target.value)}
                  placeholder="Korxona faoliyati, ishlab chiqarilayotgan mahsulot yoki xizmatlar haqida ma'lumot..."
                  className={`w-full p-3.5 rounded-xl text-sm outline-none border transition-all ${
                    isLight
                      ? "bg-white border-slate-300 text-slate-900 focus:border-[#00A8FF]"
                      : "bg-white/5 border-white/15 text-white focus:border-[#00A8FF]"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* ── 3. MAQSAD (BOSHQACHA KARTOCHKALARDAGI KABI MAQSAD BO'LIMI) ── */}
          <div
            className={`rounded-2xl border px-5 py-4 transition-all ${
              isLight ? "bg-white/90 border-slate-200/90 shadow-xs" : "bg-white/3 border-white/8"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target size={15} className="text-[#00A8FF]" />
                <p
                  className={`text-[11px] uppercase tracking-widest font-bold ${
                    isLight ? "text-slate-600" : "text-white/60"
                  }`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  Maqsad
                </p>
              </div>

              <button
                type="button"
                onClick={() => setGoals((prev) => [...prev, ""])}
                className="flex items-center gap-1.5 text-xs text-[#00A8FF] hover:text-[#38bdf8] font-bold py-1 px-2.5 rounded-lg hover:bg-[#00A8FF]/10 transition-colors cursor-pointer"
                style={{ fontFamily: "var(--font-button)" }}
              >
                <Plus size={13} />
                <span>Yana qo'shish</span>
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {goals.map((goal, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#00A8FF] shrink-0" />
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) =>
                      setGoals((prev) =>
                        prev.map((item, idx) => (idx === i ? e.target.value : item))
                      )
                    }
                    placeholder={`Maqsad ${i + 1}`}
                    className={`flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isLight
                        ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#00A8FF] focus:ring-2 focus:ring-[#00A8FF]/20"
                        : "bg-white/[0.08] border-white/20 text-white placeholder:text-white/40 focus:border-[#00A8FF] focus:bg-white/[0.12]"
                    }`}
                  />
                  {goals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setGoals((prev) => prev.filter((_, idx) => idx !== i))}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                        isLight
                          ? "border-slate-300 text-slate-400 hover:text-red-500 hover:border-red-300 bg-white"
                          : "border-white/20 text-white/40 hover:text-red-400 hover:border-red-500/40 bg-white/5"
                      }`}
                      title="O'chirish"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Optional Potensial Ta'sir */}
            <div className="pt-3 border-t border-white/5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <p
                  className={`text-[11px] uppercase tracking-widest font-bold ${
                    isLight ? "text-slate-600" : "text-white/60"
                  }`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  Potensial Ta'sir <span className="text-[10px] font-normal lowercase opacity-70">(ixtiyoriy)</span>
                </p>

                <button
                  type="button"
                  onClick={() => setImpacts((prev) => [...prev, ""])}
                  className="flex items-center gap-1.5 text-xs text-emerald-500 hover:text-emerald-400 font-bold py-1 px-2.5 rounded-lg hover:bg-emerald-500/10 transition-colors cursor-pointer"
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  <Plus size={13} />
                  <span>Ta'sir qo'shish</span>
                </button>
              </div>

              {impacts.length === 0 ? (
                <p className={`text-xs italic ${isLight ? "text-slate-400" : "text-white/40"}`}>
                  Agar kiritilmasa, kartochkada "Potensial ta'sir" bo'limi ko'rsatilmaydi.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {impacts.map((impact, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <input
                        type="text"
                        value={impact}
                        onChange={(e) =>
                          setImpacts((prev) =>
                            prev.map((item, idx) => (idx === i ? e.target.value : item))
                          )
                        }
                        placeholder={`Kutilayotgan ta'sir yoki natija ${i + 1}`}
                        className={`flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                          isLight
                            ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            : "bg-white/[0.08] border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500 focus:bg-white/[0.12]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setImpacts((prev) => prev.filter((_, idx) => idx !== i))}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                          isLight
                            ? "border-slate-300 text-slate-400 hover:text-red-500 hover:border-red-300 bg-white"
                            : "border-white/20 text-white/40 hover:text-red-400 hover:border-red-500/40 bg-white/5"
                        }`}
                        title="O'chirish"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── 4. RASMLAR (PORTRET VA GALEREYA) ── */}
          <div
            className={`p-5 rounded-2xl border flex flex-col gap-4 ${
              isLight ? "bg-slate-50/70 border-slate-200" : "bg-white/[0.02] border-white/10"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-[#00A8FF]" />
                <h3
                  className="text-xs font-bold uppercase tracking-wider text-slate-400"
                  style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.05em" }}
                >
                  4. Fotosuratlar (Portret va Taqdimot Slaydlari)
                </h3>
              </div>
              <span className="text-[11px] text-[#00A8FF]">
                Rasm chalkashib ketmasligi uchun alohida boshqaruv
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Asosiy Portret */}
              <div className="md:col-span-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    Asosiy Portret (Avatar) <span className="text-rose-500">*</span>
                  </label>
                  {portraitFile && (
                    <button
                      type="button"
                      onClick={handleRemovePortrait}
                      className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                    >
                      O'chirish
                    </button>
                  )}
                </div>

                <div
                  onClick={() => !portraitPreview && portraitInputRef.current?.click()}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 flex flex-col items-center justify-center transition-all ${
                    portraitPreview
                      ? "border-emerald-500 shadow-md shadow-emerald-500/15"
                      : isLight
                      ? "border-dashed border-slate-300 bg-white hover:border-[#00A8FF] cursor-pointer"
                      : "border-dashed border-white/20 bg-white/5 hover:border-[#00A8FF] cursor-pointer"
                  }`}
                >
                  {portraitPreview ? (
                    <>
                      <img
                        src={portraitPreview}
                        alt="Portrait preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                        PORTRET
                      </div>
                      <button
                        type="button"
                        onClick={() => portraitInputRef.current?.click()}
                        className="absolute bottom-2.5 inset-x-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-black text-[11px] text-white font-semibold transition-colors cursor-pointer text-center"
                      >
                        O'zgartirish
                      </button>
                    </>
                  ) : (
                    <div className="p-4 text-center flex flex-col items-center gap-2 text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-[#00A8FF]/15 text-[#00A8FF] flex items-center justify-center">
                        <Upload size={20} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-white">
                        Portret fotosurat yuklash
                      </span>
                      <span className="text-[10px]">PNG, JPG yoki WebP (3:4)</span>
                    </div>
                  )}
                </div>
                <input
                  ref={portraitInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleSelectPortrait}
                />
              </div>

              {/* Qo'shimcha Taqdimot Slaydlari / Galereya */}
              <div className="md:col-span-8 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Qo'shimcha Taqdimot Slaydlari ({galleryFiles.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      isLight
                        ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        : "border-white/20 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    <Plus size={13} /> Slayd qo'shish
                  </button>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleSelectGallery}
                  />
                </div>

                {galleryPreviews.length === 0 ? (
                  <div
                    onClick={() => galleryInputRef.current?.click()}
                    className={`h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center gap-2 cursor-pointer transition-all ${
                      isLight
                        ? "border-slate-300 bg-white hover:border-[#00A8FF]"
                        : "border-white/15 bg-white/5 hover:border-[#00A8FF]"
                    }`}
                  >
                    <ImageIcon size={28} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-400">
                      Taqdimot slaydlari yoki mahsulot fotosuratlarini tanlang
                    </span>
                    <span className="text-[11px] text-[#00A8FF] font-bold">
                      + Fayllarni tanlash
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {galleryPreviews.map((src, idx) => (
                      <div
                        key={idx}
                        className={`group relative aspect-video rounded-xl overflow-hidden border transition-all ${
                          isLight ? "border-slate-200 bg-white" : "border-white/10 bg-black/40"
                        }`}
                      >
                        <img
                          src={src}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono font-bold">
                          Slayd {idx + 1}
                        </div>

                        {/* Swap & Delete Overlay */}
                        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                          <button
                            type="button"
                            onClick={() => handleSetAsPortrait(idx)}
                            className="w-full px-2 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider transition-colors shadow flex items-center justify-center gap-1 cursor-pointer"
                            title="Bu rasmni asosiy portret o'rniga o'rnatish"
                          >
                            <RefreshCw size={12} />
                            <span>Portret qilish</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="p-1 rounded-lg bg-rose-500/40 hover:bg-rose-500 text-rose-200 hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between shrink-0 ${
            isLight ? "border-slate-100 bg-slate-50/80" : "border-white/5 bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center gap-3">
            {(nameDuplicateMatch || brandDuplicateMatch) && (
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <input
                  type="checkbox"
                  checked={allowDuplicateOverride}
                  onChange={(e) => setAllowDuplicateOverride(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 cursor-pointer accent-emerald-500"
                />
                <span>Baribir saqlash (boshqa shaxs)</span>
              </label>
            )}
            <span className={`text-xs ${isLight ? "text-slate-500" : "text-white/50"}`}>
              Barcha maydonlar to'g'riligini tasdiqlang
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                isLight
                  ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  : "bg-white/10 text-white/80 hover:bg-white/15"
              }`}
              style={{ fontFamily: "var(--font-zuume)" }}
            >
              Bekor Qilish
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00A8FF] to-blue-600 hover:from-[#0090FF] hover:to-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#00A8FF]/25 hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              style={{ fontFamily: "var(--font-zuume)" }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{uploadStatus || "Saqlanmoqda..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Ishtirokchini Saqlash</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
