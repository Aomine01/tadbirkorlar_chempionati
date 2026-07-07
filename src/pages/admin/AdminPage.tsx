import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  ChevronDown,
  Trash2,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Application, ApplicationStatus, ApplicationCategory } from "../../types/database";

/* ─── Config ───────────────────────────────────────── */

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }
> = {
  submitted:    { label: "Yuborilgan",        color: "#00A8FF", bg: "bg-[#00A8FF]/10",  border: "border-[#00A8FF]/30",  icon: Clock        },
  under_review: { label: "Ko'rib chiqilmoqda", color: "#F59E0B", bg: "bg-amber-500/10",  border: "border-amber-500/30",  icon: Clock        },
  approved:     { label: "Tasdiqlandi",        color: "#10B981", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle2 },
  rejected:     { label: "Rad etildi",         color: "#EF4444", bg: "bg-red-500/10",     border: "border-red-500/30",    icon: XCircle      },
};

const CATEGORY_LABELS: Record<ApplicationCategory, string> = {
  ideas:    "G'oya",
  startup:  "Startap",
  business: "An'anaviy Biznes",
};

/* ─── Detail Modal ─────────────────────────────────── */

type ModalMode = "view" | "rejecting" | "confirm_delete";

const DetailModal = ({
  app,
  onClose,
  onStatusChange,
  onDelete,
}: {
  app: Application;
  onClose: () => void;
  onStatusChange: (id: string, status: ApplicationStatus, comment?: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [updating, setUpdating] = useState(false);
  const [mode, setMode] = useState<ModalMode>("view");
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center px-4 py-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 overflow-hidden my-auto"
        style={{ background: "#0d1117" }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <h2 className="font-bold text-lg" style={{ fontFamily: "var(--font-zuume)" }}>
              {app.brand_name.toUpperCase()}
            </h2>
            <p className="text-xs text-white/40">{app.legal_name}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Delete button — only shown in view mode */}
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
        <div className="p-6 flex flex-col gap-5">
          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusCfg.bg} ${statusCfg.border} border self-start`}>
            <statusCfg.icon size={13} style={{ color: statusCfg.color }} />
            <span className="text-xs font-medium" style={{ color: statusCfg.color }}>
              {statusCfg.label}
            </span>
          </div>

          {/* Existing rejection comment (if any) */}
          {app.rejection_comment && app.status === "rejected" && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
              <p className="text-[10px] text-red-400/60 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <MessageSquare size={10} /> Rad etish sababi
              </p>
              <p className="text-sm text-red-300">{app.rejection_comment}</p>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Ism",       value: app.brand_name },
              { label: "Yo'nalish", value: CATEGORY_LABELS[app.category] },
              { label: "Yosh",      value: `${app.age}` },
              { label: "Viloyat",   value: app.region },
              { label: "Sana",      value: new Date(app.created_at).toLocaleDateString("uz-UZ") },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Biznes tavsifi</p>
            <p className="text-sm text-white/70 leading-relaxed">{app.business_description}</p>
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
              <div className="rounded-xl overflow-hidden aspect-video border border-white/8">
                <img src={app.avatar_url} alt="Fotosurat" className="w-full h-full object-cover" />
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
                      <img src={url} alt={`Mahsulot ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ── ACTIONS ── */}
          <div className="pt-2 border-t border-white/8">

            {/* Error banner — shown when a Supabase action fails */}
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
              <div className="flex gap-3">
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
                <div className="flex gap-3">
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
                <div className="flex gap-3">
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

/* ─── Page ─────────────────────────────────────────── */

const AdminPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("is_deleted", false)           // hide soft-deleted rows
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

  // Derived filter values — only from visible (non-deleted) apps
  const uniqueRegions = Array.from(new Set(applications.map((a) => a.region)));

  const filtered = applications.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (regionFilter !== "all" && a.region !== regionFilter) return false;
    return true;
  });

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
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Jami",               value: stats.total,        color: "text-white"       },
            { label: "Yuborilgan",          value: stats.submitted,    color: "text-[#00A8FF]"   },
            { label: "Ko'rib chiqilmoqda",  value: stats.under_review, color: "text-amber-400"   },
            { label: "Tasdiqlandi",         value: stats.approved,     color: "text-emerald-400" },
            { label: "Rad etildi",          value: stats.rejected,     color: "text-red-400"     },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-center">
              <p className={`text-2xl font-bold ${stat.color}`} style={{ fontFamily: "var(--font-zuume)" }}>
                {stat.value}
              </p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
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
            onChange={setCategoryFilter}
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
            onChange={setRegionFilter}
            options={[
              { value: "all", label: "Barcha viloyatlar" },
              ...uniqueRegions.map((r) => ({ value: r, label: r })),
            ]}
          />
          <span className="text-xs text-white/30 self-center ml-auto">
            {filtered.length} ta ariza topildi
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-white/20 border-t-[#00A8FF] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-white/30 text-sm">Ariza topilmadi</div>
        ) : (
          <div className="rounded-2xl border border-white/8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
                    {["Brand nomi", "Yo'nalish", "Viloyat", "Yosh", "Holat", "Sana", ""].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] text-white/30 uppercase tracking-widest font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => {
                    const cfg = STATUS_CONFIG[app.status];
                    return (
                      <tr key={app.id} className="border-b border-white/5 hover:bg-white/2 transition-colors group">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-white">{app.brand_name}</p>
                            <p className="text-xs text-white/30">{app.legal_name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/60 whitespace-nowrap">{CATEGORY_LABELS[app.category]}</td>
                        <td className="px-4 py-3 text-white/60 whitespace-nowrap">{app.region}</td>
                        <td className="px-4 py-3 text-white/60">{app.age}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.border} border whitespace-nowrap`}
                              style={{ color: cfg.color }}
                            >
                              <cfg.icon size={11} />
                              {cfg.label}
                            </span>
                            {/* Comment indicator dot */}
                            {app.status === "rejected" && app.rejection_comment && (
                              <span title="Izoh mavjud" className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/30 whitespace-nowrap text-xs">
                          {new Date(app.created_at).toLocaleDateString("uz-UZ")}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelected(app)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/20 opacity-0 group-hover:opacity-100 transition-all cursor-pointer whitespace-nowrap"
                          >
                            <Eye size={12} /> Ko'rish
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <DetailModal
          app={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default AdminPage;
