import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, ChevronLeft, Send } from "lucide-react";
import Container from "../components/Container";
import CustomSelect from "../components/CustomSelect";

const TELEGRAM_LINK = "https://t.me/your_channel"; // update this

const GOOGLE_FORM_ACTION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScGrCEEEW3JSa8gbGhZI4siNOcEAn7v2Fx50dpXEMl2uFshGA/formResponse";

const regions = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Andijon",
  "Buxoro",
  "Farg\u2018ona",
  "Jizzax",
  "Xorazm",
  "Namangan",
  "Navoiy",
  "Qashqadaryo",
  "Qoraqalpog\u2018iston Respublikasi",
  "Samarqand",
  "Sirdaryo",
  "Surxondaryo",
];

interface Field {
  id: string;
  label: string;
  type: "text" | "textarea" | "radio" | "select";
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

interface Section {
  title: string;
  fields: Field[];
}

const sections: Section[] = [
  {
    title: "Asosiy ma\u2019lumotlar",
    fields: [
      {
        id: "fullName",
        label: "To\u2018liq ism va Familiya",
        type: "text",
        placeholder: "Aziza Karimova",
        required: true,
      },
      {
        id: "age",
        label: "Yoshingiz",
        type: "text",
        placeholder: "Masalan: 22",
        required: true,
      },
      {
        id: "gender",
        label: "Jinsingiz",
        type: "radio",
        options: ["Erkak", "Ayol"],
        required: true,
      },
      {
        id: "phone",
        label: "Telefon raqamingiz",
        type: "text",
        placeholder: "+998(90)123-45-67",
        required: true,
      },
      {
        id: "viloyat",
        label: "Viloyatingiz",
        type: "select",
        options: regions,
        placeholder: "Viloyatni tanlang",
        required: true,
      },
      {
        id: "startupName",
        label: "Startup nomi",
        type: "text",
        placeholder: "QuickFix AI",
        required: true,
      },
      {
        id: "website",
        label: "Website / Landing Page (agar bo\u2018lsa)",
        type: "text",
        placeholder: "https://quickfix.ai",
        required: false,
      },
      {
        id: "oneLiner",
        label: "Startupingizni bitta gap bilan tasvirlab bering",
        type: "textarea",
        placeholder: "Biz kichik do\u2018konlarga sun\u2019iy intellekt yordamida...",
        required: true,
      },
    ],
  },
  {
    title: "Muammo va yechim",
    fields: [
      {
        id: "problem",
        label: "Qanday muammoni hal qilyapsiz? Nega bu muhim?",
        type: "textarea",
        required: true,
      },
      {
        id: "uniqueness",
        label: "Yechimingizning o\u2018ziga xosligi nimada?",
        type: "textarea",
        required: true,
      },
      {
        id: "targetCustomer",
        label: "Asosiy target customer kim?",
        type: "textarea",
        required: true,
      },
      {
        id: "firstMarket",
        label: "Avval qayerda ishga tushasiz? Nega aynan shu bozor?",
        type: "textarea",
        required: false,
      },
      {
        id: "competitors",
        label: "Sizning to\u2018g\u2018ridan-to\u2018g\u2018ri raqobatchingiz kimlar?",
        type: "textarea",
        required: true,
      },
      {
        id: "alternatives",
        label: "Bozordagi alternativ yechimlar",
        type: "textarea",
        required: true,
      },
      {
        id: "whyYouWin",
        label: "Nega aynan siz bu bozorda yutasiz?",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    title: "Traction va biznes model",
    fields: [
      {
        id: "productStage",
        label: "Hozirgi mahsulot bosqichi",
        type: "radio",
        options: ["MVP", "Birinchi mijozlar", "Daromad", "O\u2018sish"],
        required: true,
      },
      {
        id: "usersCount",
        label: "Bugungi kunda nechta foydalanuvchi yoki mijozingiz bor?",
        type: "text",
        placeholder: "120 ta aktiv foydalanuvchi yoki 14 ta to\u2018lov qiluvchi mijoz",
        required: false,
      },
      {
        id: "revenue",
        label: "Revenue (oylik yoki yillik, agar bo\u2018lsa)",
        type: "text",
        placeholder: "Oyiga 1,200 USD MRR",
        required: false,
      },
      {
        id: "progress",
        label: "Hozirgacha nimalar qurdingiz? Progressni ko\u2018rsating",
        type: "textarea",
        required: true,
      },
      {
        id: "revenueModel",
        label: "Startup qanday qilib pul ishlaydi?",
        type: "textarea",
        required: true,
      },
      {
        id: "goToMarket",
        label: "Keyingi 6 oy uchun go-to-market rejangiz",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    title: "Moliyalashtirish",
    fields: [
      {
        id: "previousFunding",
        label: "Avval pul jalb qilganmisiz?",
        type: "radio",
        options: ["Ha", "Yo\u2018q"],
        required: true,
      },
      {
        id: "fundingAmount",
        label: "Jalb qilingan summa (agar bo\u2018lsa)",
        type: "text",
        placeholder: "5,000 AQSh dollar (investitsiya, grant)",
        required: false,
      },
      {
        id: "currentFundraising",
        label: "Hozir fundraising qilyapsizmi? Ha bo\u2018lsa, qancha?",
        type: "textarea",
        required: false,
      },
    ],
  },
  {
    title: "Jamoa",
    fields: [
      {
        id: "skills",
        label: "O\u2018zingizning skill va tajribangiz haqida yozing",
        type: "textarea",
        required: true,
      },
      {
        id: "whyYou",
        label: "Nega aynan siz bu muammoni yechishga mos odamsiz?",
        type: "textarea",
        required: true,
      },
    ],
  },
];

const inputBase =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none transition-all duration-200 focus:border-[#00A8FF] focus:ring-1 focus:ring-[#00A8FF]/30";

const GOOGLE_FORM_ENTRIES: Record<string, string> = {
  fullName: "entry.589337464",
  age: "entry.561828384",
  gender: "entry.601213063",
  phone: "entry.414291695",
  viloyat: "entry.1446788278",
  startupName: "entry.1389728206",
  website: "entry.182289817",
  oneLiner: "entry.1549220747",
  problem: "entry.2002731516",
  uniqueness: "entry.31784762",
  targetCustomer: "entry.1939653426",
  firstMarket: "entry.743618351",
  competitors: "entry.1266852792",
  alternatives: "entry.877309293",
  whyYouWin: "entry.826702711",
  productStage: "entry.1753955832",
  usersCount: "entry.555623959",
  revenue: "entry.1899547246",
  progress: "entry.392620411",
  revenueModel: "entry.1820418146",
  goToMarket: "entry.517786915",
  previousFunding: "entry.1338596486",
  fundingAmount: "entry.697627127",
  currentFundraising: "entry.1335561539",
  skills: "entry.1255350488",
  whyYou: "entry.258638728",
};

const formatPhone = (raw: string): string => {
  let digits = raw.replace(/\D/g, "");
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

const stripPhone = (formatted: string): string => {
  const d = formatted.replace(/\D/g, "");
  return d.startsWith("998") ? "+" + d : "+998" + d;
};

// --- Confetti ---
const CONFETTI_COLORS = ["#00A8FF", "#00C2FF", "#0080CC", "#33BBFF", "#FFFFFF"];

function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const makePiece = (fromLeft: boolean) => ({
      x: fromLeft ? 0 : canvas.width,
      y: canvas.height * 0.4,
      vx: fromLeft ? Math.random() * 10 + 4 : -(Math.random() * 10 + 4),
      vy: -(Math.random() * 18 + 8),
      w: Math.random() * 12 + 5,
      h: Math.random() * 6 + 3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 8 - 4,
      gravity: 0.5,
      opacity: 1,
    });

    const pieces = Array.from({ length: 160 }, (_, i) => makePiece(i < 80));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let allGone = true;
      pieces.forEach((p) => {
        if (p.opacity <= 0) return;
        allGone = false;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.height * 0.7) p.opacity -= 0.02;
      });
      if (!allGone) raf = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(raf);
  }, [active]);

  return canvasRef;
}

// --- Success Screen ---
function SuccessScreen() {
  const navigate = useNavigate();
  const canvasRef = useConfetti(true);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />
      <div className="relative z-20 flex flex-col items-center text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-[#00A8FF]/15 border border-[#00A8FF]/30 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[#00A8FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          TABRIKLAYMIZ!
        </h1>
        <p
          className="text-white/60 text-sm sm:text-base leading-relaxed mb-8"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Arizangiz muvaffaqiyatli qabul qilindi. Tez orada siz bilan bog&apos;lanamiz.
          Yangiliklar va e&apos;lonlar uchun bizning Telegram kanalimizga qo&apos;shiling.
        </p>
        <a
          href={TELEGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-[#00A8FF] text-white hover:bg-[#00A8FF]/90 transition-all duration-200 shadow-lg shadow-[#00A8FF]/20 mb-4 w-full justify-center"
          style={{ fontFamily: "var(--font-button)" }}
        >
          <Send className="w-4 h-4" />
          Telegram kanalga qo&apos;shilish
        </a>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-white/40 hover:text-white/70 transition-colors"
          style={{ fontFamily: "var(--font-button)" }}
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function StartupFormPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const active = container.children[currentStep] as HTMLElement;
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentStep]);

  const section = sections[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === sections.length - 1;

  const updateField = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  const validateFields = (fields: Field[]) => {
    const nextErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required === false) return;
      const value = formData[field.id];
      if (!value || !String(value).trim()) {
        nextErrors[field.id] = "Bu maydon majburiy";
      } else if (field.id === "age") {
        const num = Number(value);
        if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 99)
          nextErrors[field.id] = "Yoshingizni to\u2018g\u2018ri kiriting";
      } else if (field.id === "phone") {
        if (!/^\+998\d{9}$/.test(stripPhone(String(value))))
          nextErrors[field.id] = "Format: +998 XX XXX XX XX";
      }
    });
    return nextErrors;
  };

  const validateCurrentStep = () => {
    const stepErrors = validateFields(section.fields);
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const validateAll = () => {
    const allErrors: Record<string, string> = {};
    sections.forEach((s) => Object.assign(allErrors, validateFields(s.fields)));
    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < sections.length - 1) setCurrentStep((p) => p + 1);
  };

  const buildPayload = () => {
    const payload = new URLSearchParams();
    Object.entries(GOOGLE_FORM_ENTRIES).forEach(([localKey, googleEntryKey]) => {
      if (localKey === "phone") {
        payload.append(googleEntryKey, stripPhone(formData[localKey] || ""));
      } else {
        payload.append(googleEntryKey, formData[localKey] || "");
      }
    });
    return payload;
  };

  const handleSubmit = async () => {
    setSubmitStatus("idle");
    if (!validateAll()) return;
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_FORM_ACTION_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: buildPayload().toString(),
      });
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderError = (id: string) =>
    errors[id] ? <p className="mt-2 text-sm text-red-400">{errors[id]}</p> : null;

  const renderField = (field: Field) => {
    switch (field.type) {
      case "text":
        return (
          <div>
            <input
              type="text"
              className={`${inputBase} ${errors[field.id] ? "border-red-400 focus:border-red-400" : ""}`}
              style={{ fontFamily: "var(--font-body)" }}
              placeholder={field.placeholder || ""}
              value={formData[field.id] || ""}
              onChange={(e) => {
                const val = field.id === "phone"
                  ? formatPhone(e.target.value)
                  : e.target.value;
                updateField(field.id, val);
              }}
            />
            {renderError(field.id)}
          </div>
        );

      case "textarea":
        return (
          <div>
            <textarea
              className={`${inputBase} min-h-[100px] resize-y ${errors[field.id] ? "border-red-400 focus:border-red-400" : ""}`}
              style={{ fontFamily: "var(--font-body)" }}
              placeholder={field.placeholder || ""}
              value={formData[field.id] || ""}
              onChange={(e) => updateField(field.id, e.target.value)}
              rows={3}
            />
            {renderError(field.id)}
          </div>
        );

      case "select":
        return (
          <div>
            <CustomSelect
              value={formData[field.id] || ""}
              onChange={(val) => updateField(field.id, val)}
              options={field.options || []}
              placeholder={field.placeholder || "Tanlang..."}
              error={!!errors[field.id]}
            />
            {renderError(field.id)}
          </div>
        );

      case "radio": {
        const selectedVal = formData[field.id];
        return (
          <div>
            <div className="grid gap-2">
              {field.options?.map((option) => {
                const selected = selectedVal === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField(field.id, option)}
                    className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                      selected
                        ? "bg-[#00A8FF]/10 border-[#00A8FF] text-white"
                        : "bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/[0.07]"
                    } ${errors[field.id] && !selected ? "border-red-400" : ""}`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                          selected ? "border-[#00A8FF]" : "border-white/30"
                        }`}
                      >
                        {selected && <div className="w-2 h-2 rounded-full bg-[#00A8FF]" />}
                      </div>
                      <span className="text-sm">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {renderError(field.id)}
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (submitStatus === "success") return <SuccessScreen />;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0a0a0a", fontFamily: "var(--font-body)" }}
    >
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <Container size="md">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1
                className="text-white text-lg font-semibold leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Startap yo&apos;nalishi
              </h1>
              <p className="text-white/40 text-xs mt-0.5">
                Qadam {currentStep + 1} / {sections.length}
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Progress */}
      <div className="border-b border-white/5">
        <Container size="md">
          <div className="py-4">
            <div
              ref={scrollRef}
              className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar"
            >
              {sections.map((s, i) => (
                <div
                  key={i}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg ${
                    i === currentStep
                      ? "bg-[#00A8FF]/15 text-[#00A8FF] border border-[#00A8FF]/30"
                      : i < currentStep
                        ? "bg-white/5 text-white/50 border border-white/10"
                        : "text-white/25 border border-transparent"
                  }`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  {i + 1}. {s.title}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00A8FF] to-[#00A8FF]/70 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep + 1) / sections.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-white/40 shrink-0" style={{ fontFamily: "var(--font-button)" }}>
                {Math.round(((currentStep + 1) / sections.length) * 100)}%
              </span>
            </div>
          </div>
        </Container>
      </div>

      {/* Form content */}
      <Container size="md">
        <div className="py-8 pb-32">
          <div className="mb-8">
            <h2
              className="text-2xl sm:text-3xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {section.title}
            </h2>
            <p className="text-white/40 text-sm">
              {isLast
                ? "Oxirgi qadam — jamoa haqida"
                : `${currentStep + 1}-qadam ${sections.length} tadan`}
            </p>
          </div>

          {submitStatus === "error" && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              Yuborishda xatolik yuz berdi. Qayta urinib ko&apos;ring.
            </div>
          )}

          <div className="space-y-8">
            {section.fields.map((field) => (
              <div key={field.id}>
                <label
                  className="block text-white/90 text-sm font-medium mb-3"
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  {field.label}
                  {field.required !== false && (
                    <span className="text-[#00A8FF] ml-1">*</span>
                  )}
                  {field.required === false && (
                    <span className="text-white/30 ml-2 font-normal text-xs">(ixtiyoriy)</span>
                  )}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl">
        <Container size="md">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={isFirst}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isFirst
                  ? "text-white/20 cursor-not-allowed"
                  : "text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 active:scale-[0.98]"
              }`}
              style={{ fontFamily: "var(--font-button)" }}
            >
              <ChevronLeft className="w-4 h-4" />
              Orqaga
            </button>

            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-[#00A8FF] text-white hover:bg-[#00A8FF]/90 transition-all duration-200 shadow-lg shadow-[#00A8FF]/20 active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-button)" }}
              >
                {isSubmitting ? "Yuborilmoqda..." : "Ariza topshirish"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-[#00A8FF] text-white hover:bg-[#00A8FF]/90 hover:shadow-[0_0_20px_rgba(0,168,255,0.3)] transition-all duration-200 shadow-lg shadow-[#00A8FF]/20 active:scale-[0.98] cursor-pointer"
                style={{ fontFamily: "var(--font-button)" }}
              >
                Keyingi
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
}
