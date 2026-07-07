import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, ChevronLeft, Send } from "lucide-react";
import Container from "../components/Container";
import CustomSelect from "../components/CustomSelect";

const TELEGRAM_LINK = "https://t.me/your_channel"; // update this

const regions = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Andijon",
  "Buxoro",
  "Farg'ona",
  "Jizzax",
  "Xorazm",
  "Namangan",
  "Navoiy",
  "Qashqadaryo",
  "Qoraqalpog'iston Respublikasi",
  "Samarqand",
  "Sirdaryo",
  "Surxondaryo",
];

interface RadioFieldConfig {
  type: "radio";
  label: string;
  key: string;
  options: string[];
  required?: boolean;
}

interface TextFieldConfig {
  type: "text";
  label: string;
  key: string;
  placeholder: string;
  required?: boolean;
}

interface SelectFieldConfig {
  type: "select";
  label: string;
  key: string;
  options: string[];
  placeholder: string;
  required?: boolean;
}

interface TextareaFieldConfig {
  type: "textarea";
  label: string;
  key: string;
  placeholder?: string;
  required?: boolean;
}

type FieldConfig =
  | RadioFieldConfig
  | TextFieldConfig
  | SelectFieldConfig
  | TextareaFieldConfig;

interface Section {
  title: string;
  fields: FieldConfig[];
}

type FormDataState = Record<string, string>;
type FormErrors = Record<string, string>;

const sections: Section[] = [
  {
    title: "Asosiy ma'lumotlar",
    fields: [
      {
        type: "text",
        label: "To'liq ism va Familiya",
        key: "fullName",
        placeholder: "Ism Familiya",
        required: true,
      },
      {
        type: "text",
        label: "Yoshingiz",
        key: "age",
        placeholder: "Masalan: 25",
        required: true,
      },
      {
        type: "radio",
        label: "Jinsingiz",
        key: "gender",
        options: ["Erkak", "Ayol"],
        required: true,
      },
      {
        type: "text",
        label: "Telefon raqamingiz",
        key: "phone",
        placeholder: "+998(90)123-45-67",
        required: true,
      },
      {
        type: "select",
        label: "Viloyatingiz",
        key: "region",
        options: regions,
        placeholder: "Viloyatni tanlang",
        required: true,
      },
      {
        type: "text",
        label: "Loyiha nomi (Brend)",
        key: "brandName",
        placeholder: "Brend nomi",
        required: true,
      },
      {
        type: "radio",
        label: "O'rtacha oylik aylanma (tushum)?",
        key: "monthlyRevenue",
        options: [
          "150 mln so'mdan yuqori",
          "50\u2013150 mln so'm oralig'ida",
          "50 mln so'mgacha",
        ],
        required: true,
      },
      {
        type: "radio",
        label: "Yillik tushum dinamikasi?",
        key: "revenueTrend",
        options: [
          "20%+ barqaror o'sish",
          "Barqaror (sezilarli o'zgarishsiz)",
          "Pasayish kuzatilmoqda",
        ],
        required: true,
      },
      {
        type: "radio",
        label: "Yozma reglamentlar (SOP) bormi?",
        key: "sop",
        options: [
          "Ha \u2014 barcha asosiy jarayonlar hujjatlashtirilgan",
          "Faqat ba'zi jarayonlar yozilgan",
          "Yo'q \u2014 hammasi og'zaki tushuntiriladi",
        ],
        required: true,
      },
      {
        type: "radio",
        label: "CRM yoki hisob-kitob dasturi?",
        key: "crm",
        options: [
          "Ha \u2014 professional raqamli tizim o'rnatilgan",
          "Faqat Excel yoki Telegram orqali",
          "Yo'q \u2014 hisob-kitob qog'ozda",
        ],
        required: true,
      },
      {
        type: "radio",
        label: "O'rta bo'g'in rahbarlari (Middle management) bormi?",
        key: "middleManagement",
        options: [
          "Ha \u2014 yo'nalishlar bo'yicha mas'ul rahbarlar bor",
          "Hamma narsani faqat asoschi/direktor hal qiladi",
        ],
        required: true,
      },
      {
        type: "radio",
        label: "Necha nafar doimiy xodim ishlaydi?",
        key: "employeeCount",
        options: [
          "15 nafardan ko'p",
          "5\u201315 nafar xodim",
          "5 nafargacha xodim",
        ],
        required: true,
      },
      {
        type: "radio",
        label: "Boshqa hududlarda ochish (filial/franshiza) imkoni?",
        key: "expansion",
        options: [
          "Ha \u2014 tayyor moliyaviy model va qo'llanmalar bor",
          "Ha reja bor, lekin tizim tayyor emas",
          "Yo'q \u2014 faqat bitta lokatsiyaga bog'liq",
        ],
        required: true,
      },
      {
        type: "radio",
        label: "Ushbu sohada qancha vaqtdan beri faoliyat?",
        key: "experience",
        options: ["2 yildan ortiq", "6 oydan 2 yilgacha", "6 oygacha"],
        required: true,
      },
      {
        type: "radio",
        label: "Keyingi 3 yil uchun yozma strategiya bormi?",
        key: "strategy",
        options: [
          "Ha \u2014 aniq hisob-kitoblar bilan tasdiqlangan reja",
          "Faqat umumiy maqsadlar bor",
        ],
        required: true,
      },
    ],
  },
  {
    title: "Ochiq ma'lumot",
    fields: [
      {
        type: "textarea",
        label: "Mijozlar nima uchun aynan sizni tanlashadi? (USP)",
        key: "usp",
        placeholder: "Qisqacha yozing",
        required: true,
      },
      {
        type: "textarea",
        label: "Investitsiya aynan nima uchun kerak?",
        key: "investmentPurpose",
        placeholder: "Qisqacha yozing",
        required: true,
      },
    ],
  },
];

const inputBase =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none transition-all duration-200 focus:border-[#00A8FF] focus:ring-1 focus:ring-[#00A8FF]/30";

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

const GOOGLE_FORM_ACTION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeEO4pjZU3ISzCrZ7bkdgmACs-WtjOAPDrIp1LVNeWi-r38RA/formResponse";

const GOOGLE_FORM_ENTRIES: Record<string, string> = {
  fullName: "entry.1553935937",
  age: "entry.852967102",
  gender: "entry.228790028",
  phone: "entry.1887126675",
  region: "entry.968353870",
  brandName: "entry.862144014",
  monthlyRevenue: "entry.1446068227",
  revenueTrend: "entry.397000477",
  sop: "entry.1463975953",
  crm: "entry.1767859635",
  middleManagement: "entry.1418631210",
  employeeCount: "entry.1204487219",
  expansion: "entry.1608976841",
  experience: "entry.338909489",
  strategy: "entry.435707508",
  usp: "entry.975020004",
  investmentPurpose: "entry.33758265",
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
      color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
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

        if (p.y > canvas.height * 0.7) {
          p.opacity -= 0.02;
        }
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
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10"
      />
      <div className="relative z-20 flex flex-col items-center text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-[#00A8FF]/15 border border-[#00A8FF]/30 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-[#00A8FF]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
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
          Arizangiz muvaffaqiyatli qabul qilindi. Tez orada siz bilan
          bog'lanamiz. Yangiliklar va e'lonlar uchun bizning Telegram
          kanalimizga qo'shiling.
        </p>

        <a
          href={TELEGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-[#00A8FF] text-white hover:bg-[#00A8FF]/90 transition-all duration-200 shadow-lg shadow-[#00A8FF]/20 mb-4 w-full justify-center"
          style={{ fontFamily: "var(--font-button)" }}
        >
          <Send className="w-4 h-4" />
          Telegram kanalga qo'shilish
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
export default function BusinessFormPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormDataState>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const currentSection = sections[step];
  const totalSteps = sections.length;
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  const allFields = useMemo(() => sections.flatMap((s) => s.fields), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validateFields = (fields: FieldConfig[]) => {
    const nextErrors: FormErrors = {};
    fields.forEach((field) => {
      if (field.required === false) return;
      const value = formData[field.key]?.trim();
      if (!value) {
        nextErrors[field.key] = "Bu maydon majburiy";
        return;
      }
      if (field.key === "age") {
        const num = Number(value);
        if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 99) {
          nextErrors[field.key] = "Yoshingizni to'g'ri kiriting";
        }
      }
      if (field.key === "phone") {
        if (!/^\+998\d{9}$/.test(stripPhone(value))) {
          nextErrors[field.key] = "Format: +998 XX XXX XX XX";
        }
      }
    });
    return nextErrors;
  };

  const validateCurrentStep = () => {
    const stepErrors = validateFields(currentSection.fields);
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const validateAll = () => {
    const allErrors = validateFields(allFields);
    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (step < totalSteps - 1) setStep((prev) => prev + 1);
  };

  const buildPayload = () => {
    const payload = new URLSearchParams();
    Object.entries(GOOGLE_FORM_ENTRIES).forEach(
      ([localKey, googleEntryKey]) => {
        const value =
          localKey === "phone"
            ? stripPhone(formData[localKey] || "")
            : formData[localKey] || "";
        payload.append(googleEntryKey, value);
      },
    );
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
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: buildPayload().toString(),
      });
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderError = (key: string) =>
    errors[key] ? (
      <p className="mt-2 text-sm text-red-400">{errors[key]}</p>
    ) : null;

  const renderField = (field: FieldConfig) => {
    switch (field.type) {
      case "text":
        return (
          <div>
            <input
              type="text"
              className={`${inputBase} ${errors[field.key] ? "border-red-400 focus:border-red-400" : ""}`}
              style={{ fontFamily: "var(--font-body)" }}
              placeholder={field.placeholder}
              value={formData[field.key] || ""}
              onChange={(e) => {
                const val =
                  field.key === "phone"
                    ? formatPhone(e.target.value)
                    : e.target.value;
                updateField(field.key, val);
              }}
            />
            {renderError(field.key)}
          </div>
        );

      case "textarea":
        return (
          <div>
            <textarea
              className={`${inputBase} min-h-[100px] resize-y ${errors[field.key] ? "border-red-400 focus:border-red-400" : ""}`}
              style={{ fontFamily: "var(--font-body)" }}
              placeholder={field.placeholder || ""}
              value={formData[field.key] || ""}
              onChange={(e) => updateField(field.key, e.target.value)}
              rows={3}
            />
            {renderError(field.key)}
          </div>
        );

      case "select":
        return (
          <div>
            <CustomSelect
              value={formData[field.key] || ""}
              onChange={(val) => updateField(field.key, val)}
              options={field.options || []}
              placeholder={field.placeholder || "Tanlang..."}
              error={!!errors[field.key]}
            />
            {renderError(field.key)}
          </div>
        );

      case "radio":
        return (
          <div>
            <div className="grid gap-2">
              {field.options.map((option) => {
                const selected = formData[field.key] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField(field.key, option)}
                    className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                      selected
                        ? "bg-[#00A8FF]/10 border-[#00A8FF] text-white"
                        : "bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/[0.07]"
                    } ${errors[field.key] && !selected ? "border-red-400" : ""}`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                          selected ? "border-[#00A8FF]" : "border-white/30"
                        }`}
                      >
                        {selected && (
                          <div className="w-2 h-2 rounded-full bg-[#00A8FF]" />
                        )}
                      </div>
                      <span className="text-sm">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {renderError(field.key)}
          </div>
        );

      default:
        return null;
    }
  };

  if (submitStatus === "success") {
    return <SuccessScreen />;
  }

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
                An&apos;anaviy biznes yo&apos;nalishi
              </h1>
              <p className="text-white/40 text-xs mt-0.5">
                Qadam {step + 1} / {totalSteps}
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Progress bar */}
      <div className="border-b border-white/5">
        <Container size="md">
          <div className="py-4">
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
              {sections.map((s, i) => (
                <div
                  key={i}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg ${
                    i === step
                      ? "bg-[#00A8FF]/15 text-[#00A8FF] border border-[#00A8FF]/30"
                      : i < step
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
                  style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                />
              </div>
              <span
                className="text-xs text-white/40 shrink-0"
                style={{ fontFamily: "var(--font-button)" }}
              >
                {Math.round(((step + 1) / totalSteps) * 100)}%
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
              {currentSection.title}
            </h2>
            <p className="text-white/40 text-sm">
              {isLast
                ? "Oxirgi qadam — ochiq ma'lumotlar"
                : `${step + 1}-qadam ${totalSteps} tadan`}
            </p>
          </div>

          {submitStatus === "error" && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              Yuborishda xatolik yuz berdi. Qayta urinib ko'ring.
            </div>
          )}

          <div className="space-y-8">
            {currentSection.fields.map((field) => (
              <div key={field.key}>
                <label
                  className="block text-white/90 text-sm font-medium mb-3"
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  {field.label}
                  {field.required !== false && (
                    <span className="text-[#00A8FF] ml-1">*</span>
                  )}
                  {field.required === false && (
                    <span className="text-white/30 ml-2 font-normal text-xs">
                      (ixtiyoriy)
                    </span>
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
              onClick={() => setStep((s) => Math.max(0, s - 1))}
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
