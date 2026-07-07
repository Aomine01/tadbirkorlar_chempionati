import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, ChevronLeft, Send } from "lucide-react";
import Container from "../components/Container";
import CustomSelect from "../components/CustomSelect";

const TELEGRAM_LINK = "https://t.me/your_channel"; // update this

const GOOGLE_FORM_ACTION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfltjeAwHPaZow6K8dk2NPbhlFA15MD1fVq8fl_fjQERocrMg/formResponse";

// Fields that officially support Google's __other_option_response__ mechanism
const OTHER_SUPPORTED_FIELDS = new Set(["existingAssets", "helpNeeded"]);

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
  type: "text" | "textarea" | "radio" | "checkbox" | "select";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  allowOther?: boolean;
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
        id: "category",
        label: "Arizangiz qaysi toifaga ko\u2018proq mos keladi?",
        type: "radio",
        options: [
          "Startup / innovatsion biznes",
          "An\u2019anaviy biznes",
          "Ijtimoiy biznes",
        ],
        required: true,
      },
      {
        id: "stage",
        label: "G\u2018oya yoki biznesingiz hozir qaysi bosqichda?",
        type: "radio",
        options: [
          "G\u2018oya va dastlabki o\u2018rganish",
          "Validatsiyadan o\u2018tgan g\u2018oya",
          "Prototip / namuna mahsulot",
          "MVP / test versiya",
        ],
        required: true,
      },
      {
        id: "name",
        label: "G\u2018oya yoki biznesingiz nomi nima?",
        type: "text",
        placeholder: "QuickFix Student Laundry",
        required: true,
      },
      {
        id: "teamType",
        label: "Yakka tarzda topshiryapsizmi yoki jamoa bilanmi?",
        type: "radio",
        options: ["Yakka", "Jamoa"],
        required: true,
      },
      {
        id: "teamMembers",
        label: "Jamoa a\u2019zolari va ularning rollarini yozing",
        type: "textarea",
        placeholder:
          "Aziza Karimova — founder va sales; Bekzod Tursunov — operations...",
        required: false,
      },
      {
        id: "region",
        label: "Bu biznes avvalo qaysi shahar yoki hududda faoliyat boshlaydi?",
        type: "text",
        placeholder: "Andijon shahri",
        required: true,
      },
    ],
  },
  {
    title: "Muammo va mijoz",
    fields: [
      {
        id: "targetCustomer",
        label: "Asosiy mijozingiz kim?",
        type: "textarea",
        placeholder:
          "Andijondagi yotoqxonalarda yashovchi... universitet talabalari.",
        required: true,
      },
      {
        id: "problem",
        label: "Siz aynan qaysi muammoni hal qilyapsiz?",
        type: "textarea",
        required: true,
      },
      {
        id: "currentSolution",
        label: "Mijozlar bu muammoni hozir qanday hal qilmoqda?",
        type: "textarea",
        required: true,
      },
      {
        id: "problemSeverity",
        label: "Bu muammo mijoz uchun qanchalik jiddiy?",
        type: "radio",
        options: [
          "Kichik noqulaylik",
          "O\u2018rtacha muammo",
          "Tez-tez uchraydigan muammo",
          "Jiddiy va xarajatli muammo",
        ],
        required: true,
      },
      {
        id: "whyNow",
        label: "Nega aynan hozir bu biznes yoki g\u2018oya uchun yaxshi vaqt?",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    title: "Validatsiya va dalillar",
    fields: [
      {
        id: "evidence",
        label:
          "Bu muammo haqiqatan ham mavjudligini ko\u2018rsatuvchi qanday dalillarga egasiz?",
        type: "checkbox",
        options: [
          "Mijozlar bilan suhbatlar",
          "So\u2018rovnoma",
          "Prototip testi",
          "Pilot foydalanuvchilar",
          "Sotuvlar",
          "Qaytib kelgan mijozlar",
          "Oldindan buyurtmalar",
          "Hamkor yoki ta\u2019minotchi bilan suhbatlar",
          "Bevosita kuzatuv",
          "Hozircha dalil yo\u2018q",
        ],
        required: true,
      },
      {
        id: "customerInterviews",
        label: "Nechta real maqsadli mijoz bilan gaplashdingiz?",
        type: "radio",
        options: ["0", "1\u20135", "6\u201310", "11\u201325", "26\u201350", "51+"],
        required: true,
        allowOther: true,
      },
      {
        id: "keyInsights",
        label: "Potensial mijozlardan o\u2018rgangan 2\u20133 ta eng muhim xulosangiz",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    title: "Yechim",
    fields: [
      {
        id: "solutionOneLiner",
        label: "Yechimingizni bitta gap bilan tasvirlab bering",
        type: "textarea",
        required: true,
      },
      {
        id: "businessType",
        label: "Bu qanday turdagi biznes?",
        type: "radio",
        options: [
          "Jismoniy mahsulot",
          "Raqamli mahsulot",
          "Xizmat biznesi",
          "Marketplace",
          "Chakana savdo",
          "Oziq-ovqat biznesi",
          "Qishloq xo\u2018jaligi biznesi",
          "Ishlab chiqarish",
          "Ta\u2019lim / trening",
        ],
        required: true,
        allowOther: true,
      },
      {
        id: "whyChooseYou",
        label: "Nega mijozlar sizni hozirgi alternativlar o\u2018rniga tanlaydi?",
        type: "textarea",
        required: true,
      },
      {
        id: "progressSoFar",
        label:
          "Bu g\u2018oyani oldinga siljitish uchun hozirgacha nimalar qildingiz?",
        type: "textarea",
        required: true,
      },
      {
        id: "existingAssets",
        label: "Quyidagilardan qaysilariga allaqachon egasiz?",
        type: "checkbox",
        options: [
          "Test foydalanuvchilar",
          "Oldindan buyurtmalar",
          "Ta\u2019minotchi bilan kelishuv",
          "Hamkor shartnomalar",
          "Ijtimoiy tarmoq sahifasi",
          "Hozircha yo\u2018q",
        ],
        required: true,
        allowOther: true,
      },
    ],
  },
  {
    title: "Biznes model",
    fields: [
      {
        id: "whoPays",
        label: "Mahsulot yoki xizmatingiz uchun kim to\u2018laydi?",
        type: "text",
        placeholder: "Yotoqxonada yashovchi talabalar",
        required: true,
      },
      {
        id: "revenueModel",
        label: "Qanday qilib pul ishlaysiz?",
        type: "textarea",
        required: true,
      },
      {
        id: "pricing",
        label: "Kutilayotgan sotuv narxingiz qancha?",
        type: "text",
        placeholder: "Har bir paket uchun 20 000\u201325 000 so\u2018m",
        required: true,
      },
      {
        id: "topExpenses",
        label: "Eng katta 3 ta xarajatingiz nima bo\u2018ladi?",
        type: "textarea",
        required: true,
      },
      {
        id: "profitability",
        label:
          "Bu biznes qanday qilib foydali bo\u2018lishini sodda qilib tushuntiring",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    title: "Bozor va raqobat",
    fields: [
      {
        id: "marketSize",
        label:
          "Birinchi bozoringizda nechta potensial mijozga chiqishingiz mumkin?",
        type: "textarea",
        required: true,
      },
      {
        id: "competitors",
        label: "Asosiy raqobatchilaringiz yoki alternativlaringiz kimlar?",
        type: "textarea",
        required: true,
      },
      {
        id: "advantage",
        label: "Hozir sizning eng kuchli ustunligingiz nima?",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    title: "Reja va xavflar",
    fields: [
      {
        id: "threeMonthGoal",
        label: "Tanlansangiz, keyingi 3 oy ichida nimaga erishasiz?",
        type: "textarea",
        required: true,
      },
      {
        id: "biggestRisk",
        label: "G\u2018oya yoki biznesingiz uchun eng katta xavf nima?",
        type: "textarea",
        required: true,
      },
      {
        id: "helpNeeded",
        label: "Sizga bu chempionatdan aynan qanday yordam eng kerak?",
        type: "checkbox",
        options: [
          "Mentorlik",
          "Moliyalashtirish",
          "Pilot imkoniyati",
          "Networking",
          "Branding / marketing",
          "Moliyaviy rejalashtirish",
          "Huquqiy yordam",
          "Texnik rivojlantirish",
        ],
        required: true,
        allowOther: true,
      },
      {
        id: "additionalNotes",
        label: "Qo\u2018shimcha izoh yoki muhim ma\u2019lumot",
        type: "textarea",
        required: false,
      },
    ],
  },
];

const inputBase =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none transition-all duration-200 focus:border-[#00A8FF] focus:ring-1 focus:ring-[#00A8FF]/30";

const GOOGLE_FORM_ENTRIES: Record<string, string> = {
  fullName: "entry.789908032",
  age: "entry.1517122898",
  gender: "entry.490628975",
  phone: "entry.1803456348",
  viloyat: "entry.348949898",
  category: "entry.992323779",
  stage: "entry.1709298470",
  name: "entry.1022668377",
  teamType: "entry.1417430762",
  teamMembers: "entry.120505463",
  region: "entry.1919334311",
  targetCustomer: "entry.322438804",
  problem: "entry.662418161",
  currentSolution: "entry.444575265",
  problemSeverity: "entry.1519145685",
  whyNow: "entry.212310446",
  evidence: "entry.1503938207",
  customerInterviews: "entry.1943443146",
  keyInsights: "entry.1308662833",
  solutionOneLiner: "entry.1534124629",
  businessType: "entry.575515277",
  whyChooseYou: "entry.2064733624",
  progressSoFar: "entry.1584637944",
  existingAssets: "entry.1612500101",
  whoPays: "entry.1264548198",
  revenueModel: "entry.592089784",
  pricing: "entry.447855417",
  topExpenses: "entry.218798324",
  profitability: "entry.1393227013",
  marketSize: "entry.374483972",
  competitors: "entry.662185883",
  advantage: "entry.1900937203",
  threeMonthGoal: "entry.114268597",
  biggestRisk: "entry.1602810355",
  helpNeeded: "entry.1285162981",
  additionalNotes: "entry.806670597",
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
export default function IdeasFormPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [otherValues, setOtherValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Scroll active step pill into view
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

  const toggleCheckbox = (id: string, option: string) => {
    setFormData((prev) => {
      const current = (prev[id] as string[]) || [];
      return {
        ...prev,
        [id]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      };
    });
    if (errors[id]) setErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  const updateOther = (id: string, value: string) => {
    setOtherValues((prev) => ({ ...prev, [id]: value }));
  };

  const validateFields = (fields: Field[]) => {
    const nextErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required === false) return;
      const value = formData[field.id];
      if (Array.isArray(value)) {
        if (value.length === 0) nextErrors[field.id] = "Bu maydon majburiy";
      } else if (!value || !String(value).trim()) {
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
      const value = formData[localKey];
      if (localKey === "phone") {
        payload.append(googleEntryKey, stripPhone(String(value || "")));
      } else if (Array.isArray(value)) {
        const otherText = otherValues[localKey] || "";
        value.forEach((v) => {
          if (v === "__other__") {
            if (OTHER_SUPPORTED_FIELDS.has(localKey)) {
              payload.append(googleEntryKey, "__other_option__");
              if (otherText) payload.append(googleEntryKey + ".other_option_response", otherText);
            } else if (otherText) {
              payload.append(googleEntryKey, otherText);
            }
          } else {
            payload.append(googleEntryKey, v);
          }
        });
      } else {
        if (value === "__other__" && otherValues[localKey]) {
          payload.append(googleEntryKey, otherValues[localKey]);
        } else {
          payload.append(googleEntryKey, String(value || ""));
        }
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
              value={(formData[field.id] as string) || ""}
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
              value={(formData[field.id] as string) || ""}
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
              value={(formData[field.id] as string) || ""}
              onChange={(val) => updateField(field.id, val)}
              options={field.options || []}
              placeholder={field.placeholder || "Tanlang..."}
              error={!!errors[field.id]}
            />
            {renderError(field.id)}
          </div>
        );

      case "radio": {
        const selectedVal = formData[field.id] as string;
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

              {field.allowOther && (
                <button
                  type="button"
                  onClick={() => updateField(field.id, "__other__")}
                  className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                    selectedVal === "__other__"
                      ? "bg-[#00A8FF]/10 border-[#00A8FF] text-white"
                      : "bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/[0.07]"
                  }`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        selectedVal === "__other__" ? "border-[#00A8FF]" : "border-white/30"
                      }`}
                    >
                      {selectedVal === "__other__" && <div className="w-2 h-2 rounded-full bg-[#00A8FF]" />}
                    </div>
                    <span className="text-sm">Boshqasi...</span>
                  </div>
                </button>
              )}
            </div>

            {field.allowOther && selectedVal === "__other__" && (
              <input
                type="text"
                className={`${inputBase} mt-3`}
                style={{ fontFamily: "var(--font-body)" }}
                placeholder="Javobingizni yozing..."
                value={otherValues[field.id] || ""}
                onChange={(e) => updateOther(field.id, e.target.value)}
              />
            )}

            {renderError(field.id)}
          </div>
        );
      }

      case "checkbox": {
        const checkedVals = (formData[field.id] as string[]) || [];
        return (
          <div>
            <div className="grid gap-2 sm:grid-cols-2">
              {field.options?.map((option) => {
                const checked = checkedVals.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleCheckbox(field.id, option)}
                    className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                      checked
                        ? "bg-[#00A8FF]/10 border-[#00A8FF] text-white"
                        : "bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/[0.07]"
                    } ${errors[field.id] && checkedVals.length === 0 ? "border-red-400" : ""}`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                          checked ? "border-[#00A8FF] bg-[#00A8FF]" : "border-white/30"
                        }`}
                      >
                        {checked && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm">{option}</span>
                    </div>
                  </button>
                );
              })}

              {field.allowOther && (
                <button
                  type="button"
                  onClick={() => toggleCheckbox(field.id, "__other__")}
                  className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                    checkedVals.includes("__other__")
                      ? "bg-[#00A8FF]/10 border-[#00A8FF] text-white"
                      : "bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/[0.07]"
                  }`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        checkedVals.includes("__other__") ? "border-[#00A8FF] bg-[#00A8FF]" : "border-white/30"
                      }`}
                    >
                      {checkedVals.includes("__other__") && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">Boshqasi...</span>
                  </div>
                </button>
              )}
            </div>

            {field.allowOther && checkedVals.includes("__other__") && (
              <input
                type="text"
                className={`${inputBase} mt-3`}
                style={{ fontFamily: "var(--font-body)" }}
                placeholder="Javobingizni yozing..."
                value={otherValues[field.id] || ""}
                onChange={(e) => updateOther(field.id, e.target.value)}
              />
            )}

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
                G&apos;oya yo&apos;nalishi
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
                ? "Oxirgi qadam — reja va xavflar haqida"
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
