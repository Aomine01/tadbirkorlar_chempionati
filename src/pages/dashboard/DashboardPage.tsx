import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, XCircle, FileText, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { Application } from "../../types/database";
import HeroImage from "../../assets/img/hero-image.png";

/* ─── Status config ────────────────────────────────── */

const STATUS_CONFIG = {
  submitted: {
    label: "Ariza qabul qilindi",
    color: "#00A8FF",
    icon: FileText,
    bg: "bg-[#00A8FF]/10",
    border: "border-[#00A8FF]/20",
  },
  under_review: {
    label: "Ko'rib chiqilmoqda",
    color: "#F59E0B",
    icon: Clock,
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  approved: {
    label: "Tasdiqlandi",
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
  ideas: "G'oya",
  startup: "Startap",
  business: "An'anaviy Biznes",
};

/* ─── Status Timeline ──────────────────────────────── */

const steps = ["submitted", "under_review", "approved"] as const;
type TimelineStatus = (typeof steps)[number] | "rejected";

const Timeline = ({ status }: { status: TimelineStatus }) => {
  const isRejectedStatus = status === "rejected";
  const rejectedAt = isRejectedStatus
      ? steps.findIndex((s) =>
          s === "under_review" ? true : s === "submitted"
        )
      : -1;

  const currentIdx = isRejectedStatus ? 1 : steps.indexOf(status as (typeof steps)[number]);

  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => {
        const cfg = STATUS_CONFIG[step];
        const isActive = i <= currentIdx && !isRejectedStatus;
        const isCurrent = isRejectedStatus ? i === rejectedAt + 1 : i === currentIdx;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  isRejectedStatus && isCurrent
                    ? "border-red-500 bg-red-500/20"
                    : isActive
                    ? `border-[${cfg.color}]`
                    : "border-white/15 bg-white/5"
                }`}
                style={
                  isActive
                    ? { borderColor: cfg.color, backgroundColor: `${cfg.color}20` }
                    : {}
                }
              >
                {isRejectedStatus && isCurrent ? (
                  <XCircle size={16} className="text-red-400" />
                ) : isActive ? (
                  <CheckCircle2 size={16} style={{ color: cfg.color }} />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                )}
              </div>
              <span className="text-[10px] text-white/40 text-center leading-tight max-w-[70px]">
                {cfg.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-px mx-1 mb-5 transition-all duration-500"
                style={{
                  background:
                    isActive && i < currentIdx
                      ? STATUS_CONFIG[steps[i]].color
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
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setApplication(data);
        setLoading(false);
      });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const statusCfg = application
    ? STATUS_CONFIG[application.status]
    : null;

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <span
              className="text-sm font-semibold text-white/40 hover:text-white transition-colors"
              style={{ fontFamily: "var(--font-button)" }}
            >
              ← Bosh sahifa
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30" style={{ fontFamily: "var(--font-button)" }}>
              {profile?.full_name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1
              className="text-3xl sm:text-5xl font-bold mb-2"
              style={{ fontFamily: "var(--font-zuume)" }}
            >
              SALOM, <span style={{ color: "#00A8FF" }}>{profile?.full_name?.split(" ")[0]?.toUpperCase()}</span>
            </h1>
            <p className="text-sm text-white/40" style={{ fontFamily: "var(--font-button)" }}>
              Ariza holati va shaxsiy ma'lumotlaringizni bu yerda kuzating
            </p>
          </div>
          <div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 cursor-pointer w-fit"
              style={{ fontFamily: "var(--font-button)" }}
            >
              <LogOut size={14} />
              Chiqish
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-white/20 border-t-[#00A8FF] rounded-full animate-spin" />
          </div>
        ) : !application ? (
          /* ── No application ── */
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
              className="inline-flex items-center gap-2 bg-[#00A8FF] hover:bg-[#0090dd] text-white font-semibold rounded-xl px-8 py-4 text-sm transition-all duration-200"
            >
              Ariza topshirish <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          /* ── Application exists ── */
          <div className="flex flex-col gap-6">
            {/* Status card */}
            {(() => {
              const cfg = statusCfg!;
              const StatusIcon = cfg.icon;
              return (
                <div className={`rounded-2xl border p-6 sm:p-8 ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-start justify-between gap-4 mb-8">
                    <div>
                      <p className="text-xs text-white/40 mb-1 uppercase tracking-widest" style={{ fontFamily: "var(--font-button)" }}>
                        Ariza holati
                      </p>
                      <div className="flex items-center gap-2">
                        <StatusIcon size={18} style={{ color: cfg.color }} />
                        <span className="text-lg font-bold" style={{ color: cfg.color, fontFamily: "var(--font-zuume)" }}>
                          {cfg.label.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-white/30 mt-1" style={{ fontFamily: "var(--font-button)" }}>
                      {new Date(application.created_at).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>

                  <Timeline status={application.status} />
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
                  className="rounded-xl border border-white/8 bg-white/3 px-5 py-4"
                >
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-button)" }}>
                    {item.label}
                  </p>
                  <p className="text-sm font-medium text-white">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="rounded-xl border border-white/8 bg-white/3 px-5 py-4">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-button)" }}>
                Biznes tavsifi
              </p>
              <p className="text-sm text-white/70 leading-relaxed">{application.business_description}</p>
            </div>

            {/* Goals & Impact */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Maqsad", items: application.goals },
                { label: "Potensial ta'sir", items: application.potential_impact },
              ].map((section) => (
                <div key={section.label} className="rounded-xl border border-white/8 bg-white/3 px-5 py-4">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-button)" }}>
                    {section.label}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00A8FF] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Images */}
            {(application.avatar_url || application.product_image_url) && (
              <div className="grid sm:grid-cols-2 gap-4">
                {application.avatar_url && (
                  <div className="rounded-xl border border-white/8 overflow-hidden aspect-video bg-white/3">
                    <img src={application.avatar_url} alt="Fotosurat" className="w-full h-full object-cover" />
                  </div>
                )}
                {application.product_image_url && (
                  <div className="rounded-xl border border-white/8 overflow-hidden aspect-video bg-white/3">
                    <img src={application.product_image_url} alt="Mahsulot rasmi" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            <p className="text-center text-xs text-white/20" style={{ fontFamily: "var(--font-button)" }}>
              Ariza topshirilgandan so'ng o'zgartirib bo'lmaydi. Savollar uchun telegram: @ytch_uz
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default DashboardPage;
