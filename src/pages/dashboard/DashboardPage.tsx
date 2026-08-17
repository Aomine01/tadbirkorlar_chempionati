import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  LogOut,
  Trash2,
  Award,
  User,
  Phone,
  Shield,
  CalendarDays,
  LayoutList,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { Application } from "../../types/database";
import HeroImage from "../../assets/img/hero-image.png";
import VideoPlayer from "../../components/VideoPlayer";

const SORRY_VIDEO_URL = "https://orxgpsqmadgfkmeqkvpy.supabase.co/storage/v1/object/public/participant-media/videos/sorrypage.mp4";


/* ─── Status config ────────────────────────────────── */

/* ─── Status config ────────────────────────────────── */

const STATUS_CONFIG = {
  submitted: {
    label: "1-bosqich: Umumiy ma'lumotlar",
    color: "#00A8FF",
    icon: FileText,
    bg: "bg-[#00A8FF]/10",
    border: "border-[#00A8FF]/20",
  },
  under_review: {
    label: "2-bosqich: Moliyaviy ko'rsatkichlar",
    color: "#F59E0B",
    icon: Clock,
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  approved: {
    label: "3-bosqich: Oflayn suhbat",
    color: "#10B981",
    icon: CheckCircle2,
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  rejected: {
    label: "Rad etildi",
    color: "#EF4444",
    icon: XCircle,
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  business: "An'anaviy Biznes",
  startup: "Startap",
};

/* ─── Status Timeline ──────────────────────────────── */

const steps = [
  { key: "submitted", stepNum: "1-bosqich", title: "Umumiy ma'lumotlar" },
  { key: "under_review", stepNum: "2-bosqich", title: "Moliyaviy ko'rsatkichlar" },
  { key: "approved", stepNum: "3-bosqich", title: "Oflayn suhbat" },
] as const;

type TimelineStatus = "submitted" | "under_review" | "approved" | "rejected";

const Timeline = ({ status, isLight }: { status: TimelineStatus; isLight?: boolean }) => {
  const isRejectedStatus = status === "rejected";
  const rejectedAt = isRejectedStatus ? 1 : -1;

  const currentIdx = isRejectedStatus ? 1 : steps.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-0 w-full pt-2">
      {steps.map((stepObj, i) => {
        const cfg = STATUS_CONFIG[stepObj.key as keyof typeof STATUS_CONFIG];
        const isActive = i <= currentIdx && !isRejectedStatus;
        const isCurrent = isRejectedStatus ? i === rejectedAt : i === currentIdx;

        return (
          <div key={stepObj.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  isRejectedStatus && isCurrent
                    ? "border-red-500 bg-red-500/20 shadow-lg shadow-red-500/20"
                    : isActive
                    ? "border-[#00A8FF]"
                    : isLight
                    ? "border-slate-300 bg-slate-100"
                    : "border-white/15 bg-white/5"
                }`}
                style={
                  isActive
                    ? { borderColor: cfg.color, backgroundColor: `${cfg.color}20` }
                    : {}
                }
              >
                {isRejectedStatus && isCurrent ? (
                  <XCircle size={16} className="text-red-500" />
                ) : isActive ? (
                  <CheckCircle2 size={16} style={{ color: cfg.color }} />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${isLight ? "bg-slate-300" : "bg-white/20"}`} />
                )}
              </div>
              <div className="flex flex-col items-center text-center max-w-[110px] sm:max-w-[130px]">
                <span
                  className={`text-[11px] font-bold tracking-tight ${
                    isActive
                      ? isLight ? "text-slate-900" : "text-white"
                      : isLight ? "text-slate-400" : "text-white/40"
                  }`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  {stepObj.stepNum}
                </span>
                <span className={`text-[10px] leading-tight ${isLight ? "text-slate-500" : "text-white/50"}`}>
                  {stepObj.title}
                </span>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-px mx-1.5 mb-8 transition-all duration-500"
                style={{
                  background:
                    isActive && i < currentIdx
                      ? STATUS_CONFIG[steps[i].key as keyof typeof STATUS_CONFIG].color
                      : isLight
                      ? "rgba(148,163,184,0.3)"
                      : "rgba(255,255,255,0.1)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ─── Page ─────────────────────────────────────────── */

const DashboardPage = () => {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>("arizalar");
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPhase2App, setHasPhase2App] = useState(false);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    // 1. Fetch Phase 1 application
    supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (!error && data) setApplication(data);
        setLoading(false);
      });

    // 2. Fetch Phase 2 application state
    supabase
      .from("phase2_applications")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!isMounted) return;
        if (data) {
          setHasPhase2App(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const TABS: { key: TabKey; label: string; icon: typeof User }[] = [
    { key: "profil", label: "Mening profilim", icon: User },
    { key: "arizalar", label: "Arizalarim", icon: LayoutList },
  ];

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
        isLight ? "bg-[#f6f8fb] text-slate-800" : "bg-[#000001] text-white"
      }`}
      data-lenis-prevent
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none scale-105"
        style={{ backgroundImage: `url(${isLight ? HeroLightImage : HeroImage})` }}
      />
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight ? "bg-white/85 backdrop-blur-xs" : "bg-black/85 backdrop-blur-xs"
        }`}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className={`border-b sticky top-0 z-20 backdrop-blur-md transition-colors ${
          isLight ? "bg-white/90 border-slate-200/80 shadow-xs" : "bg-black/60 border-white/10 shadow-lg"
        }`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <img
                src={isLight ? logoBlue : logoWhite}
                alt="Logo"
                className="h-7 w-auto object-contain"
              />
            </Link>
            <div className="flex items-center gap-2.5 sm:gap-3">
              {profile?.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-xs font-semibold text-[#00A8FF] hover:text-white bg-[#00A8FF]/10 hover:bg-[#00A8FF] border border-[#00A8FF]/30 rounded-xl px-3 py-1.5 transition-all"
                >
                  Admin panel
                </Link>
              )}
              <button
                onClick={toggleTheme}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isLight
                    ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 shadow-2xs"
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 shadow-2xs"
                }`}
                title="Mavzuni o'zgartirish"
              >
                {isLight ? <Moon size={15} /> : <Sun size={15} />}
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 cursor-pointer"
                style={{ fontFamily: "var(--font-button)" }}
              >
                <LogOut size={13} />
                <span>Chiqish</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Welcome heading */}
          <div className="mb-6 sm:mb-8">
            <h1
              className={`text-2xl sm:text-4xl font-bold mb-1 tracking-tight ${
                isLight ? "text-slate-900" : "text-white"
              }`}
              style={{ fontFamily: "var(--font-zuume)" }}
            >
              SALOM,{" "}
              <span style={{ color: "#00A8FF" }}>
                {profile?.full_name?.split(" ")[0]?.toUpperCase()}
              </span>
            </h1>
            <p
              className={`text-xs sm:text-sm ${isLight ? "text-slate-500" : "text-white/50"}`}
              style={{ fontFamily: "var(--font-button)" }}
            >
              Shaxsiy kabinetingizga xush kelibsiz
            </p>
          </div>

          {/* Tab switcher */}
          <div className={`flex gap-1.5 mb-8 p-1.5 rounded-2xl border w-fit backdrop-blur-md ${
            isLight ? "bg-white/80 border-slate-200/80 shadow-xs" : "bg-white/5 border-white/8"
          }`}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#00A8FF] text-white shadow-md shadow-[#00A8FF]/25"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── TAB: MENING PROFILIM ─────────────────────────── */}
          {activeTab === "profil" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className={`rounded-3xl border overflow-hidden backdrop-blur-md shadow-xl transition-all ${
                isLight ? "bg-white/90 border-slate-200/90 shadow-slate-200/50" : "bg-white/3 border-white/8"
              }`}>
                {/* Profile header */}
                <div className={`p-6 border-b flex items-center gap-4 ${isLight ? "border-slate-100" : "border-white/8"}`}>
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 text-xl sm:text-2xl font-bold"
                    style={{ background: "rgba(0,168,255,0.12)", color: "#00A8FF", fontFamily: "var(--font-zuume)" }}
                  >
                    {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <h2
                      className={`text-lg sm:text-xl font-bold mb-1 ${isLight ? "text-slate-900" : "text-white"}`}
                      style={{ fontFamily: "var(--font-zuume)" }}
                    >
                      {profile?.full_name}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        profile?.role === "admin"
                          ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                          : "bg-[#00A8FF]/15 text-[#00A8FF] border border-[#00A8FF]/30"
                      }`}
                    >
                      <Shield size={10} />
                      {profile?.role === "admin" ? "Administrator" : "Ishtirokchi"}
                    </span>
                  </div>
                </div>

                {/* Info rows */}
                <div className="px-6 py-2">
                  <InfoRow
                    icon={User}
                    label="To'liq ism"
                    value={profile?.full_name}
                    isLight={isLight}
                  />
                  <InfoRow
                    icon={Phone}
                    label="Telefon raqami"
                    value={profile?.phone_number}
                    isLight={isLight}
                  />
                  <InfoRow
                    icon={CalendarDays}
                    label="Ro'yxatdan o'tgan sana"
                    value={
                      profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString("uz-UZ", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : null
                    }
                  />
                  <InfoRow
                    icon={Shield}
                    label="Rol"
                    value={profile?.role === "admin" ? "Administrator" : "Ishtirokchi"}
                  />
                </div>
              </div>

              <p
                className="text-center text-xs text-white/20"
                style={{ fontFamily: "var(--font-button)" }}
              >
                Profil ma'lumotlarini o'zgartirish uchun admin bilan bog'laning: @ytch_uz
              </p>
            </div>
          )}

          {/* ── TAB: ARIZALARIM ─────────────────────────────── */}
          {activeTab === "arizalar" && (
            <div className="animate-fade-in">
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-[#00A8FF] rounded-full animate-spin" />
                </div>
              ) : application?.is_deleted ? (
                /* ── Application deleted by admin ── */
                <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-8 sm:p-12 flex flex-col items-center text-center gap-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center border border-red-500/20"
                    style={{ background: "rgba(239,68,68,0.08)" }}
                  >
                    <Trash2 size={36} className="text-red-400" />
                  </div>
                  <div>
                    <h2
                      className="text-2xl sm:text-3xl font-bold mb-2"
                      style={{ fontFamily: "var(--font-zuume)" }}
                    >
                      ARIZANGIZ O'CHIRILDI
                    </h2>
                    <p className="text-sm text-white/50 max-w-sm">
                      Administrator tomonidan arizangiz o'chirildi. Xatolik bo'lgan bo'lsa yoki qayta ko'rib chiqmoqchi bo'lsangiz, yangi ariza topshirishingiz mumkin.
                    </p>
                  </div>
                  <Link
                    to="/dashboard/apply"
                    className="inline-flex items-center gap-2 bg-[#00A8FF] hover:bg-[#0090dd] text-white font-semibold rounded-xl px-8 py-4 text-sm transition-all duration-200"
                  >
                    Qayta ariza topshirish <ArrowRight size={16} />
                  </Link>
                </div>
              ) : !application ? (
                /* ── No application yet ── */
                <div className="rounded-2xl border border-white/8 bg-white/3 p-8 sm:p-12 flex flex-col items-center text-center gap-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center border border-white/10"
                    style={{ background: "rgba(0,168,255,0.08)" }}
                  >
                    <FileText size={36} className="text-[#00A8FF]" />
                  </div>
                  <div>
                    <h2
                      className="text-2xl sm:text-3xl font-bold mb-2"
                      style={{ fontFamily: "var(--font-zuume)" }}
                    >
                      ARIZA TOPSHIRILMAGAN
                    </h2>
                    <p className="text-sm text-white/50 max-w-sm">
                      Yosh Tadbirkorlar Chempionatida ishtirok etish uchun arizangizni to'ldiring
                    </p>
                  </div>
                  <Link
                    to="/dashboard/apply"
                    className="inline-flex items-center gap-2 bg-white text-[#0a0f2c] hover:bg-white/90 font-semibold rounded-xl px-8 py-3 text-sm transition-all duration-300 shadow-lg active:scale-[0.97]"
                    style={{ fontFamily: "var(--font-button)" }}
                  >
                    Ariza topshirish <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                /* ── Application exists ── */
                <div className="flex flex-col gap-6">
                  {/* Phase 2 invitation banner (shown when in 1-bosqich / under_review) */}
                  {application.status === "under_review" && (
                    <div className={`rounded-2xl border p-6 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl animate-fade-in ${
                      isLight ? "bg-[#00A8FF]/8 border-[#00A8FF]/30" : "bg-[#00A8FF]/10 border-[#00A8FF]/40"
                    }`}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[#00A8FF] font-semibold text-xs tracking-wide">
                          <Award size={16} />
                          <span>2-BOSQICH TAKLIFNOMASI</span>
                        </div>
                        <h3 className={`text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                          Moliyaviy va Biznes Tahlili So'rovnomasi
                        </h3>
                        <p className={`text-xs max-w-lg ${isLight ? "text-slate-600 font-medium" : "text-white/70"}`}>
                          Tabriklaymiz! Arizangiz 1-bosqichdan muvaffaqiyatli o'tdi. Qo'shimcha biznes va moliyaviy ma'lumotlarni topshirish uchun so'rovnomani to'ldiring.
                        </p>
                      </div>
                      <Link
                        to="/phase2-form"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#00A8FF] hover:bg-[#0090FF] text-white transition-all duration-300 shadow-lg active:scale-[0.97] shrink-0 cursor-pointer"
                        style={{ fontFamily: "var(--font-button)" }}
                      >
                        <span>So'rovnomani to'ldirish</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  )}

                  {/* Phase 3 finalist banner (shown when approved for offline pitching interview) */}
                  {application.status === "approved" && (
                    <div className={`rounded-2xl border p-6 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl animate-fade-in ${
                      isLight ? "bg-emerald-500/8 border-emerald-500/30" : "bg-emerald-500/10 border-emerald-500/40"
                    }`}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-emerald-500 font-semibold text-xs tracking-wide">
                          <Award size={16} />
                          <span>3-BOSQICH: OFLAYN SUHBAT VA PITCHING</span>
                        </div>
                        <h3 className={`text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                          Tabriklaymiz! Siz Finalistsiz
                        </h3>
                        <p className={`text-xs max-w-xl leading-relaxed ${isLight ? "text-slate-600 font-medium" : "text-white/80"}`}>
                          Siz 2-bosqich moliyaviy va biznes tahlilidan muvaffaqiyatli o'tdingiz va 3-bosqich (Oflayn suhbat va Pitching) ga saralandingiz! Tashkilotchilar suhbat vaqti hamda joyini belgilash uchun tez orada siz bilan bog'lanishadi.
                        </p>
                      </div>
                      <div className="px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 text-xs font-bold uppercase tracking-wider shrink-0" style={{ fontFamily: "var(--font-button)" }}>
                        Suhbat kutilmoqda
                      </div>
                    </div>
                  )}

                  {/* Rejected status: 1-Bosqich (soft rejection with reason + optional re-apply) vs 2-Bosqich / Permanent Hard Rejection */}
                  {application.status === "rejected" && (() => {
                    const cleanComment = application.rejection_comment
                      ?.replace(/\[Reapply:\s*(allowed|blocked)\]/gi, "")
                      .trim();
                    const isReapplyBlocked = application.rejection_comment?.includes("[Reapply: blocked]");

                    if (hasPhase2App) {
                      return (
                        /* 2-Bosqich Hard Rejection with Sorry Video */
                        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 backdrop-blur-md flex flex-col gap-6 shadow-xl animate-fade-in">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                              <AlertTriangle className="w-5 h-5 text-rose-400" />
                            </div>
                            <div>
                              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                                Hurmatli Ishtirokchi!
                              </h3>
                              <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-2xl leading-relaxed">
                                Afsuski, 2-bosqich moliyaviy va biznes tahlili natijalariga ko'ra arizangiz keyingi bosqichga o'tmadi. Loyihangizni yanada rivojlantirish va kelgusi imkoniyatlar haqida batafsil ma'lumot olish uchun quyidagi video murojaatni tomosha qiling.
                              </p>
                            </div>
                          </div>

                          {/* Video Player */}
                          <VideoPlayer
                            src={SORRY_VIDEO_URL}
                            title="Tashkiliy Qo'mita Murojaati"
                            subtitle="Yosh Tadbirkorlar Chempionati 2026"
                            className="w-full aspect-video rounded-xl"
                          />
                        </div>
                      );
                    }

                    if (isReapplyBlocked) {
                      return (
                        /* 1-Bosqich Permanent Rejection without re-apply */
                        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 backdrop-blur-md flex flex-col gap-4 shadow-xl animate-fade-in">
                          <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0 mt-0.5">
                              <AlertTriangle className="w-5 h-5 text-rose-400" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                                Arizangiz saralashdan o'tmadi
                              </h3>
                              <p className="text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed">
                                Hakamlar hay'ati qaroriga ko'ra arizangiz keyingi bosqichga tavsiya etilmadi.
                              </p>
                              {cleanComment && (
                                <div className="mt-1 rounded-xl border border-rose-500/20 bg-black/40 px-3.5 py-2.5 max-w-lg">
                                  <p className="text-[10px] text-rose-400/80 uppercase tracking-widest font-semibold mb-0.5">
                                    Rad etish sababi:
                                  </p>
                                  <p className="text-xs text-rose-200 leading-relaxed font-medium">
                                    {cleanComment}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      /* 1-Bosqich Soft Rejection (No video, clear reason & re-apply button) */
                      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl animate-fade-in">
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                              Arizangiz moderatsiyadan o'tmadi
                            </h3>
                            <p className="text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed">
                              Arizangizdagi ko'rsatilgan kamchiliklarni to'g'irlab, qayta topshirishingiz mumkin.
                            </p>
                            {cleanComment && (
                              <div className="mt-1 rounded-xl border border-amber-500/20 bg-black/40 px-3.5 py-2.5 max-w-lg">
                                <p className="text-[10px] text-amber-400/80 uppercase tracking-widest font-semibold mb-0.5">
                                  Rad etish sababi:
                                </p>
                                <p className="text-xs text-amber-200 leading-relaxed font-medium">
                                  {cleanComment}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <Link
                          to="/dashboard/apply"
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl px-6 py-3.5 shadow-lg active:scale-95 transition-all shrink-0 cursor-pointer"
                          style={{ fontFamily: "var(--font-button)" }}
                        >
                          <span>Qayta ariza topshirish</span>
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    );
                  })()}

                  {/* Status card */}
                  {(() => {
                    const cfg = STATUS_CONFIG[application.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.submitted;
                    const StatusIcon = cfg.icon;
                    return (
                      <div className={`rounded-3xl border p-6 sm:p-8 backdrop-blur-md transition-all ${
                        isLight ? "bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/50" : `${cfg.bg} ${cfg.border}`
                      }`}>
                        <div className="flex items-start justify-between gap-4 mb-6">
                          <div>
                            <p
                              className={`text-xs mb-1 uppercase tracking-widest ${isLight ? "text-slate-400" : "text-white/40"}`}
                              style={{ fontFamily: "var(--font-button)" }}
                            >
                              Ariza holati
                            </p>
                            <div className="flex items-center gap-2">
                              <StatusIcon size={18} style={{ color: cfg.color }} />
                              <span
                                className="text-lg font-bold"
                                style={{ color: cfg.color, fontFamily: "var(--font-zuume)" }}
                              >
                                {cfg.label.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-xs mt-1 ${isLight ? "text-slate-400" : "text-white/30"}`}
                            style={{ fontFamily: "var(--font-button)" }}
                          >
                            {new Date(application.created_at).toLocaleDateString("uz-UZ")}
                          </span>
                        </div>

                        {/* Rejection comment */}
                        {application.status === "rejected" && application.rejection_comment && (
                          <div className={`mb-6 rounded-2xl border px-4 py-3 ${
                            isLight ? "bg-rose-50 border-rose-200" : "bg-red-500/10 border-red-500/20"
                          }`}>
                            <p
                              className={`text-[10px] uppercase tracking-widest mb-1.5 font-bold ${
                                isLight ? "text-rose-600" : "text-red-400/70"
                              }`}
                              style={{ fontFamily: "var(--font-button)" }}
                            >
                              Rad etish sababi
                            </p>
                            <p className={`text-sm leading-relaxed font-medium ${isLight ? "text-rose-800" : "text-red-300"}`}>
                              {application.rejection_comment.replace(/\[Reapply:\s*(allowed|blocked)\]/gi, "").trim()}
                            </p>
                          </div>
                        )}

                        <Timeline status={application.status} isLight={isLight} />
                      </div>
                    );
                  })()}

                  {/* Application preview grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: "Brand nomi", value: application.brand_name },
                      { label: "Yo'nalish", value: CATEGORY_LABELS[application.category] },
                      { label: "Yosh", value: `${application.age} yosh` },
                      { label: "Viloyat", value: application.region },
                      { label: "Yuridik nomi", value: application.legal_name },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-2xl border px-5 py-4 transition-all ${
                          isLight ? "bg-white/90 border-slate-200/90 shadow-xs" : "bg-white/3 border-white/8"
                        }`}
                      >
                        <p
                          className={`text-[10px] uppercase tracking-widest mb-1 ${isLight ? "text-slate-400" : "text-white/30"}`}
                          style={{ fontFamily: "var(--font-button)" }}
                        >
                          {item.label}
                        </p>
                        <p className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-white"}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Business description */}
                  <div className={`rounded-2xl border px-5 py-4 transition-all ${
                    isLight ? "bg-white/90 border-slate-200/90 shadow-xs" : "bg-white/3 border-white/8"
                  }`}>
                    <p
                      className={`text-[10px] uppercase tracking-widest mb-2 ${isLight ? "text-slate-400" : "text-white/30"}`}
                      style={{ fontFamily: "var(--font-button)" }}
                    >
                      Biznes tavsifi
                    </p>
                    <p className={`text-sm leading-relaxed ${isLight ? "text-slate-700 font-medium" : "text-white/70"}`}>{application.business_description}</p>
                  </div>

                  {/* Goals only */}
                  <div className={`rounded-2xl border px-5 py-4 transition-all ${
                    isLight ? "bg-white/90 border-slate-200/90 shadow-xs" : "bg-white/3 border-white/8"
                  }`}>
                    <p
                      className={`text-[10px] uppercase tracking-widest mb-3 ${isLight ? "text-slate-400" : "text-white/30"}`}
                      style={{ fontFamily: "var(--font-button)" }}
                    >
                      Maqsad
                    </p>
                    <ul className="flex flex-col gap-2">
                      {application.goals.map((item, i) => (
                        <li key={i} className={`flex items-start gap-2 text-sm ${isLight ? "text-slate-700 font-medium" : "text-white/70"}`}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00A8FF] shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Avatar */}
                  {application.avatar_url && (
                    <div>
                      <p
                        className="text-[10px] text-white/30 uppercase tracking-widest mb-2"
                        style={{ fontFamily: "var(--font-button)" }}
                      >
                        Shaxsiy fotosurat
                      </p>
                      <div className="rounded-xl border border-white/8 overflow-hidden aspect-video bg-white/3">
                        <img src={application.avatar_url} alt="Fotosurat" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  {/* Product images */}
                  {(() => {
                    const rawUrls = application.product_image_urls;
                    const parsedUrls: string[] = Array.isArray(rawUrls)
                      ? rawUrls
                      : typeof rawUrls === "string" && rawUrls.length > 2
                      ? (() => { try { return JSON.parse(rawUrls); } catch { return []; } })()
                      : [];

                    const productImages: string[] =
                      parsedUrls.length > 0
                        ? parsedUrls
                        : application.product_image_url ? [application.product_image_url] : [];

                    if (productImages.length === 0) return null;
                    return (
                      <div>
                        <p
                          className="text-[10px] text-white/30 uppercase tracking-widest mb-2"
                          style={{ fontFamily: "var(--font-button)" }}
                        >
                          Mahsulot rasmlari ({productImages.length} ta)
                        </p>
                        <div className={`grid gap-3 ${productImages.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                          {productImages.map((url, i) => (
                            <div key={i} className="rounded-xl border border-white/8 overflow-hidden aspect-video bg-white/3">
                              <img src={url} alt={`Mahsulot ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <p
                    className="text-center text-xs text-white/20"
                    style={{ fontFamily: "var(--font-button)" }}
                  >
                    Ariza topshirilgandan so'ng o'zgartirib bo'lmaydi. Savollar uchun telegram: @ytch_uz
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
