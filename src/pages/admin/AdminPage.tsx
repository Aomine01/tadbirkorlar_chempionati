import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock,
  X,
  ChevronDown,
  Trash2,
  AlertTriangle,
  MessageSquare,
  Search,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Application, ApplicationStatus, ApplicationCategory } from "../../types/database";

/* ─── Config ───────────────────────────────────────── */

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; border: string; borderLeft: string; icon: typeof CheckCircle2 }
> = {
  submitted:    { label: "Yuborilgan",        color: "#00A8FF", bg: "bg-[#00A8FF]/10",  border: "border-[#00A8FF]/30",  borderLeft: "border-l-[#00A8FF]",  icon: Clock        },
  under_review: { label: "Ko'rib chiqilmoqda", color: "#F59E0B", bg: "bg-amber-500/10",  border: "border-amber-500/30",  borderLeft: "border-l-amber-500",  icon: Clock        },
  approved:     { label: "Tasdiqlandi",        color: "#10B981", bg: "bg-emerald-500/10", border: "border-emerald-500/30", borderLeft: "border-l-emerald-500", icon: CheckCircle2 },
  rejected:     { label: "Rad etildi",         color: "#EF4444", bg: "bg-red-500/10",     border: "border-red-500/30",    borderLeft: "border-l-red-500",    icon: XCircle      },
};

const CATEGORY_LABELS: Record<ApplicationCategory, string> = {
  ideas:    "G'oya",
  startup:  "Startap",
  business: "An'anaviy Biznes",
};

/* ─── Helper Functions ──────────────────────────────── */

const cleanDescription = (desc: string) => {
  return (desc || "")
    .replace(/\[Founder:\s*[^\]]+\]/i, "")
    .replace(/\[Gender:\s*(male|female)\]/i, "")
    .replace(/\[Phone:\s*[^\]]+\]/i, "")
    .trim();
};

const getFounderName = (app: Application) => {
  const rawDescription = app.business_description || "";
  const founderMatch = rawDescription.match(/\[Founder:\s*([^\]]+)\]/i);
  return founderMatch ? founderMatch[1].trim() : app.brand_name;
};

/* ─── Detail Modal ─────────────────────────────────── */

type ModalMode = "view" | "rejecting" | "confirm_delete";

const DetailModal = ({
  app,
  onClose,
  onStatusChange,
  onDelete,
  initialMode = "view",
}: {
  app: Application;
  onClose: () => void;
  onStatusChange: (id: string, status: ApplicationStatus, comment?: string) => void;
  onDelete: (id: string) => void;
  initialMode?: ModalMode;
}) => {
  const [updating, setUpdating] = useState(false);
  const [mode, setMode] = useState<ModalMode>(initialMode);
  const [rejectComment, setRejectComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [actionError, setActionError] = useState("");
  const statusCfg = STATUS_CONFIG[app.status];

  const clearError = () => setActionError("");

  /* ── Set status (approve / under_review) ── */
  const changeStatus = async (newStatus: ApplicationStatus) => {
    setUpdating(true);
    clearError();
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus, rejection_comment: null })
      .eq("id", app.id);
    setUpdating(false);
    if (error) {
      console.error("changeStatus error:", error);
      setActionError(error.message);
    } else {
      onStatusChange(app.id, newStatus);
      onClose();
    }
  };

  /* ── Reject with required comment ── */
  const handleRejectConfirm = async () => {
    if (rejectComment.trim().length < 10) {
      setCommentError("Kamida 10 ta belgi kiriting");
      return;
    }
    setUpdating(true);
    clearError();
    const { error } = await supabase
      .from("applications")
      .update({ status: "rejected", rejection_comment: rejectComment.trim() })
      .eq("id", app.id);
    setUpdating(false);
    if (error) {
      console.error("rejectConfirm error:", error);
      setActionError(error.message);
    } else {
      onStatusChange(app.id, "rejected", rejectComment.trim());
      onClose();
    }
  };

  /* ── Soft delete ── */
  const handleDeleteConfirm = async () => {
    setUpdating(true);
    clearError();
    const { error } = await supabase
      .from("applications")
      .update({ is_deleted: true })
      .eq("id", app.id);
    setUpdating(false);
    if (error) {
      console.error("deleteConfirm error:", error);
      setActionError(error.message);
    } else {
      onDelete(app.id);
      onClose();
    }
  };

  const founderName = getFounderName(app);
  const displayDesc = cleanDescription(app.business_description);

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center px-4 py-8 overflow-y-auto" data-lenis-prevent>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 overflow-hidden my-auto animate-modal-in"
        style={{ background: "#0d1117" }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-white/8">
          <div>
            <h2 className="font-bold text-lg text-white" style={{ fontFamily: "var(--font-zuume)" }}>
              {founderName.toUpperCase()}
            </h2>
            <p className="text-xs text-white/40">{app.brand_name}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Delete button */}
            {mode === "view" && (
              <button
                onClick={() => setMode("confirm_delete")}
                title="Arizani o'chirish"
                className="w-8 h-8 flex items-center justify-center rounded-full text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusCfg.bg} ${statusCfg.border} border self-start`}>
            <statusCfg.icon size={13} style={{ color: statusCfg.color }} />
            <span className="text-xs font-medium" style={{ color: statusCfg.color }}>
              {statusCfg.label}
            </span>
          </div>

          {/* Existing rejection comment */}
          {app.rejection_comment && app.status === "rejected" && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
              <p className="text-[10px] text-red-400/60 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <MessageSquare size={10} /> Rad etish sababi
              </p>
              <p className="text-sm text-red-300">{app.rejection_comment}</p>
            </div>
          )}

          {/* Info grid */}
          {(() => {
            const phoneMatch = app.business_description?.match(/\[Phone:\s*([^\]]+)\]/i);
            const displayPhone = phoneMatch ? phoneMatch[1].trim() : "-";
            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Ism",       value: founderName },
                  { label: "Brend",     value: app.brand_name },
                  { label: "Yo'nalish", value: CATEGORY_LABELS[app.category] },
                  { label: "Yosh",      value: `${app.age} yosh` },
                  { label: "Viloyat",   value: app.region },
                  { label: "Telefon",   value: displayPhone },
                  { label: "Sana",      value: new Date(app.created_at).toLocaleDateString("uz-UZ") },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className="text-sm font-semibold text-white truncate">{item.value}</p>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Description */}
          <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Biznes tavsifi</p>
            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{displayDesc}</p>
          </div>

          {/* Goals & Impact */}
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "Maqsad",          items: app.goals },
              { label: "Potensial Ta'sir", items: app.potential_impact },
            ].map((section) => (
              <div key={section.label} className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">{section.label}</p>
                <ul className="flex flex-col gap-1.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#00A8FF] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Avatar */}
          {app.avatar_url && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Shaxsiy fotosurat</p>
              <div className="rounded-xl overflow-hidden aspect-video border border-white/8 max-w-sm">
                <img src={app.avatar_url} alt="Fotosurat" className="w-full h-full object-cover" loading="lazy" />
              </div>
            </div>
          )}

          {/* Product images */}
          {(() => {
            const rawUrls = app.product_image_urls;
            const parsedUrls: string[] = Array.isArray(rawUrls)
              ? rawUrls
              : typeof rawUrls === "string" && rawUrls.length > 2
              ? (() => { try { return JSON.parse(rawUrls); } catch { return []; } })()
              : [];
            const productImages = parsedUrls.length > 0
              ? parsedUrls
              : app.product_image_url ? [app.product_image_url] : [];
            if (productImages.length === 0) return null;
            return (
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
                  Mahsulot rasmlari ({productImages.length} ta)
                </p>
                <div className={`grid gap-3 ${productImages.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {productImages.map((url, i) => (
                    <div key={i} className="rounded-xl overflow-hidden aspect-video border border-white/8">
                      <img src={url} alt={`Mahsulot ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ── ACTIONS ── */}
          <div className="pt-4 border-t border-white/8">

            {/* Error banner */}
            {actionError && (
              <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 flex items-start gap-2">
                <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-400">Xatolik yuz berdi</p>
                  <p className="text-xs text-red-300/70 mt-0.5 font-mono">{actionError}</p>
                </div>
              </div>
            )}

            {/* Default action buttons */}
            {mode === "view" && (
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  disabled={updating || app.status === "approved"}
                  onClick={() => changeStatus("approved")}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-semibold rounded-xl py-3 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {updating ? <div className="w-4 h-4 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin" /> : <CheckCircle2 size={15} />}
                  Tasdiqlash
                </button>
                <button
                  disabled={updating || app.status === "under_review"}
                  onClick={() => changeStatus("under_review")}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-semibold rounded-xl py-3 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Clock size={15} />
                  Ko'rib chiqilmoqda
                </button>
                <button
                  disabled={updating}
                  onClick={() => { setMode("rejecting"); setRejectComment(""); setCommentError(""); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold rounded-xl py-3 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <XCircle size={15} />
                  Rad etish
                </button>
              </div>
            )}

            {/* Rejection comment form */}
            {mode === "rejecting" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-red-400">
                  <MessageSquare size={14} />
                  <p className="text-sm font-semibold">Rad etish sababi (majburiy)</p>
                </div>
                <textarea
                  value={rejectComment}
                  onChange={(e) => { setRejectComment(e.target.value); setCommentError(""); }}
                  placeholder="Arizani rad etish sababini yozing (kamida 10 belgi)..."
                  rows={4}
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none resize-none transition-all focus:border-red-500/50 ${
                    commentError ? "border-red-500/50" : "border-white/10"
                  }`}
                  style={{ colorScheme: "dark" }}
                />
                {commentError && (
                  <p className="text-xs text-red-400">{commentError}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => setMode("view")}
                    disabled={updating}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleRejectConfirm}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-semibold rounded-xl py-3 text-sm transition-all disabled:opacity-40 cursor-pointer"
                  >
                    {updating
                      ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      : <XCircle size={15} />
                    }
                    Rad etishni tasdiqlash
                  </button>
                </div>
              </div>
            )}

            {/* Delete confirmation */}
            {mode === "confirm_delete" && (
              <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 flex items-start gap-3">
                  <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-400">Arizani o'chirish</p>
                    <p className="text-xs text-white/50 mt-0.5">
                      Bu amal qaytarib bo'lmaydi. Foydalanuvchi o'z arizasi o'chirilganini ko'radi va qayta ariza topshira oladi.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => setMode("view")}
                    disabled={updating}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-semibold rounded-xl py-3 text-sm transition-all disabled:opacity-40 cursor-pointer"
                  >
                    {updating
                      ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      : <Trash2 size={15} />
                    }
                    Ha, o'chirish
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.97) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in {
          animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

/* ─── Filter Select ────────────────────────────────── */

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-9 text-sm text-white outline-none focus:border-[#00A8FF]/40 transition-all cursor-pointer"
      style={{ colorScheme: "dark" }}
      aria-label={label}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
  </div>
);

/* ─── Application Card Component ───────────────────── */

const AdminApplicationCard = ({
  app,
  onOpenDetails,
  onRejectClick,
  onStatusChange,
  updatingId,
  setUpdatingId,
}: {
  app: Application;
  onOpenDetails: () => void;
  onRejectClick: () => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  updatingId: string | null;
  setUpdatingId: (id: string | null) => void;
}) => {
  const founderName = getFounderName(app);
  const displayDesc = cleanDescription(app.business_description);
  const cfg = STATUS_CONFIG[app.status];
  const isUpdating = updatingId === app.id;

  const quickChangeStatus = async (e: React.MouseEvent, newStatus: ApplicationStatus) => {
    e.stopPropagation();
    setUpdatingId(app.id);
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus, rejection_comment: null })
      .eq("id", app.id);
    setUpdatingId(null);
    if (!error) {
      onStatusChange(app.id, newStatus);
    } else {
      alert("Xatolik yuz berdi: " + error.message);
    }
  };

  const handleCardClick = () => {
    if (!isUpdating) onOpenDetails();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-2xl border ${cfg.border} border-l-4 ${cfg.borderLeft} bg-[#0d1117]/60 hover:bg-[#0d1117]/95 hover:border-white/15 transition-all duration-300 p-5 cursor-pointer flex flex-col justify-between gap-4 shadow-lg hover:shadow-2xl`}
    >
      {/* Top Identity block */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          {/* Avatar on card */}
          {app.avatar_url ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-zinc-900 shadow-inner">
              <img src={app.avatar_url} alt={founderName} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl shrink-0 border border-white/10 bg-gradient-to-br from-[#00A8FF]/10 to-transparent flex items-center justify-center text-white/30 text-[10px] font-bold">
              IMG
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base leading-snug truncate uppercase" style={{ fontFamily: "var(--font-zuume)" }}>
              {founderName}
            </h3>
            <p className="text-xs text-[#00A8FF] font-medium truncate leading-tight mt-0.5" style={{ fontFamily: "var(--font-button)" }}>
              {app.brand_name}
            </p>
          </div>

          <span className="text-[10px] text-white/30 font-medium whitespace-nowrap">
            {new Date(app.created_at).toLocaleDateString("uz-UZ")}
          </span>
        </div>

        {/* Description snipped */}
        <p className="text-xs text-white/50 line-clamp-2 leading-relaxed h-8 mb-1" style={{ fontFamily: "var(--font-button)" }}>
          {displayDesc}
        </p>

        {/* Small stats sheet */}
        <div className="grid grid-cols-3 gap-2 py-2.5 my-1 border-t border-b border-white/5 text-[9px] font-semibold text-white/40" style={{ fontFamily: "var(--font-button)" }}>
          <div className="min-w-0">
            <span className="block text-[8px] text-white/20 uppercase font-bold tracking-wider mb-0.5">Viloyat</span>
            <span className="text-white/80 truncate block">{app.region}</span>
          </div>
          <div className="min-w-0">
            <span className="block text-[8px] text-white/20 uppercase font-bold tracking-wider mb-0.5">Yo'nalish</span>
            <span className="text-white/80 truncate block">{CATEGORY_LABELS[app.category]}</span>
          </div>
          <div className="min-w-0">
            <span className="block text-[8px] text-white/20 uppercase font-bold tracking-wider mb-0.5">Yosh</span>
            <span className="text-white/80 block">{app.age} yosh</span>
          </div>
        </div>
      </div>

      {/* Action panel at the bottom */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex gap-2">
          {/* Quick status actions */}
          {app.status !== "approved" && (
            <button
              disabled={isUpdating}
              onClick={(e) => quickChangeStatus(e, "approved")}
              className="px-2.5 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase transition-colors cursor-pointer"
            >
              {isUpdating ? "..." : "Tasdiqlash"}
            </button>
          )}
          {app.status !== "under_review" && (
            <button
              disabled={isUpdating}
              onClick={(e) => quickChangeStatus(e, "under_review")}
              className="px-2.5 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase transition-colors cursor-pointer"
            >
              {isUpdating ? "..." : "Ko'rib chiqish"}
            </button>
          )}
          {app.status !== "rejected" && (
            <button
              disabled={isUpdating}
              onClick={(e) => { e.stopPropagation(); onRejectClick(); }}
              className="px-2.5 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 text-[10px] font-bold uppercase transition-colors cursor-pointer"
            >
              Rad etish
            </button>
          )}
        </div>

        <button
          disabled={isUpdating}
          onClick={handleCardClick}
          className="flex items-center gap-1.5 text-xs text-[#00A8FF] hover:text-white transition-colors cursor-pointer font-semibold"
          style={{ fontFamily: "var(--font-button)" }}
        >
          Batafsil →
        </button>
      </div>
    </div>
  );
};

/* ─── Page ─────────────────────────────────────────── */

const AdminPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [modalInitialMode, setModalInitialMode] = useState<ModalMode>("view");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Infinite Scroll state
  const [visibleCount, setVisibleCount] = useState(12);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
    setApplications(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleStatusChange = (id: string, newStatus: ApplicationStatus, comment?: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: newStatus, rejection_comment: comment ?? null }
          : a
      )
    );
  };

  const handleDelete = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  // Reset pagination count on search/filter update
  useEffect(() => {
    setVisibleCount(12);
  }, [statusFilter, categoryFilter, regionFilter, searchQuery]);

  // Infinite scrolling observer hook
  useEffect(() => {
    if (loading || filtered.length <= visibleCount) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 12);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    const trigger = document.getElementById("infinite-scroll-trigger");
    if (trigger) observer.observe(trigger);

    return () => observer.disconnect();
  }, [applications, visibleCount, loading, statusFilter, categoryFilter, regionFilter, searchQuery]);

  // Derived filter values
  const uniqueRegions = Array.from(new Set(applications.map((a) => a.region))).sort();

  const filtered = applications.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (regionFilter !== "all" && a.region !== regionFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const founderName = getFounderName(a).toLowerCase();
      const brand = a.brand_name.toLowerCase();
      const region = a.region.toLowerCase();
      const desc = cleanDescription(a.business_description).toLowerCase();
      
      return (
        founderName.includes(q) ||
        brand.includes(q) ||
        region.includes(q) ||
        desc.includes(q)
      );
    }
    return true;
  });

  const displayed = filtered.slice(0, visibleCount);

  const stats = {
    total:        applications.length,
    submitted:    applications.filter((a) => a.status === "submitted").length,
    under_review: applications.filter((a) => a.status === "under_review").length,
    approved:     applications.filter((a) => a.status === "approved").length,
    rejected:     applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="min-h-screen" style={{ background: "#080b10" }} data-lenis-prevent>
      {/* Header */}
      <div className="border-b border-white/8 bg-black/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-white/40 hover:text-white transition-colors">
              ← Bosh sahifa
            </Link>
            <span className="text-white/20">|</span>
            <h1 className="text-sm font-bold text-[#00A8FF]" style={{ fontFamily: "var(--font-zuume)" }}>
              ADMIN PANEL
            </h1>
          </div>
          <Link to="/dashboard" className="text-xs text-white/30 hover:text-white transition-colors">
            Dashboard →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats row with subtle glowing status rings */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Jami",               value: stats.total,        color: "text-white animate-pulse" },
            { label: "Yuborilgan",          value: stats.submitted,    color: "text-[#00A8FF] shadow-[#00A8FF]/5" },
            { label: "Ko'rib chiqilmoqda",  value: stats.under_review, color: "text-amber-400 shadow-amber-500/5" },
            { label: "Tasdiqlandi",         value: stats.approved,     color: "text-emerald-400 shadow-emerald-500/5" },
            { label: "Rad etildi",          value: stats.rejected,     color: "text-red-400 shadow-red-500/5" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/8 bg-[#0d1117]/35 backdrop-blur-sm px-4 py-4 text-center hover:scale-102 transition-transform duration-300 shadow-md">
              <p className={`text-3xl font-black tracking-tight ${stat.color}`} style={{ fontFamily: "var(--font-zuume)" }}>
                {stat.value}
              </p>
              <p className="text-[9px] text-white/35 font-bold uppercase tracking-widest mt-1.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CRM Search & Filters bar */}
        <div className="flex flex-col gap-4 mb-6 bg-[#0d1117]/40 border border-white/8 rounded-2xl p-5 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            
            {/* Search Input bar */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ism, brend, viloyat yoki tavsif bo'yicha qidirish..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#00A8FF]/60 transition-all shadow-inner"
              />
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter selectors list */}
            <div className="flex flex-wrap gap-2.5 items-center">
              <FilterSelect
                label="Holat"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all",          label: "Barcha holatlar"      },
                  { value: "submitted",    label: "Yuborilgan"           },
                  { value: "under_review", label: "Ko'rib chiqilmoqda"   },
                  { value: "approved",     label: "Tasdiqlandi"          },
                  { value: "rejected",     label: "Rad etildi"           },
                ]}
              />
              <FilterSelect
                label="Yo'nalish"
                value={categoryFilter}
                onChange={categoryFilter => setCategoryFilter(categoryFilter)}
                options={[
                  { value: "all",      label: "Barcha yo'nalishlar" },
                  { value: "ideas",    label: "G'oya"               },
                  { value: "startup",  label: "Startap"             },
                  { value: "business", label: "An'anaviy Biznes"    },
                ]}
              />
              <FilterSelect
                label="Viloyat"
                value={regionFilter}
                onChange={regionFilter => setRegionFilter(regionFilter)}
                options={[
                  { value: "all", label: "Barcha viloyatlar" },
                  ...uniqueRegions.map((r) => ({ value: r, label: r })),
                ]}
              />
              <span className="text-xs text-white/20 font-bold uppercase tracking-wider ml-auto lg:ml-2 pl-2 border-l border-white/10" style={{ fontFamily: "var(--font-button)" }}>
                {filtered.length} ta ariza
              </span>
            </div>

          </div>
        </div>

        {/* Content list (Grid instead of table) */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-white/20 border-t-[#00A8FF] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 text-white/20 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-button)" }}>
            Arizalar topilmadi
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayed.map((app) => (
                <AdminApplicationCard
                  key={app.id}
                  app={app}
                  onOpenDetails={() => {
                    setSelected(app);
                    setModalInitialMode("view");
                  }}
                  onRejectClick={() => {
                    setSelected(app);
                    setModalInitialMode("rejecting");
                  }}
                  onStatusChange={handleStatusChange}
                  updatingId={updatingId}
                  setUpdatingId={setUpdatingId}
                />
              ))}
            </div>

            {/* Scroll trigger element for infinite scroll */}
            {filtered.length > visibleCount && (
              <div id="infinite-scroll-trigger" className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-white/20 border-t-[#00A8FF] rounded-full animate-spin" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal view popup */}
      {selected && (
        <DetailModal
          app={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          initialMode={modalInitialMode}
        />
      )}
    </div>
  );
};

export default AdminPage;
