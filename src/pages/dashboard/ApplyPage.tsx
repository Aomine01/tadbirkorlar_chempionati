import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Upload, ArrowLeft, ArrowRight, CheckCircle2, Moon, Sun } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";
import type { ApplicationInsert } from "../../types/database";
import HeroImage from "../../assets/img/hero-image.png";
import HeroLightImage from "../../assets/imglight/herolight.png";
import CustomSelect from "../../components/CustomSelect";

/* ─── Constants ────────────────────────────────────── */

const UZBEKISTAN_REGIONS = [
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
];

const CATEGORIES = [
  { value: "startup", label: "Startap", desc: "Tez o'suvchi texnologik biznes" },
  { value: "business", label: "An'anaviy Biznes", desc: "Allaqachon ishlayotgan biznes" },
] as const;

const MAX_FILE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/* ─── Schemas ──────────────────────────────────────── */

const step1Schema = z.object({
  full_name: z.string().min(2, "Kamida 2 ta belgi"),
  age: z.coerce
    .number({ message: "Yoshingizni kiriting" })
    .min(14, "Minimal yosh 14")
    .max(40, "Maksimal yosh 40"),
  phone_number: z.string().min(9, "Telefon raqamini kiriting"),
  region: z.string().min(1, "Viloyatni tanlang"),
  gender: z.enum(["male", "female"], { message: "Jinsingizni tanlang" }),
});

const step2Schema = z.object({
  category: z.enum(["startup", "business"], {
    message: "Yo'nalishni tanlang",
  }),
  brand_name: z.string().min(2, "Brand nomini kiriting"),
  legal_name: z.string().min(2, "Yuridik nomni kiriting"),
  business_description: z.string().min(50, "Kamida 50 ta belgi tavsif yozing"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

const formatPhone = (raw: string): string => {
  let digits = raw.replace(/\D/g, "");
  // Remove leading 998 prefix if present, keep only local 9 digits
  if (digits.startsWith("998")) digits = digits.slice(3);
  digits = digits.slice(0, 9);

  let out = "+998(";
  if (digits.length > 0) out += digits.slice(0, 2);
  if (digits.length >= 2) out += ")";
  if (digits.length > 2) out += digits.slice(2, 5);
  if (digits.length > 5) out += "-" + digits.slice(5, 7);
  if (digits.length > 7) out += "-" + digits.slice(7, 9);
  return out;
};

/* ─── Shared Input ─────────────────────────────────── */

const InputField = ({
  label,
  error,
  type = "text",
  isLight = false,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  isLight?: boolean;
}) => (
  <div>
    <label
      className={`block text-xs font-bold mb-2 uppercase tracking-wider ${
        isLight ? "text-slate-800" : "text-white/90"
      }`}
      style={{ fontFamily: "var(--font-button)" }}
    >
      {label}
    </label>
    <input
      type={type}
      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 ${
        isLight
          ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#00A8FF] focus:ring-2 focus:ring-[#00A8FF]/20"
          : "bg-white/[0.08] border-white/20 text-white placeholder:text-white/40 focus:border-[#00A8FF] focus:bg-white/[0.12]"
      } ${error ? "border-red-500 ring-1 ring-red-500/30" : ""}`}
      {...rest}
    />
    {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
  </div>
);

/* ─── Dynamic Array Input ──────────────────────────── */

const DynamicList = ({
  label,
  placeholder,
  items,
  onChange,
  error,
  isLight = false,
}: {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
  error?: string;
  isLight?: boolean;
}) => {
  const add = () => onChange([...items, ""]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, val: string) =>
    onChange(items.map((item, idx) => (idx === i ? val : item)));

  return (
    <div>
      <label
        className={`block text-xs font-bold mb-2 uppercase tracking-wider ${
          isLight ? "text-slate-800" : "text-white/90"
        }`}
        style={{ fontFamily: "var(--font-button)" }}
      >
        {label}
      </label>
      <div className="flex flex-col gap-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={`${placeholder} ${i + 1}`}
              className={`flex-1 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                isLight
                  ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#00A8FF] focus:ring-2 focus:ring-[#00A8FF]/20"
                  : "bg-white/[0.08] border-white/20 text-white placeholder:text-white/40 focus:border-[#00A8FF] focus:bg-white/[0.12]"
              }`}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                  isLight
                    ? "border-slate-300 text-slate-400 hover:text-red-500 hover:border-red-300 bg-white"
                    : "border-white/20 text-white/40 hover:text-red-400 hover:border-red-500/40 bg-white/5"
                }`}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-2 text-xs text-[#00A8FF] hover:text-[#38bdf8] font-bold py-2 transition-colors cursor-pointer self-start"
          style={{ fontFamily: "var(--font-button)" }}
        >
          <Plus size={14} /> Yana qo'shish
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
};

/* ─── Avatar Upload (single, required) ────────────── */

const AvatarUpload = ({
  label,
  preview,
  onFile,
  required,
  error,
  isLight = false,
}: {
  label: string;
  preview: string | null;
  onFile: (file: File) => void;
  required?: boolean;
  error?: string;
  isLight?: boolean;
}) => {
  const ref = useRef<HTMLInputElement>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Faqat JPEG, PNG yoki WebP formatdagi rasmlar qabul qilinadi");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      alert(`Fayl hajmi ${MAX_FILE_MB}MB dan oshmasligi kerak`);
      return;
    }
    onFile(file);
  };

  return (
    <div>
      <label
        className={`block text-xs font-bold mb-2 uppercase tracking-wider ${
          isLight ? "text-slate-800" : "text-white/90"
        }`}
        style={{ fontFamily: "var(--font-button)" }}
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div
        onClick={() => ref.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${
          error
            ? "border-red-500/60"
            : isLight
            ? "border-slate-300 bg-white hover:border-[#00A8FF] hover:bg-slate-50 shadow-xs"
            : "border-white/20 bg-white/[0.06] hover:border-[#00A8FF] hover:bg-white/[0.1]"
        } ${preview ? "aspect-video" : "h-36"}`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
              <Upload size={20} className="text-white" />
              <span className="ml-2 text-xs text-white font-semibold">O'zgartirish</span>
            </div>
          </>
        ) : (
          <div
            className={`h-full flex flex-col items-center justify-center gap-2 ${
              isLight ? "text-slate-600" : "text-white/80"
            }`}
          >
            <Upload size={26} className="text-[#00A8FF]" />
            <span className="text-xs font-bold">Fotosurat yuklash (max {MAX_FILE_MB}MB)</span>
            <span className={`text-[10px] ${isLight ? "text-slate-400" : "text-white/50"}`}>
              JPEG, PNG, WebP
            </span>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept={ALLOWED_TYPES.join(",")} onChange={handle} className="hidden" />
      {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
};

/* ─── Multi Product Image Upload (up to 4) ─────────── */

const MAX_PRODUCT_IMAGES = 4;

const MultiImageUpload = ({
  label,
  previews,
  onAdd,
  onRemove,
  isLight = false,
}: {
  label: string;
  previews: string[];
  onAdd: (file: File) => void;
  onRemove: (index: number) => void;
  isLight?: boolean;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const canAdd = previews.length < MAX_PRODUCT_IMAGES;

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Faqat JPEG, PNG yoki WebP formatdagi rasmlar qabul qilinadi");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      alert(`Fayl hajmi ${MAX_FILE_MB}MB dan oshmasligi kerak`);
      return;
    }
    onAdd(file);
    e.target.value = "";
  };

  return (
    <div>
      <label
        className={`block text-xs font-bold mb-2 uppercase tracking-wider ${
          isLight ? "text-slate-800" : "text-white/90"
        }`}
        style={{ fontFamily: "var(--font-button)" }}
      >
        {label}
        <span className={`ml-2 normal-case font-normal ${isLight ? "text-slate-500" : "text-white/50"}`}>
          (ixtiyoriy, max {MAX_PRODUCT_IMAGES} ta rasm)
        </span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        {previews.map((src, i) => (
          <div
            key={i}
            className={`relative aspect-video rounded-xl overflow-hidden border group ${
              isLight ? "border-slate-300 bg-white" : "border-white/20 bg-white/5"
            }`}
          >
            <img src={src} alt={`Mahsulot ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/75 text-white hover:text-red-400 hover:bg-black transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
            >
              <Trash2 size={13} />
            </button>
            <div className="absolute bottom-1.5 left-2 text-[10px] text-white font-medium bg-black/60 px-2 py-0.5 rounded">
              {i + 1}/{MAX_PRODUCT_IMAGES}
            </div>
          </div>
        ))}

        {canAdd && (
          <div
            onClick={() => ref.current?.click()}
            className={`aspect-video rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${
              isLight
                ? "border-slate-300 bg-white hover:border-[#00A8FF] hover:bg-slate-50 text-slate-600"
                : "border-white/20 bg-white/[0.06] hover:border-[#00A8FF] hover:bg-white/[0.1] text-white/80"
            }`}
          >
            <Plus size={24} className="text-[#00A8FF]" />
            <span className="text-xs font-bold">Rasm qo'shish</span>
            <span className={`text-[10px] ${isLight ? "text-slate-400" : "text-white/40"}`}>
              {previews.length}/{MAX_PRODUCT_IMAGES}
            </span>
          </div>
        )}
      </div>

      <input ref={ref} type="file" accept={ALLOWED_TYPES.join(",")} onChange={handle} className="hidden" />
    </div>
  );
};

/* ─── Step Indicator ───────────────────────────────── */

const StepIndicator = ({
  current,
  total,
  isLight = false,
}: {
  current: number;
  total: number;
  isLight?: boolean;
}) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-2 rounded-full flex-1 transition-all duration-500 ${
          i < current
            ? "bg-[#00A8FF]"
            : i === current
            ? "bg-[#00A8FF]/80 shadow-[0_0_10px_rgba(0,168,255,0.4)]"
            : isLight
            ? "bg-slate-200"
            : "bg-white/15"
        }`}
      />
    ))}
    <span
      className={`text-xs font-mono font-bold ml-2 ${isLight ? "text-slate-500" : "text-white/70"}`}
      style={{ fontFamily: "var(--font-button)" }}
    >
      {current + 1}/{total}
    </span>
  </div>
);

/* ─── Page ─────────────────────────────────────────── */

interface FormData {
  full_name: string;
  age: number;
  phone_number: string;
  region: string;
  gender: "male" | "female";
  category: "startup" | "business";
  brand_name: string;
  legal_name: string;
  business_description: string;
  goals: string[];
  potential_impact: string[];
  avatarFile: File | null;
  avatarPreview: string | null;
  productFiles: File[];
  productPreviews: string[];
}

const STEP_TITLES = [
  "Shaxsiy ma'lumotlar",
  "Biznes ma'lumotlari",
  "Maqsad va ta'sir",
  "Rasm yuklash",
];

const ApplyPage = () => {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [existingAppId, setExistingAppId] = useState<string | null>(null);

  // Check for duplicate applications — allow reapplication if previously rejected and re-apply is allowed
  useEffect(() => {
    if (!user) return;
    supabase
      .from("applications")
      .select("id, status, rejection_comment")
      .eq("user_id", user.id)
      .eq("is_deleted", false)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const isBlocked = data.rejection_comment?.includes("[Reapply: blocked]");
          if (data.status === "rejected" && !isBlocked) {
            setExistingAppId(data.id);
            setAlreadyApplied(false);
          } else {
            setAlreadyApplied(true);
          }
        }
      });
  }, [user]);

  // Step-level errors
  const [step3Errors, setStep3Errors] = useState<{ goals?: string; impact?: string }>({});
  const [step4Errors, setStep4Errors] = useState<{ avatar?: string }>({});

  const [formData, setFormData] = useState<FormData>({
    full_name: profile?.full_name ?? "",
    age: 0,
    phone_number: profile?.phone_number ?? "",
    region: "",
    gender: "male",
    category: "startup",
    brand_name: "",
    legal_name: "",
    business_description: "",
    goals: [""],
    potential_impact: [""],
    avatarFile: null,
    avatarPreview: null,
    productFiles: [],
    productPreviews: [],
  });

  /* Step 1 form */
  const step1Form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      full_name: profile?.full_name ?? "",
      phone_number: profile?.phone_number ? formatPhone(profile.phone_number) : "",
      gender: "male" as const,
    },
  });

  /* Step 2 form */
  const step2Form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: { category: "startup" as const },
  });

  // Pre-fill from profile when it loads
  useEffect(() => {
    if (profile) {
      const formattedPhone = formatPhone(profile.phone_number || "");
      setFormData((prev) => ({
        ...prev,
        full_name: profile.full_name,
        phone_number: formattedPhone,
      }));
      step1Form.setValue("full_name", profile.full_name);
      step1Form.setValue("phone_number", formattedPhone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  /* Navigate forward with validation */
  const nextStep = async () => {
    if (step === 0) {
      const valid = await step1Form.trigger();
      if (!valid) return;
      const vals = step1Form.getValues() as Step1Data;
      setFormData((p) => ({ ...p, ...vals }));
    }
    if (step === 1) {
      const valid = await step2Form.trigger();
      if (!valid) return;
      const vals = step2Form.getValues() as Step2Data;
      setFormData((p) => ({ ...p, ...vals }));
    }
    if (step === 2) {
      const errors: { goals?: string; impact?: string } = {};
      const validGoals = formData.goals.filter((g) => g.trim().length > 0);
      const validImpact = formData.potential_impact.filter((i) => i.trim().length > 0);
      if (validGoals.length === 0) errors.goals = "Kamida bitta maqsad kiriting";
      if (validImpact.length === 0) errors.impact = "Kamida bitta ta'sir kiriting";
      if (Object.keys(errors).length > 0) {
        setStep3Errors(errors);
        return;
      }
      setStep3Errors({});
    }
    setStep((p) => p + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setStep((p) => p - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Avatar select + compress */
  const handleAvatarSelect = async (file: File) => {
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });
      const preview = URL.createObjectURL(compressed);
      setFormData((p) => ({ ...p, avatarFile: compressed, avatarPreview: preview }));
      setStep4Errors((p) => ({ ...p, avatar: undefined }));
    } catch {
      const preview = URL.createObjectURL(file);
      setFormData((p) => ({ ...p, avatarFile: file, avatarPreview: preview }));
    }
  };

  /* Product image add + compress */
  const handleProductAdd = async (file: File) => {
    if (formData.productFiles.length >= MAX_PRODUCT_IMAGES) return;
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });
      const preview = URL.createObjectURL(compressed);
      setFormData((p) => ({
        ...p,
        productFiles: [...p.productFiles, compressed],
        productPreviews: [...p.productPreviews, preview],
      }));
    } catch {
      const preview = URL.createObjectURL(file);
      setFormData((p) => ({
        ...p,
        productFiles: [...p.productFiles, file],
        productPreviews: [...p.productPreviews, preview],
      }));
    }
  };

  const handleProductRemove = (index: number) => {
    setFormData((p) => ({
      ...p,
      productFiles: p.productFiles.filter((_, i) => i !== index),
      productPreviews: p.productPreviews.filter((_, i) => i !== index),
    }));
  };

  /* Upload file to Supabase storage */
  const uploadStorageFile = async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${folder}/${user!.id}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("application-media")
      .upload(path, file, { upsert: false });
    if (upErr) throw upErr;
    const { data: urlData } = supabase.storage
      .from("application-media")
      .getPublicUrl(path);
    return urlData.publicUrl;
  };

  /* Submit handler */
  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.avatarFile && !formData.avatarPreview) {
      setStep4Errors({ avatar: "Fotosurat yuklash majburiy" });
      return;
    }

    setSubmitting(true);
    setGlobalError(null);

    try {
      let avatarUrl = "";
      if (formData.avatarFile) {
        avatarUrl = await uploadStorageFile(formData.avatarFile, "avatars");
      }

      const productUrls: string[] = [];
      for (const pFile of formData.productFiles) {
        const url = await uploadStorageFile(pFile, "products");
        productUrls.push(url);
      }

      const validGoals = formData.goals.filter((g) => g.trim().length > 0);
      const validImpact = formData.potential_impact.filter((i) => i.trim().length > 0);
      const cleanPhone = formData.phone_number.replace(/\D/g, "");

      const payload: ApplicationInsert = {
        user_id: user.id,
        age: formData.age,
        region: formData.region,
        gender: formData.gender,
        category: formData.category,
        brand_name: formData.brand_name.trim(),
        legal_name: formData.legal_name.trim(),
        business_description: formData.business_description.trim(),
        goals: validGoals,
        potential_impact: validImpact,
        avatar_url: avatarUrl || null,
        product_image_url: productUrls[0] ?? null,
        product_image_urls: productUrls,
        status: "submitted",
        rejection_comment: null,
      };

      // Also sync full_name & phone_number to profile
      await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name.trim(),
          phone_number: cleanPhone.startsWith("998") ? cleanPhone : `998${cleanPhone}`,
        })
        .eq("id", user.id);

      if (existingAppId) {
        const { error: updErr } = await supabase
          .from("applications")
          .update(payload)
          .eq("id", existingAppId);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase
          .from("applications")
          .insert(payload);
        if (insErr) throw insErr;
      }
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : "Xatolik yuz berdi");
      setSubmitting(false);
    }
  };

  /* ── Guards ── */
  if (alreadyApplied) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
          isLight ? "bg-[#f6f8fb] text-slate-900" : "bg-[#000001] text-white"
        }`}
        data-lenis-prevent
      >
        <div
          className={`text-center p-8 sm:p-10 rounded-3xl border max-w-md w-full backdrop-blur-xl ${
            isLight ? "bg-white/95 border-slate-200 shadow-xl shadow-slate-200/50" : "bg-white/5 border-white/10 shadow-2xl"
          }`}
        >
          <CheckCircle2 size={52} className="text-[#00A8FF] mx-auto mb-4" />
          <h2
            className={`text-2xl font-bold mb-2 tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}
            style={{ fontFamily: "var(--font-zuume)" }}
          >
            ARIZA TOPSHIRILGAN
          </h2>
          <p className={`text-sm mb-6 ${isLight ? "text-slate-600 font-medium" : "text-white/70"}`}>
            Siz allaqachon ariza topshirgansiz. Arizangiz holatini profilingiz orqali kuzatishingiz mumkin.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-[#00A8FF] hover:bg-[#0090dd] text-white font-semibold rounded-xl px-6 py-3 text-sm transition-all duration-200 shadow-lg shadow-blue-500/25 active:scale-[0.98]"
            style={{ fontFamily: "var(--font-button)" }}
          >
            Dashboardga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
        isLight ? "bg-[#f6f8fb] text-slate-900" : "bg-[#000001] text-white"
      }`}
      data-lenis-prevent
    >
      {/* Background Image overlay */}
      <div
        className={`absolute inset-0 bg-cover bg-center pointer-events-none scale-105 transition-all duration-500 ${
          isLight ? "opacity-25" : "opacity-35"
        }`}
        style={{
          backgroundImage: `url(${isLight ? HeroLightImage : HeroImage})`,
        }}
      />
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${
          isLight
            ? "bg-gradient-to-b from-white/60 via-white/85 to-[#f6f8fb]"
            : "bg-gradient-to-b from-[#000001]/10 via-[#000001]/50 to-[#000001]"
        }`}
      />

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Header */}
        <div
          className={`border-b sticky top-0 z-20 backdrop-blur-md transition-colors duration-300 ${
            isLight ? "bg-white/95 border-slate-200 shadow-xs" : "bg-[#080d1a]/85 border-white/15"
          }`}
        >
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => (step === 0 ? navigate("/dashboard") : prevStep())}
                className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                  isLight
                    ? "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200"
                    : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                }`}
                aria-label="Orqaga"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1
                  className={`text-base sm:text-lg font-bold tracking-wide ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                  style={{ fontFamily: "var(--font-zuume)" }}
                >
                  {STEP_TITLES[step].toUpperCase()}
                </h1>
                <p
                  className={`text-xs font-semibold ${
                    isLight ? "text-slate-500" : "text-white/80"
                  }`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  Ariza shakli
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? "bg-slate-100 border-slate-300 text-amber-600 hover:bg-slate-200"
                  : "bg-white/10 border-white/20 text-amber-400 hover:bg-white/20"
              }`}
            >
              {isLight ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <StepIndicator current={step} total={4} isLight={isLight} />

          {/* ── Step 1: Personal ── */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <InputField
                label="To'liq ism"
                placeholder="Alisher Navoiy"
                isLight={isLight}
                error={step1Form.formState.errors.full_name?.message}
                {...step1Form.register("full_name")}
              />

              <InputField
                label="Yosh"
                type="number"
                min={14}
                max={40}
                isLight={isLight}
                error={step1Form.formState.errors.age?.message}
                {...step1Form.register("age", { valueAsNumber: true })}
              />

              <InputField
                label="Telefon raqam"
                type="tel"
                placeholder="+998(90)123-45-67"
                isLight={isLight}
                error={step1Form.formState.errors.phone_number?.message}
                {...step1Form.register("phone_number", {
                  onChange: (e) => {
                    e.target.value = formatPhone(e.target.value);
                  },
                })}
              />

              <div>
                <label
                  className={`block text-xs font-bold mb-2 uppercase tracking-wider ${
                    isLight ? "text-slate-800" : "text-white/90"
                  }`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  Jinsingiz
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "male", label: "Erkak" },
                    { value: "female", label: "Ayol" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        step1Form.watch("gender") === opt.value
                          ? isLight
                            ? "border-[#00A8FF] bg-[#00A8FF]/10 text-[#00A8FF] font-bold shadow-xs"
                            : "border-[#00A8FF] bg-[#00A8FF]/20 text-white font-bold shadow-[0_0_15px_rgba(0,168,255,0.25)]"
                          : isLight
                          ? "border-slate-300 bg-white hover:border-slate-400 text-slate-800"
                          : "border-white/20 bg-white/[0.06] hover:border-white/40 text-white/80 hover:text-white"
                      }`}
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        className="accent-[#00A8FF] hidden"
                        {...step1Form.register("gender")}
                      />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {step1Form.formState.errors.gender && (
                  <p className="mt-1.5 text-xs text-red-400 font-medium">
                    {step1Form.formState.errors.gender.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-2 uppercase tracking-wider ${
                    isLight ? "text-slate-800" : "text-white/90"
                  }`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  Viloyat / Shahar
                </label>
                <CustomSelect
                  value={step1Form.watch("region")}
                  onChange={(val) => {
                    step1Form.setValue("region", val, { shouldValidate: true });
                  }}
                  options={UZBEKISTAN_REGIONS}
                  placeholder="Tanlang..."
                  error={!!step1Form.formState.errors.region}
                />
                {step1Form.formState.errors.region && (
                  <p className="mt-1.5 text-xs text-red-400 font-medium">
                    {step1Form.formState.errors.region.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Business ── */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <label
                  className={`block text-xs font-bold mb-2 uppercase tracking-wider ${
                    isLight ? "text-slate-800" : "text-white/90"
                  }`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  Yo'nalish
                </label>
                <div className="grid gap-3">
                  {CATEGORIES.map((cat) => {
                    const isSelected = step2Form.watch("category") === cat.value;
                    return (
                      <label
                        key={cat.value}
                        className={`flex items-start gap-3.5 p-4.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? isLight
                              ? "border-[#00A8FF] bg-[#00A8FF]/10 shadow-xs"
                              : "border-[#00A8FF] bg-[#00A8FF]/20 shadow-[0_0_20px_rgba(0,168,255,0.25)]"
                            : isLight
                            ? "border-slate-300 bg-white hover:border-slate-400"
                            : "border-white/20 bg-white/[0.06] hover:border-white/40"
                        }`}
                      >
                        <input
                          type="radio"
                          value={cat.value}
                          className="mt-1 accent-[#00A8FF]"
                          {...step2Form.register("category")}
                        />
                        <div>
                          <p
                            className={`text-sm sm:text-base font-bold ${
                              isSelected
                                ? isLight
                                  ? "text-slate-900"
                                  : "text-white"
                                : isLight
                                ? "text-slate-800"
                                : "text-white/90"
                            }`}
                          >
                            {cat.label}
                          </p>
                          <p
                            className={`text-xs mt-0.5 ${
                              isSelected
                                ? isLight
                                  ? "text-slate-600 font-medium"
                                  : "text-white/90"
                                : isLight
                                ? "text-slate-500"
                                : "text-white/70"
                            }`}
                          >
                            {cat.desc}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {step2Form.formState.errors.category && (
                  <p className="mt-1.5 text-xs text-red-400 font-medium">
                    {step2Form.formState.errors.category.message}
                  </p>
                )}
              </div>

              <InputField
                label="Brand nomi"
                placeholder="NomingizBrand"
                isLight={isLight}
                error={step2Form.formState.errors.brand_name?.message}
                {...step2Form.register("brand_name")}
              />

              <InputField
                label="Yuridik nomi"
                placeholder="Mas'uliyati Cheklangan Jamiyat..."
                isLight={isLight}
                error={step2Form.formState.errors.legal_name?.message}
                {...step2Form.register("legal_name")}
              />

              <div>
                <label
                  className={`block text-xs font-bold mb-2 uppercase tracking-wider ${
                    isLight ? "text-slate-800" : "text-white/90"
                  }`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  Biznes tavsifi
                </label>
                <textarea
                  rows={4}
                  placeholder="Biznesingiz haqida batafsil yozing (kamida 50 belgi)..."
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all duration-200 ${
                    isLight
                      ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#00A8FF] focus:ring-2 focus:ring-[#00A8FF]/20"
                      : "bg-white/[0.08] border-white/20 text-white placeholder:text-white/40 focus:border-[#00A8FF] focus:bg-white/[0.12]"
                  } ${step2Form.formState.errors.business_description ? "border-red-500 ring-1 ring-red-500/30" : ""}`}
                  {...step2Form.register("business_description")}
                />
                {step2Form.formState.errors.business_description && (
                  <p className="mt-1.5 text-xs text-red-400 font-medium">
                    {step2Form.formState.errors.business_description.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Goals & Impact ── */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <DynamicList
                label="Maqsadlar"
                placeholder="Maqsad"
                items={formData.goals}
                isLight={isLight}
                onChange={(goals) => setFormData((p) => ({ ...p, goals }))}
                error={step3Errors.goals}
              />
              <DynamicList
                label="Potensial Ta'sir"
                placeholder="Ta'sir"
                items={formData.potential_impact}
                isLight={isLight}
                onChange={(potential_impact) => setFormData((p) => ({ ...p, potential_impact }))}
                error={step3Errors.impact}
              />
            </div>
          )}

          {/* ── Step 4: Media ── */}
          {step === 3 && (
            <div className="flex flex-col gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[#00A8FF]/20 border border-[#00A8FF]/40 flex items-center justify-center text-[11px] font-bold text-[#00A8FF]">
                    1
                  </div>
                  <p className={`text-sm font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                    Shaxsiy fotosurat
                  </p>
                  <span className={`text-xs font-medium ${isLight ? "text-slate-500" : "text-white/70"}`}>
                    (majburiy — o'zingizning rasmingiz)
                  </span>
                </div>
                <AvatarUpload
                  label="Fotosurat"
                  preview={formData.avatarPreview}
                  onFile={handleAvatarSelect}
                  required
                  isLight={isLight}
                  error={step4Errors.avatar}
                />
              </div>

              <div className={`border-t ${isLight ? "border-slate-200" : "border-white/15"}`} />

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isLight
                        ? "bg-slate-100 border border-slate-300 text-slate-700"
                        : "bg-white/10 border border-white/20 text-white"
                    }`}
                  >
                    2
                  </div>
                  <p className={`text-sm font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                    Mahsulot / Biznes rasmlari
                  </p>
                  <span className={`text-xs font-medium ${isLight ? "text-slate-500" : "text-white/70"}`}>
                    (ixtiyoriy — mahsulot yoki biznesingiz rasmi)
                  </span>
                </div>
                <MultiImageUpload
                  label="Mahsulot rasmlari"
                  previews={formData.productPreviews}
                  onAdd={handleProductAdd}
                  onRemove={handleProductRemove}
                  isLight={isLight}
                />
              </div>

              {globalError && (
                <div className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-400 font-medium">
                  {globalError}
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={prevStep}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                  isLight
                    ? "border-slate-300 text-slate-700 bg-white hover:bg-slate-100 hover:border-slate-400"
                    : "border-white/20 text-white bg-white/10 hover:bg-white/20 hover:border-white/30"
                }`}
                style={{ fontFamily: "var(--font-button)" }}
              >
                <ArrowLeft size={16} /> Orqaga
              </button>
            )}
            <div className="flex-1" />
            {step < 3 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 bg-[#00A8FF] hover:bg-[#0090dd] hover:shadow-[0_0_25px_rgba(0,168,255,0.4)] active:scale-[0.98] text-white font-bold rounded-xl px-7 py-3 text-sm transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/25"
                style={{ fontFamily: "var(--font-button)" }}
              >
                Keyingi <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-[#00A8FF] hover:bg-[#0090dd] hover:shadow-[0_0_25px_rgba(0,168,255,0.4)] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-white font-bold rounded-xl px-8 py-3 text-sm transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/25"
                style={{ fontFamily: "var(--font-button)" }}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Yuklanmoqda...
                  </>
                ) : (
                  <>Ariza topshirish <CheckCircle2 size={16} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
