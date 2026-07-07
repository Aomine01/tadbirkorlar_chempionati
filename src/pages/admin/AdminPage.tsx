import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  ChevronDown,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Application, ApplicationStatus, ApplicationCategory } from "../../types/database";

/* ─── Config ───────────────────────────────────────── */

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }
> = {
  submitted: { label: "Yuborilgan", color: "#00A8FF", bg: "bg-[#00A8FF]/10", border: "border-[#00A8FF]/30", icon: Clock },
  under_review: { label: "Ko'rib chiqilmoqda", color: "#F59E0B", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: Clock },
  approved: { label: "Tasdiqlandi", color: "#10B981", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle2 },
  rejected: { label: "Rad etildi", color: "#EF4444", bg: "bg-red-500/10", border: "border-red-500/30", icon: XCircle },
};

const CATEGORY_LABELS: Record<ApplicationCategory, string> = {
  ideas: "G'oya",
  startup: "Startap",
  business: "An'anaviy Biznes",
};

/* ─── Detail Modal ─────────────────────────────────── */

const DetailModal = ({
  app,
  onClose,
  onStatusChange,
}: {
  app: Application;
  onClose: () => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}) => {
  const [updating, setUpdating] = useState(false);
  const statusCfg = STATUS_CONFIG[app.status];

  const changeStatus = async (newStatus: ApplicationStatus) => {
    setUpdating(true);
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", app.id);
    setUpdating(false);
    if (!error) {
      onStatusChange(app.id, newStatus);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center px-4 py-8 overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
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
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
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

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Ism", value: app.brand_name },
              { label: "Yo'nalish", value: CATEGORY_LABELS[app.category] },
              { label: "Yosh", value: `${app.age}` },
              { label: "Viloyat", value: app.region },
              { label: "Sana", value: new Date(app.created_at).toLocaleDateString("uz-UZ") },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">
                  {item.label}
                </p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
              Biznes tavsifi
            </p>
            <p className="text-sm text-white/70 leading-relaxed">{app.business_description}</p>
          </div>

          {/* Goals & Impact */}
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "Maqsad", items: app.goals },
              { label: "Potensial Ta'sir", items: app.potential_impact },
            ].map((section) => (
              <div key={section.label} className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
                  {section.label}
                </p>
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

          {/* Images */}
          {(app.avatar_url || app.product_image_url) && (
            <div className="grid sm:grid-cols-2 gap-3">
              {app.avatar_url && (
                <div className="rounded-xl overflow-hidden aspect-video border border-white/8">
                  <img src={app.avatar_url} alt="Fotosurat" className="w-full h-full object-cover" />
                </div>
              )}
              {app.product_image_url && (
                <div className="rounded-xl overflow-hidden aspect-video border border-white/8">
                  <img src={app.product_image_url} alt="Mahsulot" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-white/8">
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
              disabled={updating || app.status === "rejected"}
              onClick={() => changeStatus("rejected")}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold rounded-xl py-3 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <XCircle size={15} />
              Rad etish
            </button>
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
      .order("created_at", { ascending: false });
    setApplications(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleStatusChange = (id: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  // Derived filter values
  const uniqueRegions = Array.from(new Set(applications.map((a) => a.region)));

  const filtered = applications.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (regionFilter !== "all" && a.region !== regionFilter) return false;
    return true;
  });

  const stats = {
    total: applications.length,
    submitted: applications.filter((a) => a.status === "submitted").length,
    under_review: applications.filter((a) => a.status === "under_review").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "#080b10" }}
      data-lenis-prevent
    >
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
            { label: "Jami", value: stats.total, color: "text-white" },
            { label: "Yuborilgan", value: stats.submitted, color: "text-[#00A8FF]" },
            { label: "Ko'rib chiqilmoqda", value: stats.under_review, color: "text-amber-400" },
            { label: "Tasdiqlandi", value: stats.approved, color: "text-emerald-400" },
            { label: "Rad etildi", value: stats.rejected, color: "text-red-400" },
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
              { value: "all", label: "Barcha holatlar" },
              { value: "submitted", label: "Yuborilgan" },
              { value: "under_review", label: "Ko'rib chiqilmoqda" },
              { value: "approved", label: "Tasdiqlandi" },
              { value: "rejected", label: "Rad etildi" },
            ]}
          />
          <FilterSelect
            label="Yo'nalish"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: "all", label: "Barcha yo'nalishlar" },
              { value: "ideas", label: "G'oya" },
              { value: "startup", label: "Startap" },
              { value: "business", label: "An'anaviy Biznes" },
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
          <div className="text-center py-24 text-white/30 text-sm">
            Ariza topilmadi
          </div>
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
                      <tr
                        key={app.id}
                        className="border-b border-white/5 hover:bg-white/2 transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-white">{app.brand_name}</p>
                            <p className="text-xs text-white/30">{app.legal_name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                          {CATEGORY_LABELS[app.category]}
                        </td>
                        <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                          {app.region}
                        </td>
                        <td className="px-4 py-3 text-white/60">{app.age}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.border} border whitespace-nowrap`}
                            style={{ color: cfg.color }}
                          >
                            <cfg.icon size={11} />
                            {cfg.label}
                          </span>
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
        />
      )}
    </div>
  );
};

export default AdminPage;
