import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ArrowLeft,
  XCircle,
  AlertCircle,
  FileText,
  LogOut,
  X,
  Shield,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  Layers,
  UserCheck,
  Inbox,
  Menu,
  Building2,
  Rocket,
  FileCheck,
  Download,
  Award,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../contexts/ThemeContext";
import logoWhite from "../../assets/logos/white full.png";
import logoBlue from "../../assets/logos/blue-full.png";
import HeroImage from "../../assets/img/hero-image.png";
import HeroLightImage from "../../assets/imglight/herolight.png";

/* ─── Status Types & Configurations ───────────────────────────── */

export type StatusKey = "yangi_ariza" | "korib_chiqilmoqda" | "qaytarildi" | "rad_etildi" | "tasdiqlangan";

export interface StatusConfig {
  key: StatusKey;
  label: string;
  darkBg: string;
  darkText: string;
  darkBorder: string;
  dotColor: string;
  lightBg: string;
  lightText: string;
  lightBorder: string;
  stepIndex: number;
}

export const STATUS_LIST: StatusConfig[] = [
  {
    key: "yangi_ariza",
    label: "Yangi Ariza",
    darkBg: "bg-violet-500/15",
    darkText: "text-violet-400",
    darkBorder: "border-violet-500/40",
    dotColor: "bg-violet-400",
    lightBg: "bg-violet-50",
    lightText: "text-violet-700",
    lightBorder: "border-violet-200",
    stepIndex: 0,
  },
  {
    key: "korib_chiqilmoqda",
    label: "Ko'rib chiqilmoqda",
    darkBg: "bg-[#00A8FF]/15",
    darkText: "text-[#00A8FF]",
    darkBorder: "border-[#00A8FF]/40",
    dotColor: "bg-[#00A8FF]",
    lightBg: "bg-sky-50",
    lightText: "text-sky-700",
    lightBorder: "border-sky-200",
    stepIndex: 1,
  },
  {
    key: "qaytarildi",
    label: "Qaytarildi",
    darkBg: "bg-amber-500/15",
    darkText: "text-amber-400",
    darkBorder: "border-amber-500/40",
    dotColor: "bg-amber-400",
    lightBg: "bg-amber-50",
    lightText: "text-amber-700",
    lightBorder: "border-amber-200",
    stepIndex: 1,
  },
  {
    key: "rad_etildi",
    label: "Rad etildi",
    darkBg: "bg-rose-500/15",
    darkText: "text-rose-400",
    darkBorder: "border-rose-500/40",
    dotColor: "bg-rose-500",
    lightBg: "bg-rose-50",
    lightText: "text-rose-700",
    lightBorder: "border-rose-200",
    stepIndex: 1,
  },
  {
    key: "tasdiqlangan",
    label: "Tasdiqlangan",
    darkBg: "bg-emerald-500/15",
    darkText: "text-emerald-400",
    darkBorder: "border-emerald-500/40",
    dotColor: "bg-emerald-400",
    lightBg: "bg-emerald-50",
    lightText: "text-emerald-700",
    lightBorder: "border-emerald-200",
    stepIndex: 2,
  },
];

export const STEPPER_STAGES = [
  "1-bosqich: Umumiy ma'lumotlar",
  "2-bosqich: Moliyaviy ko'rsatkichlar",
  "3-bosqich: Oflayn suhbat",
];

/* ─── Interfaces ─────────────────────────────────────────────── */

export interface ApplicantItem {
  id: string;
  fullId: string;
  userId: string;
  numericId: number;
  fio: string;
  brandName: string;
  legalName: string;
  category: string;
  categoryLabel: string;
  age: number;
  region: string;
  gender: "Ayol" | "Erkak";
  phone: string;
  businessDescription: string;
  goals: string[];
  potentialImpact: string[];
  avatarUrl: string | null;
  productImageUrl: string | null;
  productImageUrls: string[];
  jshshir: string;
  passport: string;
  birthDate: string;
  date: string;
  status: StatusKey;
  rejectionComment?: string;
}

export interface Phase2ApplicationItem {
  id: string;
  application_id: string;
  user_id: string;
  category: "business" | "startup" | "other";
  company_name: string;
  legal_structure: string;
  registration_date: string | null;
  ownership_structure: string;
  permanent_employees_count: number;
  external_funding_details: string;
  requested_investment_amount: number;
  investment_allocation: any[];
  expected_outcomes: string;
  tax_and_license_status: string;
  legal_disputes_status: string;
  section_a_data: Record<string, any>;
  section_b_data: Record<string, any>;
  uploaded_documents: Array<{
    file_name: string;
    file_url: string;
    file_size: number;
    doc_type: string;
    uploaded_at: string;
  }>;
  truthfulness_declared: boolean;
  nda_agreed: boolean;
  nda_agreed_at: string;
  nda_signer_name: string;
  nda_user_ip: string;
  nda_version: string;
  additional_notes?: string;
  status: string;
  created_at: string;
}

/* ─── Region Normalizer ───────────────────────────────────────── */

function normalizeRegionName(regionStr: string): string {
  if (!regionStr) return "TOSHKENT SHAHRI";
  let norm = regionStr.trim().toUpperCase();
  if (
    norm.includes("QORAQALPOG") ||
    norm.includes("QORAQOLPOG") ||
    norm.includes("KARAKALPAK")
  ) {
    return "QORAQALPOG'ISTON RESPUBLIKASI";
  }
  norm = norm.replace(/’|‘|`/g, "'");
  return norm;
}

function generatePseudoJSHSHIR(idStr: string): string {
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);
  const prefix = "3" + String(100000 + (posHash % 899999));
  const suffix = String(1000000 + (posHash % 8999999));
  return (prefix + suffix).slice(0, 14);
}

function generatePseudoPassport(idStr: string): string {
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 7) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const num = 1000745 + (Math.abs(hash) % 8000000);
  return `AD${num}`;
}

const CATEGORY_MAP: Record<string, string> = {
  business: "An'anaviy Biznes",
  startup: "Startap",
};

/* ─── Main Admin Component ────────────────────────────────────── */

export default function AdminPage() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activePhase, setActivePhase] = useState<"moderation" | "1-bosqich" | "2-bosqich" | "3-bosqich">("moderation");
  const [arizalarOpen, setArizalarOpen] = useState(true);
  const [selectedStatusKey, setSelectedStatusKey] = useState<StatusKey>("korib_chiqilmoqda");

  // Selected applicant for Detail View & Detail Tab ("1-bosqich" vs "2-bosqich")
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantItem | null>(null);
  const [detailTab, setDetailTab] = useState<"1-bosqich" | "2-bosqich">("1-bosqich");
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Applicants data
  const [applicants, setApplicants] = useState<ApplicantItem[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  // Phase 2 Applications data
  const [phase2Apps, setPhase2Apps] = useState<Phase2ApplicationItem[]>([]);
  const [loadingPhase2, setLoadingPhase2] = useState(false);

  // Rejection Dialog State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  // Bulk Selection & Phase 2 Migration State
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const handleToggleSelectApp = (fullId: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(fullId) ? prev.filter((id) => id !== fullId) : [...prev, fullId]
    );
  };

  const handleToggleSelectAll = (appsList: ApplicantItem[]) => {
    const allIds = appsList.map((a) => a.fullId);
    const isAllSelected = allIds.length > 0 && allIds.every((id) => selectedAppIds.includes(id));
    if (isAllSelected) {
      setSelectedAppIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedAppIds((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const handleBulkMigrateToPhase2 = async () => {
    if (selectedAppIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: "approved" } as any)
        .in("id", selectedAppIds);

      if (!error) {
        setApplicants((prev) =>
          prev.map((app) =>
            selectedAppIds.includes(app.fullId)
              ? { ...app, status: "tasdiqlangan" as StatusKey }
              : app
          )
        );
        setSelectedAppIds([]);
      } else {
        console.error("Error bulk migrating:", error);
      }
    } catch (err) {
      console.error("Bulk migration failed:", err);
    } finally {
      setIsBulkProcessing(false);
    }
  };


  // Load ALL Phase 1 applications
  const loadActualApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching Supabase applications:", error);
        setLoadingApps(false);
        return;
      }

      if (data && data.length > 0) {
        // Automatic realignment: move legacy 'approved' applications to 'under_review' (1-Bosqich)
        const legacyApproved = data.filter((item: any) => item.status === "approved");
        if (legacyApproved.length > 0) {
          supabase
            .from("applications")
            .update({ status: "under_review" } as any)
            .in("id", legacyApproved.map((i: any) => i.id))
            .then(() => {});
        }

        const mapped: ApplicantItem[] = data.map((item, idx) => {
          const rawDesc = item.business_description || "";
          const founderMatch = rawDesc.match(/\[Founder:\s*([^\]]+)\]/i);
          const phoneMatch = rawDesc.match(/\[Phone:\s*([^\]]+)\]/i);

          const cleanDesc = rawDesc
            .replace(/\[Founder:\s*[^\]]+\]/i, "")
            .replace(/\[Gender:\s*(male|female)\]/i, "")
            .replace(/\[Phone:\s*[^\]]+\]/i, "")
            .trim();

          const founderName = founderMatch
            ? founderMatch[1].trim()
            : item.brand_name && item.brand_name !== "N/A"
            ? item.brand_name
            : item.legal_name || `Arizachi #${idx + 1}`;

          const phone = phoneMatch ? phoneMatch[1].trim() : "+998 90 123 45 67";

          let stKey: StatusKey = "korib_chiqilmoqda";
          if (item.status === "submitted") stKey = "yangi_ariza";
          else if (item.status === "approved") {
            // Realignment: if unpromoted, map to 1-bosqich active status
            stKey = "korib_chiqilmoqda";
          }
          else if (item.status === "rejected") stKey = "rad_etildi";
          else if ((item.status as string) === "returned" || (item.status as string) === "qaytarildi") stKey = "qaytarildi";

          const birthYear = item.age ? 2026 - item.age : 1995;
          const birthDate = `15.06.${birthYear}`;

          const createdDate = item.created_at
            ? new Date(item.created_at).toLocaleDateString("ru-RU") +
              " " +
              new Date(item.created_at).toLocaleTimeString("ru-RU").slice(0, 5)
            : "07.08.2026 14:00";

          let galleryImages: string[] = [];
          if (Array.isArray(item.product_image_urls)) {
            galleryImages = item.product_image_urls;
          } else if (typeof item.product_image_urls === "string") {
            try {
              galleryImages = JSON.parse(item.product_image_urls);
            } catch {
              galleryImages = [item.product_image_urls];
            }
          }

          return {
            id: item.id.slice(0, 8),
            fullId: item.id,
            userId: item.user_id,
            numericId: idx + 1,
            fio: founderName.toUpperCase(),
            brandName: item.brand_name || item.legal_name || "Brend",
            legalName: item.legal_name || item.brand_name || "Korxona",
            category: item.category || "business",
            categoryLabel: CATEGORY_MAP[item.category] || "An'anaviy Biznes",
            age: item.age || 28,
            region: normalizeRegionName(item.region),
            jshshir: generatePseudoJSHSHIR(item.id),
            passport: generatePseudoPassport(item.id),
            gender: item.gender === "female" ? "Ayol" : "Erkak",
            birthDate: birthDate,
            phone: phone,
            businessDescription: cleanDesc || "Loyiha bo'yicha batafsil ma'lumotlar taqdim etilgan.",
            goals: Array.isArray(item.goals) ? item.goals : [],
            potentialImpact: Array.isArray(item.potential_impact) ? item.potential_impact : [],
            avatarUrl: item.avatar_url || null,
            productImageUrl: item.product_image_url || null,
            productImageUrls: galleryImages,
            date: createdDate,
            status: stKey,
            rejectionComment: item.rejection_comment || undefined,
          };
        });

        setApplicants(mapped);
      }
    } catch (err) {
      console.error("Error loading actual applications:", err);
    } finally {
      setLoadingApps(false);
    }
  }, []);

  // Load Phase 2 applications
  const loadPhase2Applications = useCallback(async () => {
    setLoadingPhase2(true);
    try {
      const { data, error } = await supabase
        .from("phase2_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPhase2Apps(data as any[]);
      }
    } catch (err) {
      console.error("Error loading Phase 2 apps:", err);
    } finally {
      setLoadingPhase2(false);
    }
  }, []);

  useEffect(() => {
    loadActualApplications();
    loadPhase2Applications();

    const channel = supabase
      .channel("admin-realtime-applications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        () => loadActualApplications()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "phase2_applications" },
        () => loadPhase2Applications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadActualApplications, loadPhase2Applications]);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusKey, number> = {
      yangi_ariza: 0,
      korib_chiqilmoqda: 0,
      qaytarildi: 0,
      rad_etildi: 0,
      tasdiqlangan: 0,
    };
    applicants.forEach((app) => {
      if (counts[app.status] !== undefined) {
        counts[app.status] = (counts[app.status] || 0) + 1;
      }
    });
    return counts;
  }, [applicants]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => app.status === selectedStatusKey);
  }, [applicants, selectedStatusKey]);

  const moderationApps = useMemo(() => applicants.filter((a) => a.status === "yangi_ariza"), [applicants]);
  const approvedApps = useMemo(() => applicants.filter((a) => a.status === "tasdiqlangan"), [applicants]);

  const filteredPhase2Apps = useMemo(() => {
    return phase2Apps.filter((item) => {
      const matchingApp = applicants.find(
        (a) =>
          a.fullId === item.application_id ||
          a.userId === item.user_id ||
          (a.brandName &&
            item.company_name &&
            a.brandName.toLowerCase().trim() === item.company_name.toLowerCase().trim())
      );
      return !matchingApp || matchingApp.status !== "rad_etildi";
    });
  }, [phase2Apps, applicants]);

  const handleSelectApplicant = (app: ApplicantItem, initialTab?: "1-bosqich" | "2-bosqich") => {
    setSelectedApplicant(app);
    if (initialTab) {
      setDetailTab(initialTab);
    } else if (activePhase === "2-bosqich") {
      setDetailTab("2-bosqich");
    } else {
      setDetailTab("1-bosqich");
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: StatusKey, comment?: string) => {
    setApplicants((prev) =>
      prev.map((item) => {
        if (item.id === appId || item.fullId === appId) {
          return { ...item, status: newStatus, rejectionComment: comment };
        }
        return item;
      })
    );

    if (selectedApplicant && (selectedApplicant.id === appId || selectedApplicant.fullId === appId)) {
      setSelectedApplicant((prev) => (prev ? { ...prev, status: newStatus, rejectionComment: comment } : null));
    }

    const dbStatusMap: Record<StatusKey, string> = {
      yangi_ariza: "submitted",
      korib_chiqilmoqda: "under_review",
      qaytarildi: "returned",
      rad_etildi: "rejected",
      tasdiqlangan: "approved",
    };

    const targetApp = applicants.find((a) => a.id === appId || a.fullId === appId);
    if (targetApp) {
      await supabase
        .from("applications")
        .update({
          status: dbStatusMap[newStatus],
          rejection_comment: comment || null,
        } as any)
        .eq("id", targetApp.fullId);
    }
  };

  const handleApproveModeration = async (appId: string) => {
    await handleUpdateStatus(appId, "korib_chiqilmoqda");
    setSelectedApplicant(null);
  };

  const handleApprovePhase2ToPhase3 = async (appId: string) => {
    await handleUpdateStatus(appId, "tasdiqlangan");
    setSelectedApplicant(null);
  };

  const handleApprove = async (appId: string) => {
    await handleUpdateStatus(appId, "tasdiqlangan");
    setSelectedApplicant(null);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      setRejectError("Kamida 5 ta belgi bilan rad etish sababini yozing.");
      return;
    }
    if (selectedApplicant) {
      handleUpdateStatus(selectedApplicant.fullId, "rad_etildi", rejectReason.trim());
    }
    setRejectModalOpen(false);
    setRejectReason("");
    setRejectError("");
    setSelectedApplicant(null);
  };

  const currentStatusCfg = STATUS_LIST.find((s) => s.key === selectedStatusKey) || STATUS_LIST[0];

  const SidebarContent = () => (
    <div className="p-5 flex flex-col justify-between h-full gap-6 overflow-y-auto no-scrollbar">
      <div className="flex flex-col gap-6">
        <div className={`pb-3 border-b flex items-center justify-between ${isLight ? "border-slate-100" : "border-white/10"}`}>
          <span
            className={`text-xs font-bold uppercase tracking-widest ${isLight ? "text-slate-400" : "text-white/40"}`}
            style={{ fontFamily: "var(--font-zuume)" }}
          >
            BOSHQARUV MENUSI
          </span>
          <span className="w-2 h-2 rounded-full bg-[#00A8FF] animate-pulse" />
        </div>

        <nav className="flex flex-col gap-3">
          {/* ── MODERATSIYA (top-level) ── */}
          <button
            onClick={() => {
              setActivePhase("moderation");
              setSelectedApplicant(null);
              setMobileDrawerOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activePhase === "moderation"
                ? isLight
                  ? "bg-violet-50 text-violet-700 shadow-xs border border-violet-200"
                  : "bg-violet-500/20 text-violet-400 border border-violet-500/40 shadow-xs"
                : isLight
                ? "text-slate-700 hover:bg-slate-50"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox size={16} className={activePhase === "moderation" ? "text-violet-400" : isLight ? "text-slate-400" : "text-white/40"} />
              <span
                className="font-bold tracking-wider uppercase"
                style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.05em" }}
              >
                Moderatsiya
              </span>
            </div>
            {statusCounts.yangi_ariza > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-400 border border-violet-500/30 animate-pulse">
                {statusCounts.yangi_ariza} YANGI
              </span>
            )}
            {statusCounts.yangi_ariza === 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isLight ? "bg-slate-100 text-slate-400" : "bg-white/5 text-white/30"}`}>
                {statusCounts.yangi_ariza}
              </span>
            )}
          </button>

          {/* ── 1-BOSQICH (collapsible) ── */}
          <div>
            <button
              onClick={() => {
                setActivePhase("1-bosqich");
                setArizalarOpen(!arizalarOpen);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activePhase === "1-bosqich"
                  ? isLight
                    ? "bg-blue-50 text-[#00A8FF] shadow-xs"
                    : "bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/40 shadow-xs"
                  : isLight
                  ? "text-slate-700 hover:bg-slate-50"
                  : "text-white/70 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers size={16} className="text-[#00A8FF]" />
                <span
                  className="font-bold tracking-wider uppercase"
                  style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.05em" }}
                >
                  1-Bosqich
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00A8FF]/15 text-[#00A8FF] border border-[#00A8FF]/30">
                  {statusCounts["korib_chiqilmoqda"] || 0} TA
                </span>
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${
                    arizalarOpen ? "rotate-180 text-[#00A8FF]" : isLight ? "text-slate-400" : "text-white/40"
                  }`}
                />
              </div>
            </button>

            {arizalarOpen && (
              <div className={`mt-1.5 ml-3 pl-3 border-l-2 flex flex-col gap-1 py-1 ${isLight ? "border-slate-100" : "border-white/10"}`}>
                {STATUS_LIST.filter((s) => s.key !== "yangi_ariza" && s.key !== "tasdiqlangan").map((statusItem) => {
                  const isSelected = activePhase === "1-bosqich" && selectedStatusKey === statusItem.key;
                  const count = statusCounts[statusItem.key] || 0;

                  return (
                    <button
                      key={statusItem.key}
                      onClick={() => {
                        setActivePhase("1-bosqich");
                        setSelectedStatusKey(statusItem.key);
                        setSelectedApplicant(null);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? isLight
                            ? "bg-slate-100 text-[#00A8FF] font-bold shadow-2xs"
                            : "bg-white/10 text-[#00A8FF] font-bold border border-[#00A8FF]/30"
                          : isLight
                          ? "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span
                        className="truncate pr-2 uppercase tracking-wide"
                        style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.03em" }}
                      >
                        {statusItem.label}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isSelected
                            ? statusItem.key === "tasdiqlangan"
                              ? "bg-emerald-500 text-white shadow-2xs"
                              : "bg-[#00A8FF] text-white shadow-2xs"
                            : count > 0
                            ? isLight
                              ? "bg-slate-100 text-slate-700"
                              : "bg-white/10 text-white/80"
                            : isLight
                            ? "bg-slate-50 text-slate-300"
                            : "bg-white/5 text-white/30"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── 2-BOSQICH ── */}
          <button
            onClick={() => {
              setActivePhase("2-bosqich");
              setSelectedApplicant(null);
              setMobileDrawerOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activePhase === "2-bosqich"
                ? isLight
                  ? "bg-blue-50 text-[#00A8FF] shadow-xs"
                  : "bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/40 shadow-xs"
                : isLight
                ? "text-slate-700 hover:bg-slate-50"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className={activePhase === "2-bosqich" ? "text-[#00A8FF]" : isLight ? "text-slate-400" : "text-white/40"} />
              <span
                className="font-bold tracking-wider uppercase"
                style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.05em" }}
              >
                2-Bosqich (Moliyaviy)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {filteredPhase2Apps.length} TA
            </span>
          </button>

          {/* ── 3-BOSQICH (Oflayn suhbat) ── */}
          <button
            onClick={() => {
              setActivePhase("3-bosqich");
              setSelectedApplicant(null);
              setMobileDrawerOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activePhase === "3-bosqich"
                ? isLight
                  ? "bg-emerald-50 text-emerald-600 shadow-xs"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs"
                : isLight
                ? "text-slate-700 hover:bg-slate-50"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Award size={16} className={activePhase === "3-bosqich" ? "text-emerald-400" : isLight ? "text-slate-400" : "text-white/40"} />
              <span
                className="font-bold tracking-wider uppercase"
                style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.05em" }}
              >
                3-Bosqich (Oflayn suhbat)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {approvedApps.length} TA
            </span>
          </button>
        </nav>
      </div>

      <div className={`pt-4 border-t ${isLight ? "border-slate-100" : "border-white/10"}`}>
        <Link
          to="/"
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <LogOut size={16} className={isLight ? "text-slate-400" : "text-white/40"} />
          <span className="uppercase tracking-wider" style={{ fontFamily: "var(--font-zuume)" }}>Chiqish</span>
        </Link>
      </div>
    </div>
  );

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
          isLight ? "bg-white/85 backdrop-blur-xs" : "bg-black/85 backdrop-blur-xs"
        }`}
      />

      <header
        className={`h-16 border-b sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors backdrop-blur-md ${
          isLight ? "bg-white/90 border-slate-200/80 shadow-xs" : "bg-[#0a0c10]/95 border-white/10 shadow-lg"
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className={`p-2 rounded-xl border md:hidden transition-colors cursor-pointer ${
              isLight
                ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            }`}
            title="Menu"
          >
            <Menu size={18} />
          </button>

          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <img
              src={isLight ? logoBlue : logoWhite}
              alt="Logo"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </Link>
          <div className={`hidden sm:flex items-center gap-2 text-xs pl-4 border-l ${isLight ? "border-slate-200 text-slate-400" : "border-white/10 text-white/40"}`}>
            <Shield size={16} className="text-[#00A8FF]" />
            <span
              className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-white/80"}`}
              style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.05em" }}
            >
              Boshqaruv Paneli
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={toggleTheme}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              isLight
                ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 shadow-2xs"
                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 shadow-2xs"
            }`}
          >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <div
            className={`flex items-center gap-2.5 px-3 sm:px-3.5 py-1.5 rounded-xl border transition-colors ${
              isLight
                ? "bg-slate-50 border-slate-200/80 text-slate-700"
                : "bg-white/5 border-white/10 text-white"
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-[#00A8FF] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <UserCheck size={14} />
            </div>
            <span
              className="text-xs font-bold uppercase tracking-wider hidden sm:inline"
              style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.04em" }}
            >
              Administrator
            </span>
          </div>
        </div>
      </header>

      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden flex">
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs animate-fade-in"
          />
          <div
            className={`relative w-72 max-w-[80vw] h-full shadow-2xl flex flex-col z-10 animate-slide-in ${
              isLight ? "bg-white text-slate-800" : "bg-[#0a0c10] text-white border-r border-white/10"
            }`}
          >
            <div className={`p-4 border-b flex items-center justify-between ${isLight ? "border-slate-100" : "border-white/10"}`}>
              <img
                src={isLight ? logoBlue : logoWhite}
                alt="Logo"
                className="h-7 w-auto object-contain"
              />
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className={`p-1.5 rounded-lg border ${isLight ? "border-slate-200 text-slate-500" : "border-white/10 text-white/60"}`}
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative z-10">
        <aside
          className={`w-64 sm:w-72 border-r flex flex-col justify-between shrink-0 select-none hidden md:flex backdrop-blur-md transition-colors ${
            isLight ? "bg-white/90 border-slate-200/80" : "bg-[#0a0c10]/90 border-white/10"
          }`}
        >
          <SidebarContent />
        </aside>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
          {/* ═════════════════════════════════════════════════════════════ */}
          {/* UNIFIED APPLICANT DETAIL VIEW (Shared across all 3 steps)     */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {selectedApplicant ? (
            (() => {
              const matchingP2 = phase2Apps.find(
                (p) =>
                  p.application_id === selectedApplicant.fullId ||
                  p.user_id === selectedApplicant.userId ||
                  (p.company_name &&
                    selectedApplicant.brandName &&
                    p.company_name.toLowerCase().trim() === selectedApplicant.brandName.toLowerCase().trim())
              );

              return (
                <div className="flex flex-col gap-6 animate-fade-in">
                  {/* Top Action Header Bar */}
                  <div
                    className={`rounded-2xl border p-4 sm:p-6 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isLight ? "bg-white/90 border-slate-200/90" : "bg-[#0a0c10]/90 border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedApplicant(null)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00A8FF] text-white text-xs font-bold shadow-md uppercase tracking-wider cursor-pointer hover:bg-[#0090FF]"
                        style={{ fontFamily: "var(--font-zuume)" }}
                      >
                        <ArrowLeft size={15} />
                        <span>Orqaga</span>
                      </button>
                      <div>
                        <h2
                          className={`text-xl sm:text-2xl font-bold uppercase tracking-wider ${
                            isLight ? "text-slate-900" : "text-white"
                          }`}
                          style={{ fontFamily: "var(--font-zuume)" }}
                        >
                          {selectedApplicant.fio}
                        </h2>
                        <p className={`text-xs ${isLight ? "text-slate-500" : "text-white/50"}`}>{selectedApplicant.brandName}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {selectedApplicant.status === "yangi_ariza" ? (
                        <button
                          onClick={() => handleApproveModeration(selectedApplicant.fullId)}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-95 flex items-center gap-2 border border-emerald-400/30"
                          title="1-Bosqichga o'tkazish va Ishtirokchilar ro'yxatiga qo'shish"
                        >
                          <CheckCircle2 size={15} />
                          <span className="uppercase tracking-wider" style={{ fontFamily: "var(--font-zuume)" }}>1-Bosqichga o'tkazish</span>
                        </button>
                      ) : selectedApplicant.status === "tasdiqlangan" ? (
                        <span className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 flex items-center gap-2">
                          <Award size={16} />
                          <span className="uppercase tracking-wider" style={{ fontFamily: "var(--font-zuume)" }}>3-Bosqich Ishtirokchisi</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApprovePhase2ToPhase3(selectedApplicant.fullId)}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-95 flex items-center gap-2 border border-emerald-400/30"
                          title="3-Bosqich Oflayn suhbatiga o'tkazish"
                        >
                          <Sparkles size={15} />
                          <span className="uppercase tracking-wider" style={{ fontFamily: "var(--font-zuume)" }}>3-Bosqichga o'tkazish</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setRejectModalOpen(true);
                          setRejectReason(selectedApplicant.rejectionComment || "");
                        }}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-95 flex items-center gap-2 border border-rose-400/30"
                      >
                        <XCircle size={14} />
                        <span className="uppercase tracking-wider" style={{ fontFamily: "var(--font-zuume)" }}>Rad etish</span>
                      </button>
                    </div>
                  </div>

                  {/* ── 2 SWITCHER BUTTONS FOR 1-BOSQICH AND 2-BOSQICH MA'LUMOTLARI ── */}
                  <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-fit">
                    <button
                      onClick={() => setDetailTab("1-bosqich")}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        detailTab === "1-bosqich"
                          ? "bg-[#00A8FF] text-white shadow-lg shadow-[#00A8FF]/30"
                          : isLight ? "text-slate-600 hover:bg-slate-100" : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                      style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.03em" }}
                    >
                      <FileText size={15} />
                      <span>1-BOSQICH MA'LUMOTLARI (UMUMIY)</span>
                    </button>

                    <button
                      onClick={() => setDetailTab("2-bosqich")}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        detailTab === "2-bosqich"
                          ? "bg-[#00A8FF] text-white shadow-lg shadow-[#00A8FF]/30"
                          : isLight ? "text-slate-600 hover:bg-slate-100" : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                      style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.03em" }}
                    >
                      <Sparkles size={15} />
                      <span>2-BOSQICH MA'LUMOTLARI (MOLIYAVIY)</span>
                      {matchingP2 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500 text-white font-mono font-bold">
                          TO'LDIRILGAN
                        </span>
                      )}
                    </button>
                  </div>

                  {/* ── TAB CONTENT: 1-BOSQICH MA'LUMOTLARI ── */}
                  {detailTab === "1-bosqich" && (
                    <div
                      className={`rounded-2xl border p-5 sm:p-6 backdrop-blur-md shadow-xl grid grid-cols-1 md:grid-cols-2 gap-y-3.5 gap-x-8 text-xs sm:text-sm ${
                        isLight ? "bg-white/90 border-slate-200/90" : "bg-[#0a0c10]/90 border-white/10"
                      }`}
                    >
                      <div className={`col-span-2 flex items-center gap-3 pb-3 mb-1 border-b ${isLight ? "border-slate-100" : "border-white/10"}`}>
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-white/15">
                          {selectedApplicant.avatarUrl ? (
                            <img src={selectedApplicant.avatarUrl} alt={selectedApplicant.fio} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-violet-500/20 text-violet-400 font-bold text-xl">
                              {selectedApplicant.fio.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className={`text-base font-extrabold uppercase tracking-wide ${isLight ? "text-slate-900" : "text-white"}`} style={{ fontFamily: "var(--font-zuume)" }}>
                            {selectedApplicant.fio}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00A8FF]/15 text-[#00A8FF] border border-[#00A8FF]/30 uppercase">
                              {selectedApplicant.status.replace("_", " ")}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/15 text-violet-400 border border-violet-500/30">
                              {selectedApplicant.categoryLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {[
                        { label: "Brend Nomi", val: selectedApplicant.brandName },
                        { label: "Yuridik Nomi", val: selectedApplicant.legalName },
                        { label: "Kategoriya", val: selectedApplicant.categoryLabel },
                        { label: "Viloyat / Hudud", val: selectedApplicant.region },
                        { label: "Yosh", val: `${selectedApplicant.age} yosh` },
                        { label: "Jins", val: selectedApplicant.gender },
                        { label: "Telefon", val: selectedApplicant.phone },
                        { label: "Tug'ilgan sana", val: selectedApplicant.birthDate },
                        { label: "JSHSHIR", val: selectedApplicant.jshshir },
                        { label: "Pasport seriyasi", val: selectedApplicant.passport },
                        { label: "Sana", val: selectedApplicant.date },
                      ].map(({ label, val }) => (
                        <div key={label} className={`flex items-center justify-between py-2 border-b ${isLight ? "border-slate-100" : "border-white/5"}`}>
                          <span className={isLight ? "font-medium text-slate-500" : "font-medium text-white/50"}>{label}</span>
                          <span className={`font-bold text-right ${isLight ? "text-slate-900" : "text-white"}`}>{val}</span>
                        </div>
                      ))}

                      <div className={`col-span-2 flex flex-col gap-1.5 py-3 border-b ${isLight ? "border-slate-100" : "border-white/5"}`}>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-white/50"}`}>Biznes Tavsifi</span>
                        <p className={`text-xs leading-relaxed p-3 rounded-xl ${isLight ? "bg-slate-50" : "bg-white/5"}`}>{selectedApplicant.businessDescription}</p>
                      </div>

                      {selectedApplicant.goals.length > 0 && (
                        <div className={`col-span-2 flex flex-col gap-1.5 py-3 border-b ${isLight ? "border-slate-100" : "border-white/5"}`}>
                          <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-white/50"}`}>Maqsadlar</span>
                          <ul className="flex flex-col gap-1">
                            {selectedApplicant.goals.map((g, i) => (
                              <li key={i} className={`text-xs flex gap-2 ${isLight ? "text-slate-700" : "text-white/70"}`}>
                                <span className="text-emerald-400 shrink-0">•</span>{g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Product Images Gallery */}
                      {(selectedApplicant.productImageUrl || selectedApplicant.productImageUrls.length > 0) && (
                        <div className="col-span-2 flex flex-col gap-2 py-3">
                          <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-white/50"}`}>Mahsulot Rasmlari</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[selectedApplicant.productImageUrl, ...selectedApplicant.productImageUrls]
                              .filter((url, i, arr) => url && arr.indexOf(url) === i)
                              .map((url, i) => (
                                <div
                                  key={i}
                                  onClick={() => setLightboxImg(url)}
                                  className="aspect-video rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-[#00A8FF]/40 transition-colors"
                                >
                                  <img src={url!} alt={`Rasm ${i + 1}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── TAB CONTENT: 2-BOSQICH MA'LUMOTLARI ── */}
                  {detailTab === "2-bosqich" && (
                    matchingP2 ? (
                      <div className="flex flex-col gap-6">
                        {/* General Info Card */}
                        <div
                          className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl flex flex-col gap-5 ${
                            isLight ? "bg-white/90 border-slate-200/90" : "bg-[#0a0c10]/90 border-white/10"
                          }`}
                        >
                          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-white/10">
                            <h3 className="text-base font-bold uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-zuume)" }}>
                              <Building2 size={18} className="text-[#00A8FF]" />
                              <span>{matchingP2.company_name} — 2-Bosqich Moliyaviy Tahlili</span>
                            </h3>
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#00A8FF]/15 text-[#00A8FF] border border-[#00A8FF]/30">
                              {matchingP2.category === "startup" ? "Startap / Innovatsiya" : "An'anaviy Biznes"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
                              <span className="text-slate-400">Tashkiliy-huquqiy shakli:</span>
                              <span className="font-bold">{matchingP2.legal_structure}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
                              <span className="text-slate-400">Ro'yxatdan o'tgan sana:</span>
                              <span className="font-bold">{matchingP2.registration_date || "Kiritilmagan"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
                              <span className="text-slate-400">Doimiy xodimlar soni:</span>
                              <span className="font-bold">{matchingP2.permanent_employees_count} kishi</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
                              <span className="text-slate-400">So'ralayotgan investitsiya:</span>
                              <span className="font-extrabold text-[#00A8FF]">
                                {matchingP2.requested_investment_amount?.toLocaleString("ru-RU")} UZS
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 text-xs">
                            <span className="font-bold uppercase tracking-wider text-slate-400">Egalik tuzilmasi:</span>
                            <p className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 leading-relaxed">{matchingP2.ownership_structure}</p>
                          </div>

                          <div className="flex flex-col gap-1.5 text-xs">
                            <span className="font-bold uppercase tracking-wider text-slate-400">Investitsiya natijalaridan kutilayotgan samaradorlik:</span>
                            <p className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 leading-relaxed">{matchingP2.expected_outcomes}</p>
                          </div>
                        </div>

                        {/* Section A or B Dynamic Detailed Data Card */}
                        <div
                          className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl flex flex-col gap-5 ${
                            isLight ? "bg-white/90 border-slate-200/90" : "bg-[#0a0c10]/90 border-white/10"
                          }`}
                        >
                          {matchingP2.category === "startup" ? (
                            <>
                              <h3 className="text-base font-bold uppercase tracking-wider flex items-center gap-2 text-amber-400" style={{ fontFamily: "var(--font-zuume)" }}>
                                <Rocket size={18} />
                                <span>B-Bo'lim — Startap / Innovatsiyalar Tahlili</span>
                              </h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                                <div className="p-3 rounded-xl bg-white/5 flex flex-col gap-1">
                                  <span className="text-slate-400 font-bold uppercase text-[10px]">Mahsulot Bosqichi (B1):</span>
                                  <span className="font-bold text-amber-400">{matchingP2.section_b_data?.product_stage || "N/A"}</span>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 flex flex-col gap-1">
                                  <span className="text-slate-400 font-bold uppercase text-[10px]">Biznes Modeli / Monetizatsiya (B2):</span>
                                  <span className="font-semibold">{matchingP2.section_b_data?.business_model || "N/A"}</span>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 flex flex-col gap-1">
                                  <span className="text-slate-400 font-bold uppercase text-[10px]">Hozirgi Traksiya (MAU/MRR) (B3):</span>
                                  <span className="font-semibold">{matchingP2.section_b_data?.current_traction_mau_mrr || "N/A"}</span>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 flex flex-col gap-1">
                                  <span className="text-slate-400 font-bold uppercase text-[10px]">12 Oy Kutilayotgan Traksiya (B4):</span>
                                  <span className="font-semibold">{matchingP2.section_b_data?.expected_traction_12m || "N/A"}</span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <h3 className="text-base font-bold uppercase tracking-wider flex items-center gap-2 text-[#00A8FF]" style={{ fontFamily: "var(--font-zuume)" }}>
                                <Building2 size={18} />
                                <span>A-Bo'lim — An'anaviy Biznes Tahlili</span>
                              </h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                                <div className="p-3 rounded-xl bg-white/5 flex flex-col gap-1">
                                  <span className="text-slate-400 font-bold uppercase text-[10px]">12 Oylik Tushum Dinamikasi (A1):</span>
                                  <span className="font-semibold">{matchingP2.section_a_data?.revenue_12m_dynamics || "N/A"}</span>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 flex flex-col gap-1">
                                  <span className="text-slate-400 font-bold uppercase text-[10px]">Kutilayotgan Yillik Tushum (A2):</span>
                                  <span className="font-semibold text-emerald-400">{matchingP2.section_a_data?.expected_revenue_12m || "N/A"}</span>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 flex flex-col gap-1">
                                  <span className="text-slate-400 font-bold uppercase text-[10px]">Joriy Qarzlar (A5):</span>
                                  <span className="font-semibold">{matchingP2.section_a_data?.current_debts_and_payments || "N/A"}</span>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 flex flex-col gap-1">
                                  <span className="text-slate-400 font-bold uppercase text-[10px]">Aktivlar va Garov Imkoniyati (A6):</span>
                                  <span className="font-semibold">{matchingP2.section_a_data?.assets_and_collateral || "N/A"}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Uploaded Documents Viewer Card */}
                        <div
                          className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl flex flex-col gap-4 ${
                            isLight ? "bg-white/90 border-slate-200/90" : "bg-[#0a0c10]/90 border-white/10"
                          }`}
                        >
                          <h3 className="text-base font-bold uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-zuume)" }}>
                            <FileCheck size={18} className="text-emerald-500" />
                            <span>Biriktirilgan Hujjatlar ({matchingP2.uploaded_documents?.length || 0} ta)</span>
                          </h3>

                          {matchingP2.uploaded_documents?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {matchingP2.uploaded_documents.map((doc, idx) => (
                                <div
                                  key={idx}
                                  className="p-3.5 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between text-xs"
                                >
                                  <div className="flex items-center gap-2.5 truncate pr-2">
                                    <FileText size={16} className="text-[#00A8FF] shrink-0" />
                                    <span className="font-semibold truncate">{doc.file_name}</span>
                                  </div>
                                  <a
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-[#00A8FF] text-white font-bold flex items-center gap-1.5 hover:bg-[#0090FF]"
                                  >
                                    <Download size={13} />
                                    <span>Yuklab Olish</span>
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400">Ushbu nomzod tomonidan alohida fayl biriktirilmagan</p>
                          )}
                        </div>

                        {/* Electronic NDA Verification Badge */}
                        <div className="p-5 rounded-2xl border bg-emerald-500/10 border-emerald-500/30 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <Shield size={22} className="text-emerald-400 shrink-0" />
                            <div>
                              <span className="font-bold text-emerald-400 uppercase tracking-wider" style={{ fontFamily: "var(--font-zuume)" }}>
                                Elektron NDA Imzolangan (Rasmiy Kelishuv)
                              </span>
                              <p className="text-slate-300 text-[11px] mt-0.5">
                                Imzolovchi: <strong>{matchingP2.nda_signer_name}</strong> • Imzolangan sana: {new Date(matchingP2.nda_agreed_at || matchingP2.created_at).toLocaleString("ru-RU")}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                            VERIFIED v1.0
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`rounded-2xl border p-12 text-center backdrop-blur-md shadow-xl flex flex-col items-center gap-4 ${
                          isLight ? "bg-white/90 border-slate-200/90" : "bg-[#0a0c10]/90 border-white/10"
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isLight ? "bg-amber-50" : "bg-amber-500/10"}`}>
                          <AlertCircle size={32} className="text-amber-400" />
                        </div>
                        <div>
                          <p className={`text-base font-bold uppercase ${isLight ? "text-slate-800" : "text-white"}`} style={{ fontFamily: "var(--font-zuume)" }}>
                            2-Bosqich so'rovnomasi to'ldirilmagan
                          </p>
                          <p className={`text-xs mt-1 max-w-md ${isLight ? "text-slate-500" : "text-white/50"}`}>
                            Ushbu ishtirokchi 2-bosqich moliyaviy va biznes tahlili so'rovnomasini (Section A/B & NDA) hali topshirmagan.
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              );
            })()
          ) : activePhase === "moderation" ? (
            /* ═══════════════════════════════════════════════════════════ */
            /* MODERATION VIEW — Yangi Arizalar (submitted)               */
            /* ═══════════════════════════════════════════════════════════ */
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className={`text-2xl sm:text-4xl font-bold uppercase tracking-wider ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                    style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.03em" }}
                  >
                    Moderatsiya
                  </h2>
                  <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-white/50"}`}>
                    Yangi kelgan arizalarni ko'rib chiqing va tasdiqlang
                  </p>
                </div>
                <span
                  className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    statusCounts.yangi_ariza > 0
                      ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                      : isLight
                      ? "bg-blue-50 text-[#00A8FF] border-blue-200/60"
                      : "bg-[#00A8FF]/10 text-[#00A8FF] border-[#00A8FF]/30"
                  }`}
                  style={{ fontFamily: "var(--font-zuume)" }}
                >
                  {statusCounts.yangi_ariza} ta yangi
                </span>
              </div>

              {loadingApps ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <span className={`text-xs font-semibold ${isLight ? "text-slate-500" : "text-white/60"}`}>Yuklanmoqda...</span>
                </div>
              ) : moderationApps.length === 0 ? (
                <div
                  className={`rounded-2xl border p-12 text-center backdrop-blur-md shadow-xl flex flex-col items-center gap-4 ${
                    isLight ? "bg-white/90 border-slate-200/90" : "bg-[#0a0c10]/90 border-white/10"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
                    <CheckCircle2 size={32} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isLight ? "text-slate-700" : "text-white/80"}`} style={{ fontFamily: "var(--font-zuume)" }}>
                      Yangi arizalar yo'q
                    </p>
                    <p className={`text-xs mt-1 ${isLight ? "text-slate-400" : "text-white/40"}`}>
                      Hamma arizalar ko'rib chiqilgan
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className={`rounded-2xl border shadow-xl backdrop-blur-md overflow-hidden transition-colors ${
                    isLight ? "bg-white/90 border-slate-200/90" : "bg-[#0a0c10]/95 border-white/10"
                  }`}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[650px]">
                      <thead>
                        <tr
                          className={`border-b text-xs font-bold uppercase tracking-wider ${
                            isLight ? "bg-slate-50/90 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-white/70"
                          }`}
                          style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.05em" }}
                        >
                          <th className="py-4 px-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={
                                moderationApps.length > 0 &&
                                moderationApps.every((a) => selectedAppIds.includes(a.fullId))
                              }
                              onChange={() => handleToggleSelectAll(moderationApps)}
                              className="w-4 h-4 rounded accent-[#00A8FF] cursor-pointer"
                            />
                          </th>
                          <th className="py-4 px-4 w-12 text-center">#</th>
                          <th className="py-4 px-4">Arizachi F.I.O & Brend</th>
                          <th className="py-4 px-4">Kategoriya</th>
                          <th className="py-4 px-4">Viloyat</th>
                          <th className="py-4 px-4">Sana</th>
                          <th className="py-4 px-4 text-center">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y text-xs ${isLight ? "divide-slate-200/60 text-slate-800" : "divide-white/5 text-white/90"}`}>
                        {moderationApps.map((item, index) => (
                          <tr key={item.id} className={`transition-all ${selectedAppIds.includes(item.fullId) ? (isLight ? "bg-sky-50" : "bg-[#00A8FF]/10") : (isLight ? "hover:bg-violet-50/60" : "hover:bg-violet-500/5")}`}>
                            <td className="py-4 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedAppIds.includes(item.fullId)}
                                onChange={() => handleToggleSelectApp(item.fullId)}
                                className="w-4 h-4 rounded accent-[#00A8FF] cursor-pointer"
                              />
                            </td>
                            <td className={`py-4 px-4 text-center font-mono text-xs font-semibold ${isLight ? "text-slate-400" : "text-white/40"}`}>{index + 1}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-900 shrink-0 border border-white/15">
                                  {item.avatarUrl ? (
                                    <img src={item.avatarUrl} alt={item.fio} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-violet-500/20 text-violet-400 font-bold text-sm">
                                      {item.fio.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className={`text-sm font-extrabold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>{item.fio}</span>
                                  <span className={`text-xs font-semibold ${isLight ? "text-slate-500" : "text-violet-400/80"}`}>{item.brandName}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#00A8FF]/10 text-[#00A8FF] border border-[#00A8FF]/20">
                                {item.categoryLabel}
                              </span>
                            </td>
                            <td className={`py-4 px-4 font-semibold text-xs ${isLight ? "text-slate-700" : "text-white/80"}`}>{item.region}</td>
                            <td className={`py-4 px-4 font-mono text-xs ${isLight ? "text-slate-500" : "text-white/50"}`}>{item.date}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2 justify-center">
                                <button
                                  onClick={() => handleSelectApplicant(item, "1-bosqich")}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                    isLight ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                                  }`}
                                >
                                  Ko'rish
                                </button>
                                <button
                                  onClick={() => handleApproveModeration(item.fullId)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                                  title="1-Bosqichga o'tkazish va Ishtirokchilar ro'yxatiga qo'shish"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>1-Bosqichga o'tkazish</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedApplicant(item);
                                    setRejectModalOpen(true);
                                    setRejectReason("");
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-bold transition-all cursor-pointer border border-rose-500/30 flex items-center gap-1.5"
                                >
                                  <X size={13} />
                                  Rad
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : activePhase === "2-bosqich" ? (
            /* ═══════════════════════════════════════════════════════════ */
            /* 2-BOSQICH VIEW — Moliyaviy Ko'rsatkichlar & Tahlil         */
            /* ═══════════════════════════════════════════════════════════ */
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className={`text-2xl sm:text-4xl font-bold uppercase tracking-wider ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                    style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.03em" }}
                  >
                    2-Bosqich Moliyaviy va Biznes Tahlil Arizalari
                  </h2>
                  <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-white/50"}`}>
                    2-bosqich ishtirokchilarining moliyaviy so'rovnomalari, hujjatlari va NDA verification holati
                  </p>
                </div>
                <span
                  className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00A8FF]/15 text-[#00A8FF] border border-[#00A8FF]/30"
                  style={{ fontFamily: "var(--font-zuume)" }}
                >
                  Jami: {filteredPhase2Apps.length} ta
                </span>
              </div>

              {loadingPhase2 ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-3 border-[#00A8FF] border-t-transparent rounded-full animate-spin" />
                  <span className={`text-xs font-semibold ${isLight ? "text-slate-500" : "text-white/60"}`}>
                    2-Bosqich arizalari yuklanmoqda...
                  </span>
                </div>
              ) : (
                <div
                  className={`rounded-2xl border shadow-xl backdrop-blur-md overflow-hidden transition-colors ${
                    isLight ? "bg-white/90 border-slate-200/90" : "bg-[#0a0c10]/95 border-white/10"
                  }`}
                >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr
                        className={`border-b text-xs font-bold uppercase tracking-wider ${
                          isLight ? "bg-slate-50/90 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-white/70"
                        }`}
                        style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.05em" }}
                      >
                        <th className="py-4 px-4 w-12 text-center">#</th>
                        <th className="py-4 px-4">Korxona / Ishtirokchi Nomi</th>
                        <th className="py-4 px-4">Toifasi</th>
                        <th className="py-4 px-4">So'ralgan Investitsiya</th>
                        <th className="py-4 px-4 text-center">Hujjatlar</th>
                        <th className="py-4 px-4 text-center">NDA Tasdiq</th>
                        <th className="py-4 px-4 text-center">Batafsil</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y text-xs ${isLight ? "divide-slate-200/60 text-slate-800" : "divide-white/5 text-white/90"}`}>
                      {filteredPhase2Apps.length > 0 ? (
                        filteredPhase2Apps.map((item, index) => {
                          const matchingApp = applicants.find(
                            (a) => a.fullId === item.application_id || a.userId === item.user_id || a.brandName?.toLowerCase().trim() === item.company_name?.toLowerCase().trim()
                          );

                          return (
                            <tr
                              key={item.id}
                              onClick={() => {
                                if (matchingApp) {
                                  handleSelectApplicant(matchingApp, "2-bosqich");
                                }
                              }}
                              className={`transition-all cursor-pointer ${
                                isLight ? "hover:bg-blue-50/60" : "hover:bg-[#00A8FF]/10"
                              }`}
                            >
                              <td className="py-4 px-4 text-center font-mono text-slate-400">{index + 1}</td>
                              <td className="py-4 px-4 font-bold text-sm text-[#00A8FF]">{item.company_name}</td>
                              <td className="py-4 px-4">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                  item.category === "startup"
                                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                    : "bg-[#00A8FF]/15 text-[#00A8FF] border-[#00A8FF]/30"
                                }`}>
                                  {item.category === "startup" ? "Startap / Innovatsiya" : "An'anaviy Biznes"}
                                </span>
                              </td>
                              <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                                {item.requested_investment_amount?.toLocaleString("ru-RU")} UZS
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="px-2 py-0.5 rounded-full bg-white/10 font-bold text-[11px]">
                                  {item.uploaded_documents?.length || 0} ta fayl
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                                  <Shield size={12} />
                                  <span>IMZOLANGAN</span>
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <button className="px-3.5 py-1.5 rounded-lg bg-[#00A8FF] text-white font-bold text-xs hover:bg-[#0090FF]">
                                  Ko'rish
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <FileText size={32} className="opacity-40" />
                              <p className="text-sm font-medium">Hozircha 2-bosqich so'rovnomalari kelib tushmagan</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          ) : activePhase === "3-bosqich" ? (
            /* ═══════════════════════════════════════════════════════════ */
            /* 3-BOSQICH VIEW — Oflayn Suhbat va Pitching Ishtirokchilari  */
            /* ═══════════════════════════════════════════════════════════ */
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className={`text-2xl sm:text-4xl font-bold uppercase tracking-wider ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                    style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.03em" }}
                  >
                    3-Bosqich Oflayn Suhbat Ishtirokchilari
                  </h2>
                  <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-white/50"}`}>
                    Final va yarim-final oflayn pitching suhbatlariga saralangan nomzodlar
                  </p>
                </div>
                <span
                  className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  style={{ fontFamily: "var(--font-zuume)" }}
                >
                  Jami: {approvedApps.length} ta nomzod
                </span>
              </div>

              <div
                className={`rounded-2xl border shadow-xl backdrop-blur-md overflow-hidden transition-colors ${
                  isLight ? "bg-white/90 border-slate-200/90" : "bg-[#0a0c10]/95 border-white/10"
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr
                        className={`border-b text-xs font-bold uppercase tracking-wider ${
                          isLight ? "bg-slate-50/90 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-white/70"
                        }`}
                        style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.05em" }}
                      >
                        <th className="py-4 px-4 w-12 text-center">#</th>
                        <th className="py-4 px-4">Ishtirokchi F.I.O & Brend</th>
                        <th className="py-4 px-4">Kategoriya</th>
                        <th className="py-4 px-4">Viloyat</th>
                        <th className="py-4 px-4 text-center">Status</th>
                        <th className="py-4 px-4 text-center">Batafsil</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y text-xs ${isLight ? "divide-slate-200/60 text-slate-800" : "divide-white/5 text-white/90"}`}>
                      {approvedApps.length > 0 ? (
                        approvedApps.map((item, index) => (
                          <tr key={item.id} className={`transition-all ${isLight ? "hover:bg-emerald-50/60" : "hover:bg-emerald-500/10"}`}>
                            <td className="py-4 px-4 text-center font-mono text-slate-400">{index + 1}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-900 shrink-0 border border-white/15">
                                  {item.avatarUrl ? (
                                    <img src={item.avatarUrl} alt={item.fio} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                                      {item.fio.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className={`text-sm font-extrabold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>{item.fio}</span>
                                  <span className="text-xs font-semibold text-emerald-400">{item.brandName}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#00A8FF]/10 text-[#00A8FF] border border-[#00A8FF]/20">
                                {item.categoryLabel}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-semibold">{item.region}</td>
                            <td className="py-4 px-4 text-center">
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30 uppercase">
                                3-BOSQICH (OFLAYN)
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => handleSelectApplicant(item, "2-bosqich")}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow-sm cursor-pointer"
                              >
                                Ko'rish
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Award size={32} className="opacity-40 text-emerald-400" />
                              <p className="text-sm font-medium">Hozircha 3-bosqich oflayn suhbatiga nomzodlar saralanmagan</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ═══════════════════════════════════════════════════════════ */
            /* 1-BOSQICH LIST VIEW (Filtered by Status)                   */
            /* ═══════════════════════════════════════════════════════════ */
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2
                    className={`text-2xl sm:text-4xl font-bold uppercase tracking-wider ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                    style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.03em" }}
                  >
                    1-Bosqich ({currentStatusCfg.label})
                  </h2>
                  <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-white/50"}`}>
                    Umumiy ro'yxatdan o'tgan nomzodlar ma'lumotlari va arizalari
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentStatusCfg.darkBg} ${currentStatusCfg.darkText} ${currentStatusCfg.darkBorder}`}
                    style={{ fontFamily: "var(--font-zuume)" }}
                  >
                    Jami: {filteredApplicants.length} ta
                  </span>
                </div>
              </div>

              {/* Table */}
              <div
                className={`rounded-2xl border shadow-xl backdrop-blur-md overflow-hidden transition-colors ${
                  isLight ? "bg-white/90 border-slate-200/90" : "bg-[#0a0c10]/95 border-white/10"
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr
                        className={`border-b text-xs font-bold uppercase tracking-wider ${
                          isLight ? "bg-slate-50/90 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-white/70"
                        }`}
                        style={{ fontFamily: "var(--font-zuume)", letterSpacing: "0.05em" }}
                      >
                        <th className="py-4 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              filteredApplicants.length > 0 &&
                              filteredApplicants.every((a) => selectedAppIds.includes(a.fullId))
                            }
                            onChange={() => handleToggleSelectAll(filteredApplicants)}
                            className="w-4 h-4 rounded accent-[#00A8FF] cursor-pointer"
                          />
                        </th>
                        <th className="py-4 px-4 w-12 text-center">#</th>
                        <th className="py-4 px-4">Arizachi F.I.O & Brend</th>
                        <th className="py-4 px-4">Kategoriya</th>
                        <th className="py-4 px-4">Viloyat</th>
                        <th className="py-4 px-4">Sana</th>
                        <th className="py-4 px-4 text-center">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y text-xs ${isLight ? "divide-slate-200/60 text-slate-800" : "divide-white/5 text-white/90"}`}>
                      {filteredApplicants.length > 0 ? (
                        filteredApplicants.map((item, index) => (
                          <tr key={item.id} className={`transition-all ${selectedAppIds.includes(item.fullId) ? (isLight ? "bg-sky-50" : "bg-[#00A8FF]/10") : (isLight ? "hover:bg-slate-50" : "hover:bg-white/5")}`}>
                            <td className="py-4 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedAppIds.includes(item.fullId)}
                                onChange={() => handleToggleSelectApp(item.fullId)}
                                className="w-4 h-4 rounded accent-[#00A8FF] cursor-pointer"
                              />
                            </td>
                            <td className={`py-4 px-4 text-center font-mono text-xs font-semibold ${isLight ? "text-slate-400" : "text-white/40"}`}>{index + 1}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-900 shrink-0 border border-white/15">
                                  {item.avatarUrl ? (
                                    <img src={item.avatarUrl} alt={item.fio} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#00A8FF]/20 text-[#00A8FF] font-bold text-sm">
                                      {item.fio.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className={`text-sm font-extrabold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>{item.fio}</span>
                                  <span className="text-xs font-semibold text-[#00A8FF]">{item.brandName}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#00A8FF]/10 text-[#00A8FF] border border-[#00A8FF]/20">
                                {item.categoryLabel}
                              </span>
                            </td>
                            <td className={`py-4 px-4 font-semibold text-xs ${isLight ? "text-slate-700" : "text-white/80"}`}>{item.region}</td>
                            <td className={`py-4 px-4 font-mono text-xs ${isLight ? "text-slate-500" : "text-white/50"}`}>{item.date}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2 justify-center">
                                <button
                                  onClick={() => handleSelectApplicant(item, "1-bosqich")}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                    isLight ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                                  }`}
                                >
                                  Ko'rish
                                </button>
                                {item.status !== "tasdiqlangan" && (
                                  <button
                                    onClick={() => handleApprove(item.fullId)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                                    title="Ishtirokchilar bo'limiga o'tkazish (Tasdiqlash)"
                                  >
                                    <UserCheck size={13} />
                                    <span>Ishtirokchilarga o'tkazish</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className={`py-12 text-center ${isLight ? "text-slate-400" : "text-white/40"}`}>
                            <div className="flex flex-col items-center justify-center gap-2">
                              <FileText size={32} className="opacity-40" />
                              <p className="text-sm font-medium">Ushbu holatda arizalar topilmadi</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {lightboxImg && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
          <img src={lightboxImg} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
        </div>
      )}

      {rejectModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className={`rounded-2xl border max-w-md w-full p-6 shadow-xl flex flex-col gap-4 ${
              isLight ? "bg-white border-slate-200" : "bg-[#0a0c10] border-white/10"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-100" : "border-white/10"}`}>
              <h3 className="text-base font-bold uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-zuume)" }}>
                <XCircle size={18} className="text-rose-500" />
                <span>Arizani rad etish</span>
              </h3>
              <button onClick={() => setRejectModalOpen(false)} className="cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <textarea
              rows={4}
              placeholder="Rad etish sababini shu yerga yozing..."
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setRejectError("");
              }}
              className={`w-full p-3 rounded-xl border text-xs outline-none resize-none ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-white"
              }`}
            />

            {rejectError && <p className="text-xs text-rose-500 font-semibold">{rejectError}</p>}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs shadow-2xs cursor-pointer"
              >
                Tasdiqlash va Rad etish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING BULK MIGRATION ACTION TOOLBAR ───────────────── */}
      {selectedAppIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] bg-[#0a0f2c]/95 border border-[#00A8FF]/40 backdrop-blur-xl shadow-2xl rounded-2xl px-6 py-3.5 flex items-center gap-6 text-white animate-slide-up">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-[#00A8FF] text-white flex items-center justify-center font-bold text-xs shadow-md">
              {selectedAppIds.length}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-zuume)" }}>
              ta ariza tanlandi
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkMigrateToPhase2}
              disabled={isBulkProcessing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2 border border-emerald-300/30 cursor-pointer disabled:opacity-50"
              style={{ fontFamily: "var(--font-zuume)" }}
            >
              {isBulkProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserCheck size={16} />
              )}
              <span>ISHTIROKCHILARGA O'TKAZISH (TASDIQLASH)</span>
            </button>

            <button
              onClick={() => setSelectedAppIds([])}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-xs font-semibold transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
