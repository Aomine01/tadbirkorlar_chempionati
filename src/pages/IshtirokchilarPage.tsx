import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import type { Application } from "../types/database";
import logo from "../assets/logos/white full.png";
import HeroImage from "../assets/img/hero-image.png";
import largeCardMen from "../assets/img/largecardmen.png";
import largeCardFemale from "../assets/img/largcardfemale.png";
import miniMaleLight from "../assets/imglight/minimalelight.png";
import miniFemaleLight from "../assets/imglight/minifemalelight.png";

/* ─── Supabase Image Transform Helper ──────────────────── */
// Uses Supabase Storage image transforms to serve optimally-sized WebP images.
// Falls back to the original URL for non-Supabase URLs.
function imgUrl(
  url: string | null | undefined,
  opts: { width?: number; height?: number; quality?: number; format?: string } = {}
): string {
  if (!url) return "";
  // Only apply transforms to Supabase Storage URLs
  if (!url.includes("/storage/v1/object/public/")) return url;
  const { width, height, quality = 75, format = "webp" } = opts;
  const params = new URLSearchParams();
  if (width) params.set("width", String(width));
  if (height) params.set("height", String(height));
  params.set("quality", String(quality));
  params.set("format", format);
  // Supabase image transform endpoint
  return url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/") + "?" + params.toString();
}

/* ─── Extended Application Interface ────────────────── */

interface ExtendedApplication extends Application {
  phone?: string;
  gallery?: string[];
  location?: string;
  full_name?: string;
}

/* ─── Category labels ──────────────────────────────── */

const CATEGORY_LABELS: Record<string, string> = {
  ideas: "G'oya",
  startup: "Startap",
  business: "Biznes",
};

/* ─── Local Premium Participants (Mock/Static Data) ─── */
// All participants are migrated to Supabase database now.
const LOCAL_PARTICIPANTS: ExtendedApplication[] = [];

/* ─── Compact Participant Card ─────────────────────── */

const ParticipantCard = ({
  app,
  onClick
}: {
  app: ExtendedApplication;
  onClick: () => void;
}) => {
  // Determine gender for card accent coloring
  const gender = app.gender || "male";
  
  // Theme styling based on gender
  const isFemale = gender === "female";
  const hoverBorderColor = isFemale ? "hover:border-[#FF5B84]/40" : "hover:border-[#00A8FF]/40";
  const accentTextColor = isFemale ? "text-[#FF5B84]" : "text-[#00A8FF]";
  const actionStripHover = isFemale ? "group-hover:text-[#FF5B84]" : "group-hover:text-[#00A8FF]";
  const gradientStart = isFemale ? "from-[#FF5B84]/15" : "from-[#00A8FF]/15";

  return (
    <article
      onClick={onClick}
      className={`group relative rounded-xl overflow-hidden border border-white/5 transition-[transform,border-color] duration-300 ${hoverBorderColor} hover:-translate-y-0.5 bg-[#0a0a0c]/95 sm:bg-[#0a0a0c]/80 sm:backdrop-blur-sm cursor-pointer shadow-md flex flex-col justify-between`}
    >
      <div>
        {/* Aspect 3/4 Portrait Photo */}
        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-950">
          {app.product_image_url ? (
            <img
              src={imgUrl(app.product_image_url, { width: 400, quality: 75 })}
              alt={app.full_name || app.brand_name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300 scale-100 group-hover:scale-103 transition-transform duration-500"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientStart} to-transparent`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10">
            <span
              className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider backdrop-blur-md bg-black/60 border border-white/10 ${accentTextColor}`}
              style={{ fontFamily: "var(--font-button)" }}
            >
              {CATEGORY_LABELS[app.category] ?? app.category}
            </span>
          </div>
        </div>

        {/* Text Area */}
        <div className="p-2.5 sm:p-3">
          {/* Region */}
          <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-white/40 mb-1" style={{ fontFamily: "var(--font-button)" }}>
            {app.region}
          </div>
          {/* Founder Name */}
          <h2
            className="text-base sm:text-xl font-bold text-white leading-tight uppercase truncate"
            style={{ fontFamily: "var(--font-zuume)" }}
          >
            {app.full_name || app.brand_name}
          </h2>
          {/* Brand/Business Name Subtitle */}
          <div className={`text-[10px] sm:text-xs ${accentTextColor} font-medium truncate mt-0.5`} style={{ fontFamily: "var(--font-button)" }}>
            {app.brand_name}
          </div>
        </div>
      </div>

      {/* Action Strip */}
      <div className={`px-2.5 sm:px-3 py-2 sm:py-2.5 border-t border-white/5 flex items-center justify-between text-[9px] sm:text-[10px] font-semibold text-white/40 ${actionStripHover} transition-colors duration-200`} style={{ fontFamily: "var(--font-button)" }}>
        <span>Ko'proq ma'lumot</span>
        <ArrowRight size={10} className="transform translate-x-0 group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>
    </article>
  );
};

/* ─── Premium Participant Detail Modal ──────────────── */

const ParticipantDetailModal = ({
  app,
  onClose
}: {
  app: ExtendedApplication | null;
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

  useEffect(() => {
    if (app) {
      setActiveGalleryIdx(0);
    }
  }, [app?.id]);

  useEffect(() => {
    if (app) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [app]);

  if (!app) return null;

  const galleryImages = app.gallery || [];

  // Parse gender
  const rawDescription = app.business_description || "";
  const gender = app.gender || "male";
  const cleanDescription = rawDescription
    .replace(/\[Founder:\s*[^\]]+\]/i, "")
    .replace(/\[Gender:\s*(male|female)\]/i, "")
    .replace(/\[Phone:\s*[^\]]+\]/i, "")
    .trim();

  const { theme } = useTheme();
  const isLight = theme === "light";
  const bgImage = isLight
    ? gender === "female" ? miniFemaleLight : miniMaleLight
    : gender === "female" ? largeCardFemale : largeCardMen;
  const isFemale = gender === "female";
  const accentTextColor = isFemale ? "text-[#FF5B84]" : "text-[#00A8FF]";
  const accentBorderColor = isFemale ? "hover:border-[#FF5B84]/20" : "hover:border-[#00A8FF]/20";
  const activeThumbnailBorder = isFemale ? "border-[#FF5B84] ring-[#FF5B84]/20" : "border-[#00A8FF] ring-[#00A8FF]/20";
  const numberBadgeBg = isFemale ? "bg-[#FF5B84]/10 text-[#FF5B84]" : "bg-[#00A8FF]/10 text-[#00A8FF]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in" data-lenis-prevent>
      {/* Backdrop - optimized blur for weak devices */}
      <div
        className="absolute inset-0 bg-black/95 sm:bg-black/85 sm:backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card with Gender Background */}
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 p-4 sm:p-8 md:p-10 shadow-2xl z-10 no-scrollbar animate-modal-in flex flex-col gap-4 sm:gap-6"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(3, 3, 5, 0.55) 0%, rgba(3, 3, 5, 0.75) 100%), url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer z-20"
        >
          <X size={18} />
        </button>

        {/* ── Grid Layout ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Portrait image + info boxes */}
          <div className="md:col-span-4 flex flex-col gap-5">
            {/* Portrait Image (Aspect 3/4) */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 w-full max-w-[280px] mx-auto md:max-w-none">
              <img
                src={imgUrl(app.product_image_url, { width: 600, quality: 85 })}
                alt={app.full_name || app.brand_name}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Quick Stats / Info Sheet (Glassmorphic style) */}
            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md p-5 flex flex-col gap-4 text-xs" style={{ fontFamily: "var(--font-button)" }}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-white/40">Yoshi:</span>
                <span className="font-semibold text-white">{app.age} yosh</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-white/40">Brend nomi:</span>
                <span className="font-semibold text-white">{app.brand_name || "-"}</span>
              </div>
              <div className="flex justify-between items-start pb-2 border-b border-white/5">
                <span className="text-white/40 shrink-0">Hudud:</span>
                <span className="font-semibold text-white text-right ml-4">
                  {app.region} {app.location ? `, ${app.location}` : ""}
                </span>
              </div>
              {app.phone && (
                <div className="flex justify-between items-center pb-2 border-b border-white/5 w-full">
                  <span className="text-white/40 shrink-0">Telefon:</span>
                  {user ? (
                    <a href={`tel:${app.phone}`} className={`font-semibold ${accentTextColor} hover:underline truncate ml-4`}>
                      {app.phone}
                    </a>
                  ) : (
                    <Link
                      to="/auth/login"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all text-[10px] font-medium ml-4 shrink-0"
                    >
                      Ko'rish uchun kirish
                    </Link>
                  )}
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-white/40">Yuridik nomi:</span>
                <span className="font-semibold text-white/80">{app.legal_name || "-"}</span>
              </div>
            </div>

            {/* Potential Impact Box (Glassmorphic style) */}
            {app.potential_impact && app.potential_impact.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md p-5 flex flex-col gap-3 text-xs" style={{ fontFamily: "var(--font-button)" }}>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 border-b border-white/5 pb-2">
                  Potensial Ta'sir
                </h3>
                <ul className="flex flex-col gap-2">
                  {app.potential_impact.map((impact, idx) => (
                    <li key={idx} className="flex gap-2 text-white/70 leading-relaxed">
                      <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
                      <span>{impact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: details */}
          <div className="md:col-span-8 flex flex-col gap-6">
            
            {/* Header Identity Block */}
            <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
              <div className="text-white/40 text-xs uppercase tracking-widest font-bold" style={{ fontFamily: "var(--font-button)" }}>
                {app.region}
              </div>
              <h2
                className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight uppercase tracking-tight"
                style={{ fontFamily: "var(--font-zuume)" }}
              >
                {app.full_name || app.brand_name}
              </h2>
              <div className={`text-lg sm:text-xl font-bold ${accentTextColor} uppercase mt-1`} style={{ fontFamily: "var(--font-button)" }}>
                {app.brand_name}
              </div>
            </div>

            {/* Biznes Haqida */}
            <div className={`rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md p-5 ${accentBorderColor} transition-all duration-300`}>
              <h3 className={`text-[10px] font-bold uppercase tracking-[0.15em] ${accentTextColor} mb-3`} style={{ fontFamily: "var(--font-button)" }}>
                Biznes Haqida
              </h3>
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                {cleanDescription}
              </p>
            </div>

            {/* Goals */}
            {app.goals && app.goals.length > 0 && (
              <div className={`rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md p-5 ${accentBorderColor} transition-all duration-300`}>
                <h3 className={`text-[10px] font-bold uppercase tracking-[0.15em] ${accentTextColor} mb-3`} style={{ fontFamily: "var(--font-button)" }}>
                  Maqsadlari
                </h3>
                <ul className="flex flex-col gap-3">
                  {app.goals.map((goal, idx) => (
                    <li key={idx} className="flex gap-2.5 text-xs sm:text-sm text-white/70 leading-relaxed items-start">
                      <span className={`flex items-center justify-center w-5 h-5 rounded ${numberBadgeBg} text-[10px] font-bold shrink-0 mt-0.5`}>
                        {idx + 1}
                      </span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Presentation frames / Featured Showcase Gallery */}
            {galleryImages.length > 0 && (
              <div className="flex flex-col gap-4 mt-2">
                <h3 className={`text-[10px] font-bold uppercase tracking-[0.15em] ${accentTextColor}`} style={{ fontFamily: "var(--font-button)" }}>
                  Loyihadan Lavhalar (Taqdimot Sahifalari)
                </h3>
                
                {/* Featured Large Image Box */}
                <div 
                  onClick={() => setActiveImage(galleryImages[activeGalleryIdx])}
                  className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/15 bg-zinc-950/80 shadow-lg cursor-pointer group hover:border-[#00A8FF]/30 transition-colors duration-300"
                >
                  <img
                    src={imgUrl(galleryImages[activeGalleryIdx], { width: 1200, quality: 85 })}
                    alt={`Showcase frame ${activeGalleryIdx + 1}`}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <span className="px-3.5 py-2 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white uppercase tracking-wider">
                      Kattalashtirish uchun bosing
                    </span>
                  </div>
                </div>

                {/* Thumbnails list */}
                <div className="grid grid-cols-4 gap-3">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveGalleryIdx(i)}
                      className={`relative aspect-video rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer shadow-sm group ${
                        activeGalleryIdx === i
                          ? `${activeThumbnailBorder} ring-2 scale-102`
                          : "border-white/10 bg-zinc-950/40 hover:border-white/20 hover:scale-102"
                      }`}
                    >
                      <img
                        src={imgUrl(img, { width: 300, quality: 70 })}
                        alt={`Thumbnail ${i + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {activeGalleryIdx !== i && (
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/95 animate-fade-in">
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X size={22} />
          </button>
          <img
            src={imgUrl(activeImage, { width: 1600, quality: 90 })}
            alt="Presentation slide expanded"
            decoding="async"
            className="relative max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/10"
          />
        </div>
      )}

      {/* Modal Keyframe styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.97) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        .animate-modal-in {
          animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

/* ─── Page ─────────────────────────────────────────── */

const IshtirokchilarPage = () => {
  const [applications, setApplications] = useState<ExtendedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<ExtendedApplication | null>(null);
  
  // Weak device optimization: pagination count
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    supabase
      .from("applications")
      .select("*, profiles(full_name, phone_number)")
      .eq("status", "approved")
      .eq("is_deleted", false)          // exclude soft-deleted applications
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const dbApps = (data ?? []).map((app: any) => {
          // Parse product_image_urls if stored as a JSON string
          let gallery: string[] = [];
          if (app.product_image_urls) {
            if (Array.isArray(app.product_image_urls)) {
              gallery = app.product_image_urls;
            } else if (typeof app.product_image_urls === "string") {
              try {
                gallery = JSON.parse(app.product_image_urls);
              } catch {
                gallery = [app.product_image_urls];
              }
            }
          }

          // Parse embedded metadata from description (works around RLS profiles query restriction)
          const rawDescription = app.business_description || "";
          const founderMatch = rawDescription.match(/\[Founder:\s*([^\]]+)\]/i);
          const genderMatch = rawDescription.match(/\[Gender:\s*(male|female)\]/i);
          const phoneMatch = rawDescription.match(/\[Phone:\s*([^\]]+)\]/i);

          const full_name = founderMatch ? founderMatch[1].trim() : (app.profiles?.full_name || app.brand_name);
          const gender = genderMatch ? (genderMatch[1].toLowerCase() as "male" | "female") : (app.gender || "male");
          const phone = phoneMatch ? phoneMatch[1].trim() : (app.profiles?.phone_number || app.phone || "");

          return {
            ...app,
            full_name,
            gender,
            phone,
            gallery
          };
        });
        
        // Combine static premium local participants with Supabase database applications
        setApplications([...LOCAL_PARTICIPANTS, ...dbApps]);
        setLoading(false);
      });
  }, []);

  // Reset pagination when region filter changes
  useEffect(() => {
    setVisibleCount(12);
  }, [regionFilter]);

  // Unique regions with participant counts for the viloyat filter
  const regionCounts = applications.reduce<Record<string, number>>((acc, a) => {
    acc[a.region] = (acc[a.region] ?? 0) + 1;
    return acc;
  }, {});
  const uniqueRegions = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]).map(([r]) => r);

  const filtered = applications.filter((a) => {
    if (regionFilter !== "all" && a.region !== regionFilter) return false;
    return true;
  });

  // Paginated/Sliced subset to display
  const displayed = filtered.slice(0, visibleCount);

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
        <div className="border-b border-white/5 sticky top-0 z-10 bg-black/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 group-hover:border-white/20 transition-colors">
                <ArrowRight size={14} className="text-white/40 rotate-180" />
              </div>
              <div className="flex items-center bg-[#111111] border border-white/10 rounded-[10px] px-3 py-2.5 overflow-hidden">
                <img src={logo} alt="Logo" className="h-7 w-auto object-contain" />
              </div>
            </Link>
            <Link
              to="/auth/login"
              className="hidden sm:flex items-center gap-2 text-xs border border-white/10 rounded-xl px-4 py-2 text-white/60 hover:text-white hover:border-white/20 transition-all"
            >
              Ariza topshirish <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
          <p
            className="text-xs text-[#00A8FF] tracking-[0.2em] uppercase mb-3"
            style={{ fontFamily: "var(--font-button)" }}
          >
            Yosh Tadbirkorlar Chempionati
          </p>
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 leading-none"
            style={{ fontFamily: "var(--font-zuume)" }}
          >
            ISHTIROKCHILAR
          </h1>
          <p className="text-sm text-white/40 max-w-lg" style={{ fontFamily: "var(--font-button)" }}>
            Chempionatga qabul qilingan ishtirokchilar — kelajakning yosh tadbirkorlari
          </p>

          {/* Viloyat filter */}
          {!loading && applications.length > 0 && (
            <div className="mt-6 md:mt-8">
              <div className="flex overflow-x-auto pb-3 gap-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap items-center">
                {/* All button */}
                <button
                  onClick={() => setRegionFilter("all")}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    regionFilter === "all"
                      ? "bg-[#00A8FF]/20 border border-[#00A8FF]/30 text-[#00A8FF]"
                      : "border border-white/10 text-white/40 hover:text-white hover:border-white/20"
                  }`}
                >
                  Barchasi
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    regionFilter === "all" ? "bg-[#00A8FF]/20 text-[#00A8FF]" : "bg-white/8 text-white/30"
                  }`}>
                    {applications.length}
                  </span>
                </button>

                {/* One pill per viloyat, sorted by participant count */}
                {uniqueRegions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setRegionFilter(regionFilter === region ? "all" : region)}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      regionFilter === region
                        ? "bg-[#00A8FF]/20 border border-[#00A8FF]/30 text-[#00A8FF]"
                        : "border border-white/10 text-white/40 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {region}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      regionFilter === region ? "bg-[#00A8FF]/20 text-[#00A8FF]" : "bg-white/8 text-white/30"
                    }`}>
                      {regionCounts[region]}
                    </span>
                  </button>
                ))}

                <span className="ml-auto text-xs text-white/20" style={{ fontFamily: "var(--font-button)" }}>
                  {filtered.length} ta ishtirokchi
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-8 h-8 border-2 border-white/20 border-t-[#00A8FF] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-4xl mb-4 font-bold text-white/10" style={{ fontFamily: "var(--font-zuume)" }}>
                TEZDA
              </p>
              <p className="text-sm text-white/30">
                Boshqa filter tanlab ko'ring
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {displayed.map((app) => (
                  <ParticipantCard
                    key={app.id}
                    app={app}
                    onClick={() => setSelectedApp(app)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {filtered.length > visibleCount && (
                <div className="flex justify-center mt-12 mb-8">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider border border-white/10 hover:border-[#00A8FF]/40 text-white/70 hover:text-white bg-[#0a0a0c]/85 hover:bg-[#0a0a0c] backdrop-blur-md transition-all duration-300 hover:scale-102 cursor-pointer shadow-lg"
                    style={{ fontFamily: "var(--font-button)" }}
                  >
                    <span>Ko'proq yuklash</span>
                    <ArrowRight size={12} className="rotate-90 text-[#00A8FF] animate-bounce" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer strip */}
        <div className="border-t border-white/5 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <img src={logo} alt="Logo" className="h-5 w-auto opacity-30" />
            <p className="text-xs text-white/20" style={{ fontFamily: "var(--font-button)" }}>
              © {new Date().getFullYear()} Yosh Tadbirkorlar Chempionati
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Modal Popup */}
      <ParticipantDetailModal
        app={selectedApp}
        onClose={() => setSelectedApp(null)}
      />
    </div>
  );
};

export default IshtirokchilarPage;
