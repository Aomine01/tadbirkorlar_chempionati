import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Upload, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import HeroImage from "../../assets/img/hero-image.png";
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
  { value: "ideas", label: "G'oya", desc: "Kuchli potensialga ega yangi g'oya" },
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
  category: z.enum(["ideas", "startup", "business"], {
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
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) => (
  <div>
    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">
      {label}
    </label>
    <input
      type={type}
      className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:border-[#00A8FF]/60 focus:bg-white/8 ${
        error ? "border-red-500/50" : "border-white/10"
      }`}
      {...rest}
    />
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
);

/* ─── Dynamic Array Input ──────────────────────────── */

const DynamicList = ({
  label,
  placeholder,
  items,
  onChange,
  error,
}: {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
  error?: string;
}) => {
  const add = () => onChange([...items, ""]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, val: string) =>
    onChange(items.map((item, idx) => (idx === i ? val : item)));

  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-widest">
        {label}
      </label>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={`${placeholder} ${i + 1}`}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#00A8FF]/60 transition-all"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="w-11 h-11 flex items-center justify-center rounded-xl border border-white/10 text-white/30 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-2 text-xs text-[#00A8FF] hover:text-white py-2 transition-colors cursor-pointer self-start"
        >
          <Plus size={13} /> Yana qo'shish
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
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
}: {
  label: string;
  preview: string | null;
  onFile: (file: File) => void;
  required?: boolean;
  error?: string;
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
      <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-widest">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div
        onClick={() => ref.current?.click()}
        className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${
          error ? "border-red-500/40" : "border-white/10 hover:border-[#00A8FF]/40"
        } ${preview ? "aspect-video" : "h-36"}`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
              <Upload size={20} className="text-white" />
              <span className="ml-2 text-xs text-white">O'zgartirish</span>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-white/30">
            <Upload size={24} />
            <span className="text-xs">Fotosurat yuklash (max {MAX_FILE_MB}MB)</span>
            <span className="text-[10px]">JPEG, PNG, WebP</span>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept={ALLOWED_TYPES.join(",")} onChange={handle} className="hidden" />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
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
}: {
  label: string;
  previews: string[];
  onAdd: (file: File) => void;
  onRemove: (index: number) => void;
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
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-widest">
        {label}
        <span className="text-white/25 ml-2 normal-case font-normal">(ixtiyoriy, max {MAX_PRODUCT_IMAGES} ta rasm)</span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        {previews.map((src, i) => (
          <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
            <img src={src} alt={`Mahsulot ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/70 text-white/70 hover:text-red-400 hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <Trash2 size={13} />
            </button>
            <div className="absolute bottom-1.5 left-2 text-[10px] text-white/40">{i + 1}/{MAX_PRODUCT_IMAGES}</div>
          </div>
        ))}

        {canAdd && (
          <div
            onClick={() => ref.current?.click()}
            className="aspect-video rounded-xl border-2 border-dashed border-white/10 hover:border-[#00A8FF]/40 cursor-pointer flex flex-col items-center justify-center gap-2 text-white/30 hover:text-white/50 transition-all"
          >
            <Plus size={22} />
            <span className="text-xs">Rasm qo'shish</span>
            <span className="text-[10px]">{previews.length}/{MAX_PRODUCT_IMAGES}</span>
          </div>
        )}
      </div>

      <input ref={ref} type="file" accept={ALLOWED_TYPES.join(",")} onChange={handle} className="hidden" />
    </div>
  );
};

/* ─── Step Indicator ───────────────────────────────── */

const StepIndicator = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1 rounded-full flex-1 transition-all duration-500 ${
          i < current ? "bg-[#00A8FF]" : i === current ? "bg-[#00A8FF]/50" : "bg-white/10"
        }`}
      />
    ))}
    <span className="text-xs text-white/30 ml-1" style={{ fontFamily: "var(--font-button)" }}>
      {current + 1}/{total}
    </span>
  </div>
);

/* ─── Page ─────────────────────────────────────────── */

interface FormData {
  // Step 1
  full_name: string;
  age: number;
  phone_number: string;
  region: string;
  gender: "male" | "female";
  // Step 2
  category: "ideas" | "startup" | "business";
  brand_name: string;
  legal_name: string;
  business_description: string;
  // Step 3
  goals: string[];
  potential_impact: string[];
  // Step 4 — avatar (required, 1 photo of the person)
  avatarFile: File | null;
  avatarPreview: string | null;
  // Step 4 — product images (optional, up to 4)
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
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

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

  // Check for duplicate applications — exclude soft-deleted so user can reapply after deletion
  useEffect(() => {
    if (!user) return;
    supabase
      .from("applications")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_deleted", false)        // only block if there's an active (non-deleted) application
      .maybeSingle()
      .then(({ data }) => {
        if (data) setAlreadyApplied(true);
      });
  }, [user]);

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
      if (formData.goals.filter((g) => g.trim()).length === 0)
        errors.goals = "Kamida 1 ta maqsad kiriting";
      if (formData.potential_impact.filter((g) => g.trim()).length === 0)
        errors.impact = "Kamida 1 ta ta'sir kiriting";
      if (Object.keys(errors).length) { setStep3Errors(errors); return; }
      setStep3Errors({});
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAvatarSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setFormData((p) => ({ ...p, avatarFile: file, avatarPreview: url }));
    setStep4Errors((e) => ({ ...e, avatar: undefined }));
  };

  const handleProductAdd = (file: File) => {
    if (formData.productFiles.length >= 4) return;
    const url = URL.createObjectURL(file);
    setFormData((p) => ({
      ...p,
      productFiles: [...p.productFiles, file],
      productPreviews: [...p.productPreviews, url],
    }));
  };

  const handleProductRemove = (index: number) => {
    setFormData((p) => ({
      ...p,
      productFiles: p.productFiles.filter((_, i) => i !== index),
      productPreviews: p.productPreviews.filter((_, i) => i !== index),
    }));
  };

  /* Final submit */
  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.avatarFile) {
      setStep4Errors({ avatar: "Fotosurat yuklanishi shart" });
      return;
    }
    setSubmitting(true);
    setGlobalError(null);

    try {
      const compress = async (file: File) => {
        return imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        });
      };

      /* Upload avatar */
      const avatarCompressed = await compress(formData.avatarFile!);
      const avatarPath = `${user.id}/avatar-${Date.now()}.${avatarCompressed.name.split(".").pop()}`;
      const { error: avatarErr } = await supabase.storage
        .from("participant-media")
        .upload(avatarPath, avatarCompressed, { upsert: false });
      if (avatarErr) throw new Error("Fotosurat yuklanmadi: " + avatarErr.message);

      const { data: avatarData } = supabase.storage
        .from("participant-media")
        .getPublicUrl(avatarPath);

      /* Upload product images (optional, up to 4) */
      const productUrls: string[] = [];
      for (let i = 0; i < formData.productFiles.length; i++) {
        const productCompressed = await compress(formData.productFiles[i]);
        const productPath = `${user.id}/product-${Date.now()}-${i}.${productCompressed.name.split(".").pop()}`;
        const { error: productErr } = await supabase.storage
          .from("participant-media")
          .upload(productPath, productCompressed, { upsert: false });
        if (!productErr) {
          const { data: productData } = supabase.storage
            .from("participant-media")
            .getPublicUrl(productPath);
          productUrls.push(productData.publicUrl);
        }
      }

      /* Insert application */
      const { error: insertErr } = await supabase.from("applications").insert({
        user_id: user.id,
        category: formData.category,
        age: formData.age,
        region: formData.region,
        brand_name: formData.brand_name,
        legal_name: formData.legal_name,
        business_description: formData.business_description,
        goals: formData.goals.filter((g) => g.trim()),
        potential_impact: formData.potential_impact.filter((g) => g.trim()),
        avatar_url: avatarData.publicUrl,
        product_image_url: productUrls[0] ?? null,   // keep legacy column
        product_image_urls: productUrls,              // new array column
        status: "submitted",
        gender: formData.gender,
      });

      if (insertErr) throw new Error(insertErr.message);
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
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#0a0a0a" }}
        data-lenis-prevent
      >
        <div className="text-center">
          <CheckCircle2 size={48} className="text-[#00A8FF] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-zuume)" }}>
            ARIZA TOPSHIRILGAN
          </h2>
          <p className="text-sm text-white/50 mb-6">Siz allaqachon ariza topshirgansiz.</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-[#00A8FF] text-white font-semibold rounded-xl px-6 py-3 text-sm"
          >
            Dashboardga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "#000001" }}
      data-lenis-prevent
    >
      {/* Background Image overlay matching the Hero page style */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35 pointer-events-none scale-105"
        style={{
          backgroundImage: `url(${HeroImage})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#000001]/10 via-[#000001]/50 to-[#000001] pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => (step === 0 ? navigate("/dashboard") : prevStep())}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} className="text-white" />
          </button>
          <div>
            <h1 className="text-sm font-bold" style={{ fontFamily: "var(--font-zuume)" }}>
              {STEP_TITLES[step].toUpperCase()}
            </h1>
            <p className="text-[10px] text-white/30" style={{ fontFamily: "var(--font-button)" }}>
              Ariza shakli
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <StepIndicator current={step} total={4} />

        {/* ── Step 1: Personal ── */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            {/* Name: pre-filled from profile, fully editable */}
            <InputField
              label="To'liq ism"
              placeholder="Alisher Navoiy"
              error={step1Form.formState.errors.full_name?.message}
              {...step1Form.register("full_name")}
            />

            <InputField
              label="Yosh"
              type="number"
              min={14}
              max={40}
              error={step1Form.formState.errors.age?.message}
              {...step1Form.register("age", { valueAsNumber: true })}
            />

            {/* Phone: pre-filled from profile, fully editable with live format */}
            <InputField
              label="Telefon raqam"
              type="tel"
              placeholder="+998(90)123-45-67"
              error={step1Form.formState.errors.phone_number?.message}
              {...step1Form.register("phone_number", {
                onChange: (e) => {
                  e.target.value = formatPhone(e.target.value);
                },
              })}
            />
             <div>
               <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">
                 Jinsingiz
               </label>
               <div className="grid grid-cols-2 gap-3">
                 {[
                   { value: "male", label: "Erkak" },
                   { value: "female", label: "Ayol" },
                 ].map((opt) => (
                   <label
                     key={opt.value}
                     className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                       step1Form.watch("gender") === opt.value
                         ? "border-[#00A8FF]/40 bg-[#00A8FF]/8 text-[#00A8FF]"
                         : "border-white/10 bg-white/3 hover:border-white/20 text-white/60 hover:text-white"
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
                 <p className="mt-1.5 text-xs text-red-400">{step1Form.formState.errors.gender.message}</p>
               )}
             </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">
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
                <p className="mt-1.5 text-xs text-red-400">{step1Form.formState.errors.region.message}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Business ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-widest">
                Yo'nalish
              </label>
              <div className="grid gap-2">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat.value}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      step2Form.watch("category") === cat.value
                        ? "border-[#00A8FF]/40 bg-[#00A8FF]/8"
                        : "border-white/10 bg-white/3 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      value={cat.value}
                      className="mt-1 accent-[#00A8FF]"
                      {...step2Form.register("category")}
                    />
                    <div>
                      <p className="text-sm font-medium">{cat.label}</p>
                      <p className="text-xs text-white/40">{cat.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {step2Form.formState.errors.category && (
                <p className="mt-1.5 text-xs text-red-400">{step2Form.formState.errors.category.message}</p>
              )}
            </div>
            <InputField
              label="Brand nomi"
              placeholder="NomingizBrand"
              error={step2Form.formState.errors.brand_name?.message}
              {...step2Form.register("brand_name")}
            />
            <InputField
              label="Yuridik nomi"
              placeholder="Mas'uliyati Cheklangan Jamiyat..."
              error={step2Form.formState.errors.legal_name?.message}
              {...step2Form.register("legal_name")}
            />
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">
                Biznes tavsifi
              </label>
              <textarea
                rows={4}
                placeholder="Biznesingiz haqida batafsil yozing (kamida 50 belgi)..."
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-none transition-all duration-200 focus:border-[#00A8FF]/60 ${
                  step2Form.formState.errors.business_description ? "border-red-500/50" : "border-white/10"
                }`}
                {...step2Form.register("business_description")}
              />
              {step2Form.formState.errors.business_description && (
                <p className="mt-1.5 text-xs text-red-400">{step2Form.formState.errors.business_description.message}</p>
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
              onChange={(goals) => setFormData((p) => ({ ...p, goals }))}
              error={step3Errors.goals}
            />
            <DynamicList
              label="Potensial Ta'sir"
              placeholder="Ta'sir"
              items={formData.potential_impact}
              onChange={(potential_impact) => setFormData((p) => ({ ...p, potential_impact }))}
              error={step3Errors.impact}
            />
          </div>
        )}

        {/* ── Step 4: Media ── */}
        {step === 3 && (
          <div className="flex flex-col gap-8">
            {/* Person photo — clearly labelled, separate from product */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#00A8FF]/15 border border-[#00A8FF]/30 flex items-center justify-center text-[10px] font-bold text-[#00A8FF]">1</div>
                <p className="text-sm font-semibold text-white/80">Shaxsiy fotosurat</p>
                <span className="text-[10px] text-white/30">(majburiy — o'zingizning rasmingiz)</span>
              </div>
              <AvatarUpload
                label="Fotosurat"
                preview={formData.avatarPreview}
                onFile={handleAvatarSelect}
                required
                error={step4Errors.avatar}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-white/8" />

            {/* Product images — up to 4 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-[10px] font-bold text-white/50">2</div>
                <p className="text-sm font-semibold text-white/80">Mahsulot / Biznes rasmlari</p>
                <span className="text-[10px] text-white/30">(ixtiyoriy — mahsulot yoki biznesingiz rasmi)</span>
              </div>
              <MultiImageUpload
                label="Mahsulot rasmlari"
                previews={formData.productPreviews}
                onAdd={handleProductAdd}
                onRemove={handleProductRemove}
              />
            </div>

            {globalError && (
              <div className="px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400">
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
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-sm text-white/70 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/20 active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <ArrowLeft size={15} /> Orqaga
            </button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-[#00A8FF] hover:bg-[#0090dd] hover:shadow-[0_0_20px_rgba(0,168,255,0.3)] active:scale-[0.98] text-white font-semibold rounded-xl px-6 py-3 text-sm transition-all duration-200 cursor-pointer"
            >
              Keyingi <ArrowRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-[#00A8FF] hover:bg-[#0090dd] hover:shadow-[0_0_20px_rgba(0,168,255,0.3)] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-white font-semibold rounded-xl px-8 py-3 text-sm transition-all duration-200 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Yuklanmoqda...
                </>
              ) : (
                <>Ariza topshirish <CheckCircle2 size={15} /></>
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
