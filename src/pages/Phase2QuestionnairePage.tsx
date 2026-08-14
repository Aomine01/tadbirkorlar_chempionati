import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Building2,
  Rocket,
  Shield,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  Check,
  X,
  Lock,
  ChevronRight,
  Award,
  FileSpreadsheet,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import logoWhite from "../assets/logos/white full.png";
import logoBlue from "../assets/logos/blue-full.png";
import HeroImage from "../assets/img/hero-image.png";
import HeroLightImage from "../assets/imglight/herolight.png";
import VideoPlayer from "../components/VideoPlayer";

const SECONDSTAGE_VIDEO_URL = "https://orxgpsqmadgfkmeqkvpy.supabase.co/storage/v1/object/public/participant-media/videos/secondstage.mp4";


/* ─── Interfaces & Constants ─────────────────────────────────── */

interface AllocationItem {
  category: string;
  categoryCustom?: string;
  amount: string;
  details: string;
}

interface UploadedDoc {
  file_name: string;
  file_url: string;
  file_size: number;
  doc_type: string;
  uploaded_at: string;
}

const ALLOCATION_CATEGORIES = [
  "Uskuna va jihozlar",
  "Aylanma mablag' (Xomashyo)",
  "Marketing va reklama",
  "Bino ijarasi va ta'mirlash",
  "Xodimlar ish haqi",
  "Boshqa xarajatlar",
];

const LEGAL_STRUCTURES = [
  "MChJ (Mas'uliyati cheklangan jamiyat)",
  "YaTT (Yakka tartibdagi tadbirkor)",
  "Fermer xo'jaligi",
  "Norasmiy faoliyat",
  "Boshqa",
];

const DRAFT_KEY = "chempionati_phase2_draft_v2";

/* ─── Full NDA Agreement Text ────────────────────────────────── */

const FULL_NDA_TEXT = `MAXFIYLIК TO‘G‘RISIDA KELISHUV
Toshkent shahri

Yoshlar tadbirkorligini rivojlantirish davlat maqsadli jamg‘armasi (keyingi o‘rinlarda - Qabul qiluvchi) hamda Qabul qiluvchining rasmiy veb-sayti va/yoki axborot tizimi orqali mazkur Kelishuv shartlariga elektron shaklda rozilik bildirgan hamda Qabul qiluvchiga o‘z faoliyati, loyihasi, arizasi yoki hamkorlik munosabatlari doirasida axborot taqdim etuvchi jismoniy yoki yuridik shaxs (keyingi o‘rinlarda - Oshkor qiluvchi), birgalikda Tomonlar, alohida holda Tomon deb atalib, quyidagilar haqida ushbu Maxfiylik to‘g‘risidagi kelishuvni (keyingi o‘rinlarda - Kelishuv) tuzadilar. Mazkur Kelishuv alohida qog‘oz shaklidagi imzoni talab qilmaydi va ushbu Kelishuvda belgilangan tartibda elektron shaklda rozilik bildirilgan paytdan boshlab Oshkor qiluvchi tomonidan qabul qilingan hisoblanadi.

1. KELISHUV PREDMETI
1.1. Ushbu Kelishuvga muvofiq, Oshkor qiluvchi o‘z faoliyati, loyihasi, arizasi yoki hamkorlik munosabatlari doirasida Qabul qiluvchiga maxfiy axborotni taqdim etadi, Qabul qiluvchi esa ushbu axborotdan faqat uni ko‘rib chiqish, baholash, tegishli qarorlarni tayyorlash va Tomonlar o‘rtasidagi hamkorlik maqsadlari doirasida foydalanish hamda uni ushbu Kelishuv shartlariga rioya qilgan holda saqlash majburiyatini oladi.

2. MAXFIY AXBOROTNI TAQDIM ETISH TARTIBI
2.1. Maxfiy axborot yozma, elektron, og‘zaki, grafik, audio, video yoki boshqa har qanday shaklda taqdim etilishi mumkin.
2.2. Elektron shakldagi maxfiy axborot Qabul qiluvchining rasmiy veb-sayti va shaxsiy kabineti orqali taqdim etiladi.

3. QABUL QILUVCHINING MAJBURIYATLARI
Qabul qiluvchi maxfiy axborotni uchinchi shaxslarga Oshkor qiluvchining roziligisiz oshkor etmaslik hamda uni saqlash uchun barcha tashkiliy-texnik choralarni ko‘rish majburiyatini oladi.

4. KELISHUVNING AMAL QILISH MUDDATI
Maxfiylik majburiyati Kelishuv qabul qilingan paytdan e'tiboran hamda Tomonlar o‘rtasidagi hamkorlik tugaganidan so‘ng 3 (uch) yil davomida amal qiladi.`;

/* ─── Main Component ─────────────────────────────────────────── */

export default function Phase2QuestionnairePage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isLight = theme === "light";

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Phase 1 Application ID
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // NDA Modal State
  const [ndaModalOpen, setNdaModalOpen] = useState(false);

  // ── Step 1 Form Data: General Info ──────────────────────────────
  const [companyName, setCompanyName] = useState("");
  const [legalStructure, setLegalStructure] = useState(LEGAL_STRUCTURES[0]);
  const [legalStructureCustom, setLegalStructureCustom] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
  const [ownershipStructure, setOwnershipStructure] = useState("");
  const [permanentEmployees, setPermanentEmployees] = useState("3");
  const [externalFunding, setExternalFunding] = useState("Yo'q");
  const [requestedAmount, setRequestedAmount] = useState("300000000"); // 300 MLN UZS
  const [allocations, setAllocations] = useState<AllocationItem[]>([
    { category: "Uskuna va jihozlar", amount: "180000000", details: "Zamonaviy ishlab chiqarish uskunasi xarid qilish" },
    { category: "Aylanma mablag' (Xomashyo)", amount: "80000000", details: "3 oylik xomashyo zaxirasini yaratish" },
    { category: "Marketing va reklama", amount: "40000000", details: "Raqamli marketing va brending ishlari" },
  ]);
  const [expectedOutcomes, setExpectedOutcomes] = useState("");
  const [taxStatus, setTaxStatus] = useState("");
  const [legalDisputes, setLegalDisputes] = useState("Yo'q");
  const [legalDisputesComment, setLegalDisputesComment] = useState("");

  // ── Step 1 Form Data: Category Selection (Question 1) ──────────
  const [category, setCategory] = useState<"business" | "startup">("business");
  const [categoryCustom, setCategoryCustom] = useState("");

  // ── Step 3A Form Data: Traditional Business (Section A) ────────
  const [rev12mDynamics, setRev12mDynamics] = useState("");
  const [expectedRev12m, setExpectedRev12m] = useState("");
  const [currentKeyMetrics, setCurrentKeyMetrics] = useState("");
  const [expectedKeyMetrics12m, setExpectedKeyMetrics12m] = useState("");
  const [currentDebts, setCurrentDebts] = useState("");
  const [assetsAndCollateral, setAssetsAndCollateral] = useState("");
  const [exportPlans, setExportPlans] = useState("");
  const [monthlyNetProfit, setMonthlyNetProfit] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [averageMargin, setAverageMargin] = useState("");

  // ── Step 3B Form Data: Startup / Innovation (Section B) ─────────
  const [productStage, setProductStage] = useState("MVP");
  const [productStageCustom, setProductStageCustom] = useState("");
  const [businessModel, setBusinessModel] = useState("");
  const [currentTraction, setCurrentTraction] = useState("");
  const [expectedTraction12m, setExpectedTraction12m] = useState("");
  const [targetMarketSize, setTargetMarketSize] = useState("");
  const [competitiveAdvantage, setCompetitiveAdvantage] = useState("");

  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);

  // ── Step 5 Form Data: NDA & Declarations ────────────────────────
  const [truthfulnessDeclared, setTruthfulnessDeclared] = useState(false);
  const [ndaAgreed, setNdaAgreed] = useState(false);
  const [ndaSignerName, setNdaSignerName] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Restore Draft from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.currentStep) setCurrentStep(d.currentStep);
        if (d.companyName) setCompanyName(d.companyName);
        if (d.legalStructure) setLegalStructure(d.legalStructure);
        if (d.legalStructureCustom) setLegalStructureCustom(d.legalStructureCustom);
        if (d.registrationDate) setRegistrationDate(d.registrationDate);
        if (d.ownershipStructure) setOwnershipStructure(d.ownershipStructure);
        if (d.permanentEmployees) setPermanentEmployees(d.permanentEmployees);
        if (d.externalFunding) setExternalFunding(d.externalFunding);
        if (d.requestedAmount) setRequestedAmount(d.requestedAmount);
        if (Array.isArray(d.allocations)) setAllocations(d.allocations);
        if (d.expectedOutcomes) setExpectedOutcomes(d.expectedOutcomes);
        if (d.taxStatus) setTaxStatus(d.taxStatus);
        if (d.legalDisputes) setLegalDisputes(d.legalDisputes);
        if (d.legalDisputesComment) setLegalDisputesComment(d.legalDisputesComment);
        if (d.category) setCategory(d.category);
        if (d.categoryCustom) setCategoryCustom(d.categoryCustom);
        if (d.rev12mDynamics) setRev12mDynamics(d.rev12mDynamics);
        if (d.expectedRev12m) setExpectedRev12m(d.expectedRev12m);
        if (d.currentKeyMetrics) setCurrentKeyMetrics(d.currentKeyMetrics);
        if (d.expectedKeyMetrics12m) setExpectedKeyMetrics12m(d.expectedKeyMetrics12m);
        if (d.currentDebts) setCurrentDebts(d.currentDebts);
        if (d.assetsAndCollateral) setAssetsAndCollateral(d.assetsAndCollateral);
        if (d.exportPlans) setExportPlans(d.exportPlans);
        if (d.monthlyNetProfit) setMonthlyNetProfit(d.monthlyNetProfit);
        if (d.monthlyExpenses) setMonthlyExpenses(d.monthlyExpenses);
        if (d.averageMargin) setAverageMargin(d.averageMargin);
        if (d.productStage) setProductStage(d.productStage);
        if (d.productStageCustom) setProductStageCustom(d.productStageCustom);
        if (d.businessModel) setBusinessModel(d.businessModel);
        if (d.currentTraction) setCurrentTraction(d.currentTraction);
        if (d.expectedTraction12m) setExpectedTraction12m(d.expectedTraction12m);
        if (d.targetMarketSize) setTargetMarketSize(d.targetMarketSize);
        if (d.competitiveAdvantage) setCompetitiveAdvantage(d.competitiveAdvantage);
        if (Array.isArray(d.uploadedDocs)) setUploadedDocs(d.uploadedDocs);
        if (d.ndaSignerName) setNdaSignerName(d.ndaSignerName);
        if (d.additionalNotes) setAdditionalNotes(d.additionalNotes);
      } catch (e) {
        console.error("Draft restore error:", e);
      }
    }
  }, []);

  // Save Draft automatically on any state change
  useEffect(() => {
    const draft = {
      currentStep,
      companyName,
      legalStructure,
      legalStructureCustom,
      registrationDate,
      ownershipStructure,
      permanentEmployees,
      externalFunding,
      requestedAmount,
      allocations,
      expectedOutcomes,
      taxStatus,
      legalDisputes,
      legalDisputesComment,
      category,
      categoryCustom,
      rev12mDynamics,
      expectedRev12m,
      currentKeyMetrics,
      expectedKeyMetrics12m,
      currentDebts,
      assetsAndCollateral,
      exportPlans,
      monthlyNetProfit,
      monthlyExpenses,
      averageMargin,
      productStage,
      productStageCustom,
      businessModel,
      currentTraction,
      expectedTraction12m,
      targetMarketSize,
      competitiveAdvantage,
      uploadedDocs,
      ndaSignerName,
      additionalNotes,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [
    currentStep,
    companyName,
    legalStructure,
    legalStructureCustom,
    registrationDate,
    ownershipStructure,
    permanentEmployees,
    externalFunding,
    requestedAmount,
    allocations,
    expectedOutcomes,
    taxStatus,
    legalDisputes,
    legalDisputesComment,
    category,
    categoryCustom,
    rev12mDynamics,
    expectedRev12m,
    currentKeyMetrics,
    expectedKeyMetrics12m,
    currentDebts,
    assetsAndCollateral,
    exportPlans,
    monthlyNetProfit,
    monthlyExpenses,
    averageMargin,
    productStage,
    productStageCustom,
    businessModel,
    currentTraction,
    expectedTraction12m,
    targetMarketSize,
    competitiveAdvantage,
    uploadedDocs,
    ndaSignerName,
    additionalNotes,
  ]);

  // Fetch applicant's Phase 1 app data and pre-fill category
  useEffect(() => {
    if (!user) return;
    async function loadApplicantData() {
      const { data } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const app = data[0];
        setApplicationId(app.id);
        if (!companyName) setCompanyName(app.brand_name || app.legal_name || "");
        // Pre-fill category from Phase 1 (ideas → business)
        if (app.category === "startup") setCategory("startup");
        else setCategory("business");
      }
    }
    loadApplicantData();
  }, [user]);

  // Helper: Format number string with spaces (e.g., 180000000 -> 180 000 000)
  const formatNumberWithSpaces = (val: string): string => {
    const raw = val.replace(/\D/g, "");
    if (!raw) return "";
    return Number(raw).toLocaleString("ru-RU").replace(/\u00A0/g, " ");
  };

  const handleMoneyInput = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberWithSpaces(e.target.value);
    setter(formatted);
  };







  // Handle Submit
  const handleSubmitPhase2 = async () => {
    if (!truthfulnessDeclared) {
      setErrorMsg("Iltimos, ma'lumotlar haqqoniyligini tasdiqlang.");
      return;
    }
    if (!ndaAgreed) {
      setErrorMsg("Iltimos, Maxfiylik to'g'risidagi kelishuv (NDA) shartlariga rozilik bildiring.");
      return;
    }
    if (!user) {
      setErrorMsg("Tizimga kiring.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const finalLegalStructure = legalStructure === "Boshqa" ? `Boshqa: ${legalStructureCustom}` : legalStructure;
      const finalProductStage = productStage === "Boshqa" ? `Boshqa: ${productStageCustom}` : productStage;
      const parsedRequestedAmount = parseInt(requestedAmount.replace(/\D/g, "") || "0");
      const sectionAData = {
        revenue_12m_dynamics: rev12mDynamics,
        expected_revenue_12m: expectedRev12m,
        monthly_net_profit: monthlyNetProfit,
        monthly_expenses: monthlyExpenses,
        average_margin: averageMargin,
        current_key_metrics: currentKeyMetrics,
        expected_key_metrics_12m: expectedKeyMetrics12m,
        current_debts_and_payments: currentDebts,
        assets_and_collateral: assetsAndCollateral,
        export_plans: exportPlans,
      };

      const sectionBData = {
        product_stage: finalProductStage,
        business_model: businessModel,
        current_traction_mau_mrr: currentTraction,
        expected_traction_12m: expectedTraction12m,
        target_market_size: targetMarketSize,
        competitive_advantage_ip: competitiveAdvantage,
      };

      const payload = {
        application_id: applicationId,
        user_id: user.id,
        category: category,
        company_name: companyName,
        legal_structure: finalLegalStructure,
        registration_date: registrationDate || null,
        ownership_structure: ownershipStructure,
        permanent_employees_count: parseInt(permanentEmployees) || 0,
        external_funding_details: externalFunding,
        requested_investment_amount: parsedRequestedAmount,
        investment_allocation: allocations,
        expected_outcomes: expectedOutcomes,
        tax_and_license_status: taxStatus,
        legal_disputes_status: legalDisputes === "Ha" ? `Ha: ${legalDisputesComment}` : "Yo'q",
        section_a_data: category === "business" ? sectionAData : {},
        section_b_data: category === "startup" ? sectionBData : {},
        uploaded_documents: uploadedDocs,
        truthfulness_declared: truthfulnessDeclared,
        nda_agreed: ndaAgreed,
        nda_agreed_at: new Date().toISOString(),
        nda_signer_name: ndaSignerName || companyName,
        nda_user_ip: "127.0.0.1",
        nda_version: "1.0",
        additional_notes: additionalNotes,
        status: "under_review",
      };

      const { error: insertErr } = await supabase
        .from("phase2_applications")
        .insert([payload] as any);

      if (insertErr) {
        console.error("Error inserting Phase 2 application:", insertErr);
        setErrorMsg(`Xatolik: ${insertErr.message}`);
        setSubmitting(false);
        return;
      }

      // Clear localStorage draft on success
      localStorage.removeItem(DRAFT_KEY);

      setSuccessMsg("2-Bosqich so'rovnomasi va hujjatlaringiz muvaffaqiyatli topshirildi!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Submission exception:", err);
      setErrorMsg("Kutilmagan xatolik yuz berdi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 relative selection:bg-[#00A8FF]/20 ${
        isLight ? "bg-[#F8FAFC] text-slate-800" : "bg-[#000001] text-white"
      }`}
      style={{
        fontFamily: "var(--font-body)",
        backgroundImage: `url(${isLight ? HeroLightImage : HeroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight ? "bg-white/90 backdrop-blur-xs" : "bg-black/85 backdrop-blur-xs"
        }`}
      />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        className={`h-16 border-b sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between backdrop-blur-md transition-colors ${
          isLight ? "bg-white/90 border-slate-200/80 shadow-xs" : "bg-[#0a0c10]/95 border-white/10 shadow-lg"
        }`}
      >
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all duration-200 cursor-pointer ${
              isLight
                ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs"
                : "bg-white/5 border-white/10 text-white/90 hover:bg-white/10 hover:text-white"
            }`}
          >
            <ArrowLeft size={16} />
            <span>Kabinetga qaytish</span>
          </Link>
          <div className="h-4 w-px bg-slate-300 dark:bg-white/10 hidden sm:block" />
          <img
            src={isLight ? logoBlue : logoWhite}
            alt="Logo"
            className="h-7 w-auto object-contain hidden sm:block"
          />
        </div>
      </header>

      {/* ── Main Container ────────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10 my-4">
        <div
          className={`rounded-3xl border p-6 sm:p-10 backdrop-blur-md shadow-2xl transition-all ${
            isLight ? "bg-white/95 border-slate-200/90" : "bg-[#0a0c10]/95 border-white/10"
          }`}
        >
          {/* Header Title */}
          <div className="flex flex-col gap-2 mb-6 border-b pb-6 border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-[#00A8FF]" />
                <span className="text-xs font-semibold text-[#00A8FF] tracking-wide">
                  Yosh Tadbirkorlar Chempionati 2026
                </span>
              </div>

              <span className="text-xs font-semibold text-slate-400">
                Bosqich {currentStep} / 4
              </span>
            </div>

            <h1
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              2-Bosqich Moliyaviy va Biznes Tahlili So'rovnomasi
            </h1>
            <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? "text-slate-600" : "text-white/70"}`}>
              Ushbu so'rovnoma investorlar va hakamlar hay'ati uchun loyihangizning moliyaviy barqarorligi va samaradorligini baholashga xizmat qiladi.
            </p>
          </div>

          {/* ── VIDEO GUIDANCE BANNER ────────────────────────────────── */}
          <div className="mb-8 rounded-2xl border border-[#00A8FF]/30 bg-[#00A8FF]/5 p-5 sm:p-6 backdrop-blur-md flex flex-col gap-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#00A8FF]">
              <Award size={20} />
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide" style={{ fontFamily: "var(--font-zuume)" }}>
                2-BOSQICH TUSHIUNTIRISH VA YO'RIQNOMA VIDEOSI
              </h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed max-w-3xl">
              So'rovnomani to'ldirishdan oldin 2-bosqich talablari, moliyaviy jadval va hujjatlarni topshirish bo'yicha tayyorlangan quyidagi video qo'llanmani diqqat bilan tomosha qiling.
            </p>
            <VideoPlayer
              src={SECONDSTAGE_VIDEO_URL}
              title="2-Bosqich Yo'riqnomasi"
              subtitle="Yosh Tadbirkorlar Chempionati 2026"
              className="w-full aspect-video rounded-xl shadow-2xl"
            />
          </div>

          {/* ── STEPPER ───────────────────────────────────────────── */}
          <div className="mb-8 flex flex-col gap-3">
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden relative shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#00A8FF] via-blue-500 to-emerald-400 transition-all duration-500 rounded-full shadow-lg shadow-[#00A8FF]/50"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {[
                { step: 1, label: "Toifa" },
                { step: 2, label: "Ma'lumotlar" },
                { step: 3, label: "Moliya" },
                { step: 4, label: "NDA va Tasdiq" },
              ].map((s) => {
                const isCompleted = currentStep > s.step;
                const isCurrent = currentStep === s.step;

                return (
                  <button
                    key={s.step}
                    onClick={() => s.step <= currentStep && setCurrentStep(s.step)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                      isCurrent
                        ? "border-[#00A8FF] bg-[#00A8FF]/15 text-[#00A8FF] font-semibold shadow-xs scale-102"
                        : isCompleted
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium"
                        : isLight
                        ? "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                        : "border-white/5 bg-white/5 text-white/30 hover:border-white/10 hover:text-white/60"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={13} className="text-emerald-400" /> : <span className="text-xs font-semibold font-mono">{s.step}</span>}
                    <span className="text-[10px] font-medium truncate w-full text-center">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2.5">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 1: CATEGORY SELECTION                                   */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="text-center flex flex-col gap-2 my-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00A8FF]/15 text-[#00A8FF] border border-[#00A8FF]/30 self-center">
                  1-Bosqich — Loyiha toifasini tanlash
                </span>
                <h3 className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                  Loyihangiz Qaysi Toifaga Kiradi?
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-4">
                <div
                  onClick={() => setCategory("business")}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-4 relative group ${
                    category === "business"
                      ? "border-[#00A8FF] bg-[#00A8FF]/10 shadow-xl scale-102"
                      : isLight ? "border-slate-200 bg-slate-50 hover:border-blue-300" : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  {category === "business" && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#00A8FF] text-white flex items-center justify-center shadow-md">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                  <div className="w-14 h-14 rounded-2xl bg-[#00A8FF]/20 text-[#00A8FF] flex items-center justify-center border border-[#00A8FF]/30">
                    <Building2 size={28} />
                  </div>
                  <h4 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>An'anaviy Biznes</h4>
                  <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-white/70"}`}>Mavjud tushum va doimiy mijozlar bazasiga ega korxona.</p>
                </div>

                <div
                  onClick={() => setCategory("startup")}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-4 relative group ${
                    category === "startup"
                      ? "border-[#00A8FF] bg-[#00A8FF]/10 shadow-xl scale-102"
                      : isLight ? "border-slate-200 bg-slate-50 hover:border-blue-300" : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  {category === "startup" && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#00A8FF] text-white flex items-center justify-center shadow-md">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Rocket size={28} />
                  </div>
                  <h4 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Startap / Innovatsiya</h4>
                  <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-white/70"}`}>Yangi texnologik yechim, tez o'suvchi biznes modeli.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg active:scale-[0.97] cursor-pointer ${
                    isLight ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white text-[#0a0f2c] hover:bg-white/90 shadow-white/10"
                  }`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  <span>Keyingi bosqich: Umumiy ma'lumotlar</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h3
                className={`text-xl sm:text-2xl font-bold uppercase tracking-wider flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
                style={{ fontFamily: "var(--font-zuume)" }}
              >
                <Building2 size={20} className="text-[#00A8FF]" />
                <span>2-Bo'lim — Umumiy va Operatsion Ma'lumotlar</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                    1. Korxona nomi va mas'ul shaxs F.I.Sh. *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Masalan: MChJ 'Ideal Plast' / Raxmonov Alisher"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#00A8FF]" : "bg-white/5 border-white/10 text-white focus:border-[#00A8FF]"
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                    2. Tashkiliy-huquqiy shakli *
                  </label>
                  <select
                    value={legalStructure}
                    onChange={(e) => setLegalStructure(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none cursor-pointer ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-[#0a0c10] border-white/10 text-white"
                    }`}
                  >
                    {LEGAL_STRUCTURES.map((ls) => (
                      <option key={ls} value={ls}>{ls}</option>
                    ))}
                  </select>
                  {legalStructure === "Boshqa" && (
                    <input
                      type="text"
                      value={legalStructureCustom}
                      onChange={(e) => setLegalStructureCustom(e.target.value)}
                      placeholder="Boshqa shaklni yozing..."
                      className={`w-full mt-1 px-4 py-2 rounded-xl border text-xs outline-none ${isLight ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-white/8 border-white/20 text-white"}`}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                    3. Ro'yxatdan o'tgan sana
                  </label>
                  <input
                    type="date"
                    value={registrationDate}
                    onChange={(e) => setRegistrationDate(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-white"
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                    4. Doimiy xodimlar soni *
                  </label>
                  <input
                    type="number"
                    value={permanentEmployees}
                    onChange={(e) => setPermanentEmployees(e.target.value)}
                    placeholder="3"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-white"
                    }`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                  5. Egalik tuzilmasi (Kim, necha foiz ulushga ega?) *
                </label>
                <textarea
                  rows={2}
                  value={ownershipStructure}
                  onChange={(e) => setOwnershipStructure(e.target.value)}
                  placeholder="Masalan: Raxmonov A. - 70%, Karimov B. - 30%"
                  className={`w-full p-3 rounded-xl border text-xs outline-none resize-none ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-white"
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                  6. Asosiy faoliyat tavsifi va mahsulot/xizmat turi *
                </label>
                <textarea
                  rows={2}
                  value={expectedOutcomes}
                  onChange={(e) => setExpectedOutcomes(e.target.value)}
                  placeholder="Loyihaning asosiy mahsulotlari va faoliyat yo'nalishi"
                  className={`w-full p-3 rounded-xl border text-xs outline-none resize-none ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-white"
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                  7. Sudlanganlik yoki huquqiy nizolar mavjudmi? *
                </label>
                <div className="flex items-center gap-4 py-1">
                  {["Yo'q", "Ha"].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="legalDisputes"
                        value={opt}
                        checked={legalDisputes === opt}
                        onChange={(e) => setLegalDisputes(e.target.value)}
                        className="text-[#00A8FF] focus:ring-[#00A8FF]"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {legalDisputes === "Ha" && (
                  <textarea
                    rows={2}
                    value={legalDisputesComment}
                    onChange={(e) => setLegalDisputesComment(e.target.value)}
                    placeholder="Nizo mazmunini yozing..."
                    className="w-full p-3 rounded-xl border text-xs bg-rose-500/10 border-rose-500/30 text-rose-300 outline-none mt-1"
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                    isLight ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                  }`}
                >
                  Orqaga
                </button>

                <button
                  onClick={() => {
                    if (!companyName.trim()) {
                      setErrorMsg("Iltimos, Korxona nomini kiriting.");
                      return;
                    }
                    setErrorMsg("");
                    setCurrentStep(3);
                  }}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg active:scale-[0.97] cursor-pointer ${
                    isLight ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white text-[#0a0f2c] hover:bg-white/90 shadow-white/10"
                  }`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  <span>Keyingi bosqich: Moliyaviy ko'rsatkichlar</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 3: FINANCIAL ANALYSIS & INVESTMENT ALLOCATION           */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h3
                className={`text-xl sm:text-2xl font-bold uppercase tracking-wider flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
                style={{ fontFamily: "var(--font-zuume)" }}
              >
                <FileSpreadsheet size={20} className="text-[#00A8FF]" />
                <span>3-Bo'lim — Moliyaviy Ko'rsatkichlar va Investitsiya Tahlili</span>
              </h3>

              {/* Monthly Financial Stats (Profit, Expenses, Margin) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                    Sof foyda oylik (UZS) *
                  </label>
                  <input
                    type="text"
                    value={monthlyNetProfit}
                    onChange={handleMoneyInput(setMonthlyNetProfit)}
                    placeholder="Masalan: 25 000 000"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono outline-none ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-white"
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                    Harajatlar oylik (UZS) *
                  </label>
                  <input
                    type="text"
                    value={monthlyExpenses}
                    onChange={handleMoneyInput(setMonthlyExpenses)}
                    placeholder="Masalan: 15 000 000"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono outline-none ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-white"
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                    O'rtacha marja (%) *
                  </label>
                  <input
                    type="text"
                    value={averageMargin}
                    onChange={(e) => setAverageMargin(e.target.value)}
                    placeholder="Masalan: 25%"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono outline-none ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-white"
                    }`}
                  />
                </div>
              </div>

              {category === "business" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                      O'tgan 12 oylik daromad (UZS) *
                    </label>
                    <input
                      type="text"
                      value={rev12mDynamics}
                      onChange={handleMoneyInput(setRev12mDynamics)}
                      placeholder="Masalan: 450 000 000"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono outline-none ${
                        isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-white"
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                      Investitsiya olgandan keyin kutilayotgan yillik tushum (UZS) *
                    </label>
                    <input
                      type="text"
                      value={expectedRev12m}
                      onChange={handleMoneyInput(setExpectedRev12m)}
                      placeholder="Masalan: 1 200 000 000"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono outline-none ${
                        isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-white"
                      }`}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                      Hozirgi traksiya (MAU, MRR, Mijozlar) *
                    </label>
                    <input
                      type="text"
                      value={currentTraction}
                      onChange={(e) => setCurrentTraction(e.target.value)}
                      placeholder="1,200 MAU, MRR: $3,500"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                        isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-white"
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                      Investitsiya olgandan keyin kutilayotgan yillik tushum *
                    </label>
                    <input
                      type="text"
                      value={expectedTraction12m}
                      onChange={(e) => setExpectedTraction12m(e.target.value)}
                      placeholder="15,000 MAU, MRR: $25,000"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                        isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-white"
                      }`}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                  So'ralayotgan investitsiya summasi (UZS) *
                </label>
                <input
                  type="text"
                  value={requestedAmount}
                  onChange={handleMoneyInput(setRequestedAmount)}
                  placeholder="300 000 000"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono font-bold outline-none ${
                    isLight ? "bg-slate-50 border-slate-200 text-[#00A8FF]" : "bg-white/5 border-white/10 text-[#00A8FF]"
                  }`}
                />
              </div>

              {/* Allocation Table */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                    Investitsiya mablag'larini yo'naltirish taqsimoti *
                  </label>
                  <button
                    onClick={() =>
                      setAllocations((prev) => [
                        ...prev,
                        { category: ALLOCATION_CATEGORIES[0], amount: "0", details: "" },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00A8FF] hover:text-[#0088cc] cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Yo'nalish qo'shish</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {allocations.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-center gap-3 ${
                        isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                      }`}
                    >
                      <select
                        value={item.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAllocations((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, category: val } : it))
                          );
                        }}
                        className={`w-full sm:w-1/3 px-3 py-2 rounded-xl border text-xs outline-none ${
                          isLight ? "bg-white border-slate-200 text-slate-800" : "bg-[#0a0c10] border-white/10 text-white"
                        }`}
                      >
                        {ALLOCATION_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={item.amount}
                        onChange={(e) => {
                          const val = formatNumberWithSpaces(e.target.value);
                          setAllocations((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, amount: val } : it))
                          );
                        }}
                        placeholder="Summa (UZS)"
                        className={`w-full sm:w-1/3 px-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                          isLight ? "bg-white border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-white"
                        }`}
                      />

                      <input
                        type="text"
                        value={item.details}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAllocations((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, details: val } : it))
                          );
                        }}
                        placeholder="Maqsad / izoh"
                        className={`w-full sm:w-1/3 px-3 py-2 rounded-xl border text-xs outline-none ${
                          isLight ? "bg-white border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-white"
                        }`}
                      />

                      {allocations.length > 1 && (
                        <button
                          onClick={() => setAllocations((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                    isLight ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                  }`}
                >
                  Orqaga
                </button>

                <button
                  onClick={() => setCurrentStep(4)}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg active:scale-[0.97] cursor-pointer ${
                    isLight ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white text-[#0a0f2c] hover:bg-white/90 shadow-white/10"
                  }`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  <span>Keyingi bosqich: NDA va tasdiq</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 4: ELECTRONIC NDA & FINAL SUBMISSION (Overhauled UI/UX) */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h3
                className={`text-xl sm:text-2xl font-bold uppercase tracking-wider flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
                style={{ fontFamily: "var(--font-zuume)" }}
              >
                <Shield size={20} className="text-[#00A8FF]" />
                <span>4-Bo'lim — Maxfiylik va Yakuniy Tasdiqlash</span>
              </h3>

              {/* Summary Card */}
              <div className="p-5 rounded-2xl border border-[#00A8FF]/30 bg-[#00A8FF]/5 flex flex-col gap-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#00A8FF]/20 pb-3">
                  <div className="flex items-center gap-2 text-[#00A8FF] font-semibold text-xs">
                    <FileSpreadsheet size={18} />
                    <span>Moliyaviy va Arizaga Oid Xulosa</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#00A8FF]/20 text-[#00A8FF] font-mono text-[10px] font-bold">
                    PREVIEW
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 flex flex-col gap-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Korxona Nomi:</span>
                    <span className="font-bold text-white">{companyName || "N/A"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 flex flex-col gap-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Tashkiliy Shakli:</span>
                    <span className="font-bold text-white">
                      {legalStructure === "Boshqa" ? legalStructureCustom || "Boshqa" : legalStructure}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 flex flex-col gap-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">So'ralayotgan Investitsiya:</span>
                    <span className="font-extrabold text-[#00A8FF] font-mono text-sm">
                      {requestedAmount || "0"} UZS
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 flex flex-col gap-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Toifa:</span>
                    <span className="font-bold text-emerald-400">
                      {category === "business" ? "An'anaviy Biznes" : "Startap / Innovatsiya"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable Readable NDA Box */}
              <div className={`rounded-2xl border p-4 sm:p-5 flex flex-col gap-3 transition-colors ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-[#0c0e14] border-white/10"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#00A8FF] font-semibold text-xs">
                    <Lock size={16} />
                    <span>Maxfiylik To'g'risida Kelishuv (NDA) Matni</span>
                  </div>

                  <button
                    onClick={() => setNdaModalOpen(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#00A8FF] hover:underline cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>Kengaytirilgan o'qish</span>
                  </button>
                </div>

                {/* Styled Scrollable Container */}
                <div className={`p-4 rounded-xl border max-h-52 overflow-y-auto font-sans text-xs leading-relaxed space-y-3 whitespace-pre-line ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-700 shadow-inner"
                    : "bg-[#050608] border-white/10 text-white/80 shadow-inner"
                }`}>
                  {FULL_NDA_TEXT}
                </div>
              </div>

              {/* Enhanced Interactive Checkboxes */}
              <div className="flex flex-col gap-3">
                <div
                  onClick={() => setNdaAgreed(!ndaAgreed)}
                  className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all cursor-pointer ${
                    ndaAgreed
                      ? isLight
                        ? "bg-blue-50/80 border-[#00A8FF] text-slate-900 shadow-sm"
                        : "bg-[#00A8FF]/15 border-[#00A8FF]/50 text-white shadow-sm"
                      : isLight
                      ? "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                      : "bg-white/5 border-white/10 hover:border-white/20 text-white/80"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                    ndaAgreed
                      ? "bg-[#00A8FF] border-[#00A8FF] text-white"
                      : isLight
                      ? "border-slate-300 bg-white"
                      : "border-white/20 bg-white/5"
                  }`}>
                    {ndaAgreed && <Check size={14} className="stroke-[3]" />}
                  </div>
                  <span className="text-xs font-semibold leading-normal select-none">
                    Maxfiylik to'g'risidagi kelishuv (NDA) shartlari bilan tanishdim va ularga to'liq roziman *
                  </span>
                </div>

                <div
                  onClick={() => setTruthfulnessDeclared(!truthfulnessDeclared)}
                  className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all cursor-pointer ${
                    truthfulnessDeclared
                      ? isLight
                        ? "bg-emerald-50/80 border-emerald-500 text-slate-900 shadow-sm"
                        : "bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm"
                      : isLight
                      ? "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                      : "bg-white/5 border-white/10 hover:border-white/20 text-white/80"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                    truthfulnessDeclared
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : isLight
                      ? "border-slate-300 bg-white"
                      : "border-white/20 bg-white/5"
                  }`}>
                    {truthfulnessDeclared && <Check size={14} className="stroke-[3]" />}
                  </div>
                  <span className="text-xs font-semibold leading-normal select-none">
                    Taqdim etilgan barcha moliyaviy va huquqiy ma'lumotlar aniq va haqiqiy ekanligini tasdiqlayman *
                  </span>
                </div>
              </div>

              {/* Signer Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>
                  Tasdiqlovchi shaxs F.I.Sh. (Elektron imzo o'rniga)
                </label>
                <input
                  type="text"
                  value={ndaSignerName}
                  onChange={(e) => setNdaSignerName(e.target.value)}
                  placeholder="Masalan: Raxmonov Alisher Zokirovich"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-white"
                  }`}
                />
              </div>

              {/* Submit Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setCurrentStep(3)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                    isLight ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                  }`}
                >
                  Orqaga
                </button>

                <button
                  onClick={handleSubmitPhase2}
                  disabled={submitting}
                  className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg active:scale-[0.97] cursor-pointer disabled:opacity-60 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed ${
                    isLight
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-white text-[#0a0f2c] hover:bg-white/90 shadow-white/10"
                  }`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  {submitting ? (
                    <div
                      className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                        isLight ? "border-white" : "border-[#0a0f2c]"
                      }`}
                    />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  <span>2-Bosqich so'rovnomasini topshirish</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── FULL TEXT NDA MODAL READER ─────────────────────────────── */}
      {ndaModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className={`max-w-2xl w-full max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
              isLight ? "bg-white border-slate-200" : "bg-[#0a0c10] border-white/10 text-white"
            }`}
          >
            <div className={`p-5 border-b flex items-center justify-between ${isLight ? "border-slate-100" : "border-white/10"}`}>
              <div className="flex items-center gap-2 text-[#00A8FF]">
                <Shield size={20} />
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  Maxfiylik To'g'risida Kelishuv (NDA)
                </h3>
              </div>
              <button
                onClick={() => setNdaModalOpen(false)}
                className={`p-1.5 rounded-xl border cursor-pointer ${isLight ? "border-slate-200 text-slate-500" : "border-white/10 text-white/60"}`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto font-sans text-xs leading-relaxed space-y-4 whitespace-pre-line text-slate-700 dark:text-white/80">
              {FULL_NDA_TEXT}
            </div>

            <div className={`p-4 border-t flex items-center justify-between ${isLight ? "border-slate-100 bg-slate-50" : "border-white/10 bg-white/5"}`}>
              <span className="text-[11px] font-mono text-slate-400">Versiya: 1.0 (Elektron Shartnoma)</span>
              <button
                onClick={() => {
                  setNdaAgreed(true);
                  setNdaModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#00A8FF] hover:bg-[#0090FF] text-white font-semibold text-xs transition-all duration-200 shadow-md active:scale-[0.98] cursor-pointer"
              >
                Rozilik bildirish va qabul qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
