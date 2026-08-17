import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X, Search, MapPin, RotateCcw } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import type { Application } from "../types/database";
import logo from "../assets/logos/white full.png";
import logoBlue from "../assets/logos/blue-full.png";
import HeroImage from "../assets/img/hero-image.png";
import HeroLightImage from "../assets/imglight/herolight.png";
import largeCardMen from "../assets/img/largecardmen.png";
import largeCardFemale from "../assets/img/largcardfemale.png";
import miniMaleLight from "../assets/imglight/minimalelight.png";
import miniFemaleLight from "../assets/imglight/minifemalelight.png";

/* ─── Region Normalizer ───────────────────────────────────────── */
function normalizeRegionName(regionStr: string): string {
  if (!regionStr) return "Toshkent shahri";
  let norm = regionStr.trim().toUpperCase().replace(/’|‘|`/g, "'");

  if (norm.includes("QORAQALPOG") || norm.includes("QORAQOLPOG") || norm.includes("KARAKALPAK")) {
    return "Qoraqalpog'iston Respublikasi";
  }
  if (norm.includes("TOSHKENT SHAHRI")) return "Toshkent shahri";
  if (norm.includes("TOSHKENT VILOYATI")) return "Toshkent viloyati";
  if (norm.includes("ANDIJON")) return "Andijon viloyati";
  if (norm.includes("BUXORO")) return "Buxoro viloyati";
  if (norm.includes("FARG")) return "Farg'ona viloyati";
  if (norm.includes("JIZZAX")) return "Jizzax viloyati";
  if (norm.includes("XORAZM")) return "Xorazm viloyati";
  if (norm.includes("NAMANGAN")) return "Namangan viloyati";
  if (norm.includes("NAVOIY")) return "Navoiy viloyati";
  if (norm.includes("QASHQADARYO")) return "Qashqadaryo viloyati";
  if (norm.includes("SAMARQAND")) return "Samarqand viloyati";
  if (norm.includes("SIRDARYO")) return "Sirdaryo viloyati";
  if (norm.includes("SURXONDARYO")) return "Surxondaryo viloyati";

  return regionStr.charAt(0).toUpperCase() + regionStr.slice(1).toLowerCase();
}

/* ─── Supabase Image Helper ──────────────────────────── */
function imgUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url;
}

/* ─── Extended Application Interface ────────────────── */

interface ExtendedApplication extends Application {
  phone?: string;
  gallery?: string[];
  location?: string;
  full_name?: string;
}


/* ─── Local Premium Participants (Mock/Static Data) ─── */
// All participants are migrated to Supabase database now.
const LOCAL_PARTICIPANTS: ExtendedApplication[] = [];

/* ─── Compact Participant Card ─────────────────────── */

const getCategoryLabel = (cat: string, translateFn: (k: any) => string) => {
  if (cat === "business") return translateFn("participants.business");
  if (cat === "startup") return translateFn("participants.startup");
  return cat;
};

const ParticipantCard = ({
  app,
  onClick
}: {
  app: ExtendedApplication;
  onClick: () => void;
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isLight = theme === "light";

  // Determine gender for card accent coloring
  const gender = (app.gender || "male").toLowerCase();
  
  // Theme styling based on gender
  const isFemale = gender === "female";
  const hoverBorderColor = isFemale ? "hover:border-[#FF5B84]/40" : "hover:border-[#00A8FF]/40";
  const accentTextColor = isFemale ? "text-[#FF5B84]" : "text-[#00A8FF]";
  const actionStripHover = isFemale ? "group-hover:text-[#FF5B84]" : "group-hover:text-[#00A8FF]";
  const gradientStart = isFemale ? "from-[#FF5B84]/15" : "from-[#00A8FF]/15";

  return (
    <article
      onClick={onClick}
      className={`group relative rounded-xl overflow-hidden border transition-[transform,border-color] duration-300 ${hoverBorderColor} hover:-translate-y-0.5 ${
        isLight
          ? "bg-white border-slate-200 shadow-md shadow-slate-200/50"
          : "bg-[#0a0a0c]/95 sm:bg-[#0a0a0c]/80 border-white/5"
      } sm:backdrop-blur-sm cursor-pointer shadow-md flex flex-col justify-between`}
    >
      <div>
        {/* Aspect 3/4 Portrait Photo */}
        {(() => {
          const displayPhoto = app.avatar_url || app.product_image_url || (app.gallery && app.gallery.length > 0 ? app.gallery[0] : null);
          return (
            <div className={`relative aspect-[3/4] overflow-hidden ${isLight ? "bg-slate-100" : "bg-zinc-950"}`}>
              {displayPhoto ? (
                <img
                  src={imgUrl(displayPhoto)}
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
                  className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${
                    isLight ? "bg-white/80 border border-slate-200/60" : "bg-black/60 border border-white/10"
                  } ${accentTextColor}`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  {getCategoryLabel(app.category, t)}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Text Area */}
        <div className="p-2.5 sm:p-3">
          {/* Region */}
          <div
            className={`text-[8px] sm:text-[9px] uppercase tracking-wider mb-1 ${
              isLight ? "text-slate-400" : "text-white/40"
            }`}
            style={{ fontFamily: "var(--font-button)" }}
          >
            {app.region}
          </div>
          {/* Founder Name */}
          <h2
            className={`text-base sm:text-xl font-bold leading-tight uppercase truncate ${
              isLight ? "text-slate-900" : "text-white"
            }`}
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
      <div
        className={`px-2.5 sm:px-3 py-2 sm:py-2.5 border-t flex items-center justify-between text-[9px] sm:text-[10px] font-semibold transition-colors duration-200 ${
          isLight ? "border-slate-100 text-slate-400" : "border-white/5 text-white/40"
        } ${actionStripHover}`}
        style={{ fontFamily: "var(--font-button)" }}
      >
        <span>{t("participants.moreInfo")}</span>
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
  const { t } = useLanguage();
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
  const gender = (app.gender || "male").toLowerCase();
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
        className={`relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border p-4 sm:p-8 md:p-10 shadow-2xl z-10 no-scrollbar animate-modal-in flex flex-col gap-4 sm:gap-6 ${
          isLight ? "border-slate-200" : "border-white/10"
        }`}
        style={{
          backgroundImage: isLight
            ? `linear-gradient(to bottom, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.95) 100%), url(${bgImage})`
            : `linear-gradient(to bottom, rgba(3, 3, 5, 0.55) 0%, rgba(3, 3, 5, 0.75) 100%), url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full border transition-all cursor-pointer z-20 ${
            isLight
              ? "border-slate-200 bg-white/80 text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300"
              : "border-white/10 bg-black/60 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20"
          }`}
        >
          <X size={18} />
        </button>

        {/* ── Grid Layout ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Portrait image + info boxes */}
          <div className="md:col-span-4 flex flex-col gap-5">
            {/* Portrait Image (Aspect 3/4) */}
            {(() => {
              const modalPhoto = app.avatar_url || app.product_image_url || (galleryImages.length > 0 ? galleryImages[0] : null);
              return (
                <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden w-full max-w-[280px] mx-auto md:max-w-none border ${
                  isLight ? "border-slate-200 bg-slate-100" : "border-white/10 bg-zinc-950"
                }`}>
                  {modalPhoto ? (
                    <img
                      src={imgUrl(modalPhoto)}
                      alt={app.full_name || app.brand_name}
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30">
                      Rasm mavjud emas
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Quick Stats / Info Sheet */}
            <div
              className={`rounded-2xl border p-5 flex flex-col gap-4 text-xs backdrop-blur-md ${
                isLight ? "border-slate-200 bg-white/60" : "border-white/10 bg-zinc-950/60"
              }`}
              style={{ fontFamily: "var(--font-button)" }}
            >
              <div className={`flex justify-between items-center pb-2 border-b ${isLight ? "border-slate-100" : "border-white/5"}`}>
                <span className={isLight ? "text-slate-500" : "text-white/40"}>{t("participants.ageLabel")}</span>
                <span className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{app.age} {t("participants.ageSuffix")}</span>
              </div>
              <div className={`flex justify-between items-center pb-2 border-b ${isLight ? "border-slate-100" : "border-white/5"}`}>
                <span className={isLight ? "text-slate-500" : "text-white/40"}>{t("participants.brandLabel")}</span>
                <span className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{app.brand_name || "-"}</span>
              </div>
              <div className={`flex justify-between items-start pb-2 border-b ${isLight ? "border-slate-100" : "border-white/5"}`}>
                <span className={`shrink-0 ${isLight ? "text-slate-500" : "text-white/40"}`}>{t("participants.regionLabel")}</span>
                <span className={`font-semibold text-right ml-4 ${isLight ? "text-slate-900" : "text-white"}`}>
                  {app.region} {app.location ? `, ${app.location}` : ""}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isLight ? "text-slate-500" : "text-white/40"}>{t("participants.legalLabel")}</span>
                <span className={`font-semibold ${isLight ? "text-slate-700" : "text-white/80"}`}>{app.legal_name || "-"}</span>
              </div>
            </div>

            {/* Potential Impact Box */}
            {app.potential_impact && app.potential_impact.length > 0 && (
              <div
                className={`rounded-2xl border p-5 flex flex-col gap-3 text-xs backdrop-blur-md ${
                  isLight ? "border-slate-200 bg-white/60" : "border-white/10 bg-zinc-950/60"
                }`}
                style={{ fontFamily: "var(--font-button)" }}
              >
                <h3
                  className={`text-[10px] font-bold uppercase tracking-wider border-b pb-2 ${
                    isLight ? "text-emerald-600 border-slate-100" : "text-emerald-400 border-white/5"
                  }`}
                >
                  {t("participants.potentialImpact")}
                </h3>
                <ul className="flex flex-col gap-2">
                  {app.potential_impact.map((impact, idx) => (
                    <li key={idx} className={`flex gap-2 leading-relaxed ${isLight ? "text-slate-600 font-medium" : "text-white/70"}`}>
                      <span className={`shrink-0 mt-0.5 ${isLight ? "text-emerald-600" : "text-emerald-400"}`}>•</span>
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
            <div className={`flex flex-col gap-1 border-b pb-3 ${isLight ? "border-slate-100" : "border-white/5"}`}>
              <div
                className={`text-xs uppercase tracking-widest font-bold ${isLight ? "text-slate-400" : "text-white/40"}`}
                style={{ fontFamily: "var(--font-button)" }}
              >
                {app.region}
              </div>
              <h2
                className={`text-3xl sm:text-5xl md:text-6xl font-black leading-tight uppercase tracking-tight ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
                style={{ fontFamily: "var(--font-zuume)" }}
              >
                {app.full_name || app.brand_name}
              </h2>
              <div className={`text-lg sm:text-xl font-bold ${accentTextColor} uppercase mt-1`} style={{ fontFamily: "var(--font-button)" }}>
                {app.brand_name}
              </div>
            </div>

            {/* Biznes Haqida */}
            <div
              className={`rounded-2xl border p-5 transition-all duration-300 backdrop-blur-md ${accentBorderColor} ${
                isLight ? "border-slate-200 bg-white/60" : "border-white/10 bg-zinc-950/60"
              }`}
            >
              <h3 className={`text-[10px] font-bold uppercase tracking-[0.15em] ${accentTextColor} mb-3`} style={{ fontFamily: "var(--font-button)" }}>
                {t("participants.aboutBusiness")}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? "text-slate-700 font-medium" : "text-white/85"}`}>
                {cleanDescription}
              </p>
            </div>

            {/* Goals */}
            {app.goals && app.goals.length > 0 && (
              <div
                className={`rounded-2xl border p-5 transition-all duration-300 backdrop-blur-md ${accentBorderColor} ${
                  isLight ? "border-slate-200 bg-white/60" : "border-white/10 bg-zinc-950/60"
                }`}
              >
                <h3 className={`text-[10px] font-bold uppercase tracking-[0.15em] ${accentTextColor} mb-3`} style={{ fontFamily: "var(--font-button)" }}>
                  {t("participants.goals")}
                </h3>
                <ul className="flex flex-col gap-3">
                  {app.goals.map((goal, idx) => (
                    <li
                      key={idx}
                      className={`flex gap-2.5 text-xs sm:text-sm leading-relaxed items-start ${
                        isLight ? "text-slate-650 font-medium" : "text-white/70"
                      }`}
                    >
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
                  {t("participants.galleryTitle")}
                </h3>
                
                {/* Featured Large Image Box */}
                <div 
                  onClick={() => setActiveImage(galleryImages[activeGalleryIdx])}
                  className={`relative aspect-video w-full rounded-2xl overflow-hidden border shadow-lg cursor-pointer group transition-colors duration-300 hover:border-[#00A8FF]/30 ${
                    isLight ? "border-slate-200 bg-slate-100" : "border-white/15 bg-zinc-950/80"
                  }`}
                >
                  <img
                    src={imgUrl(galleryImages[activeGalleryIdx])}
                    alt={`Showcase frame ${activeGalleryIdx + 1}`}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <span className="px-3.5 py-2 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white uppercase tracking-wider">
                      {t("participants.clickToZoom")}
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
                          : isLight
                            ? "border-slate-200 bg-slate-100 hover:border-slate-350 hover:scale-102"
                            : "border-white/10 bg-zinc-950/40 hover:border-white/20 hover:scale-102"
                      }`}
                    >
                      <img
                        src={imgUrl(img)}
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
            src={imgUrl(activeImage)}
            alt="Presentation slide expanded"
            decoding="async"
            className={`relative max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border ${
              isLight ? "border-slate-200" : "border-white/10"
            }`}
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
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isLight = theme === "light";

  const [applications, setApplications] = useState<ExtendedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ExtendedApplication | null>(null);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data, error } = await supabase
          .from("applications")
          .select("*, profiles(full_name, phone_number)")
          .in("status", ["under_review", "approved"])
          .eq("is_deleted", false)          // exclude soft-deleted applications
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching participants from Supabase:", error);
          setLoading(false);
          return;
        }

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
          
          const isFemaleName = (name: string): boolean => {
            if (!name) return false;
            const parts = name.toLowerCase().split(/[\s'’‘`]+/);
            return parts.some(part => 
              part.endsWith("ova") || 
              part.endsWith("eva") || 
              part.endsWith("yeva") || 
              part.endsWith("ina") || 
              part.endsWith("qizi") || 
              part.endsWith("kyzy") || 
              part.endsWith("gizi")
            );
          };

          const gender = genderMatch 
            ? (genderMatch[1].toLowerCase() as "male" | "female") 
            : (app.gender === "female" || isFemaleName(full_name) ? "female" : "male");
          const phone = phoneMatch ? phoneMatch[1].trim() : (app.profiles?.phone_number || app.phone || "");

          return {
            ...app,
            region: normalizeRegionName(app.region),
            full_name,
            gender,
            phone,
            gallery
          };
        });
        
        // Combine static premium local participants with Supabase database applications
        setApplications([...LOCAL_PARTICIPANTS, ...dbApps]);
        setLoading(false);
      } catch (err) {
        console.error("Unhandled error fetching participants:", err);
        setLoading(false);
      }
    };

    fetchApps();

    // Real-time subscription: auto-refresh when admin approves/changes application status
    const channel = supabase
      .channel("ishtirokchilar-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        () => fetchApps()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  
  // Weak device optimization: pagination count
  const [visibleCount, setVisibleCount] = useState(12);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [regionFilter, searchQuery, categoryFilter]);

  // Unique regions with participant counts for the viloyat filter
  const regionCounts = applications.reduce<Record<string, number>>((acc, a) => {
    const reg = a.region || "Toshkent shahri";
    acc[reg] = (acc[reg] ?? 0) + 1;
    return acc;
  }, {});
  const uniqueRegions = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]).map(([r]) => r);

  const filtered = applications.filter((a) => {
    // Apply search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (a.full_name || "").toLowerCase().includes(q);
      const brandMatch = (a.brand_name || "").toLowerCase().includes(q);
      if (!nameMatch && !brandMatch) return false;
    }
    // Apply category filter
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    // Apply region filter
    if (regionFilter !== "all" && a.region !== regionFilter) return false;
    return true;
  });

  // Paginated/Sliced subset to display
  const displayed = filtered.slice(0, visibleCount);

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-300`}
      style={{ background: isLight ? "#f8fafc" : "#000001" }}
      data-lenis-prevent
    >
      {/* Background Image overlay matching the Hero page style */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35 pointer-events-none scale-105"
        style={{
          backgroundImage: `url(${isLight ? HeroLightImage : HeroImage})`,
        }}
      />
      <div className={`absolute inset-0 bg-gradient-to-b ${
        isLight
          ? "from-slate-50/10 via-slate-50/50 to-slate-50"
          : "from-[#000001]/10 via-[#000001]/50 to-[#000001]"
      } pointer-events-none`} />

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Header */}
        <div className={`border-b sticky top-0 z-10 backdrop-blur-sm transition-colors duration-300 ${
          isLight ? "border-slate-200 bg-white/80" : "border-white/5 bg-black/80"
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                isLight ? "border-slate-200 group-hover:border-slate-350" : "border-white/10 group-hover:border-white/20"
              }`}>
                <ArrowRight size={14} className={isLight ? "text-slate-400 rotate-180" : "text-white/40 rotate-180"} />
              </div>
              <div className={`flex items-center border rounded-[10px] px-3 py-2.5 overflow-hidden transition-colors ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-[#111111] border-white/10"
              }`}>
                <img src={isLight ? logoBlue : logo} alt="Logo" className="h-7 w-auto object-contain" />
              </div>
            </Link>
            <Link
              to="/auth/login"
              className={`hidden sm:flex items-center gap-2 text-xs border rounded-xl px-4 py-2 transition-all ${
                isLight
                  ? "border-slate-200 text-slate-650 hover:text-slate-900 hover:border-slate-350 bg-white"
                  : "border-white/10 text-white/60 hover:text-white hover:border-white/20"
              }`}
            >
              {t("participants.apply")} <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
          <p
            className="text-xs text-[#00A8FF] tracking-[0.2em] uppercase mb-3 font-semibold"
            style={{ fontFamily: "var(--font-button)" }}
          >
            {t("participants.label")}
          </p>
          <h1
            className={`text-4xl sm:text-6xl md:text-7xl font-bold mb-4 leading-none ${
              isLight ? "text-slate-900" : "text-white"
            }`}
            style={{ fontFamily: "var(--font-zuume)" }}
          >
            {t("participants.title")}
          </h1>
          <p className={`text-sm max-w-lg ${isLight ? "text-slate-500" : "text-white/40"}`} style={{ fontFamily: "var(--font-button)" }}>
            {t("participants.subtitle")}
          </p>

          {/* Redesigned User-Friendly Filter Control Bar */}
          {!loading && applications.length > 0 && (
            <div className="mt-8 flex flex-col gap-4">
              <div className={`p-3 sm:p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 transition-colors duration-300 ${
                isLight ? "border-slate-200 bg-white/80 shadow-slate-200/50" : "border-white/10 bg-[#0a0a0c]/80"
              }`}>
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-white/40"}`} />
                  <input
                    type="text"
                    placeholder={t("participants.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-9 py-2.5 rounded-xl border outline-none transition-all font-medium text-xs ${
                      isLight
                        ? "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-[#00A8FF]/60 focus:bg-white"
                        : "border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#00A8FF]/60 focus:bg-white/10"
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${
                        isLight ? "text-slate-400 hover:text-slate-700" : "text-white/40 hover:text-white"
                      }`}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Category Switcher */}
                <div className={`flex items-center p-1 rounded-xl border shrink-0 self-start md:self-auto transition-colors ${
                  isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/5"
                }`}>
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      categoryFilter === "all"
                        ? "bg-[#00A8FF] text-white shadow-md"
                        : isLight ? "text-slate-500 hover:text-slate-900" : "text-white/60 hover:text-white"
                    }`}
                    style={{ fontFamily: "var(--font-button)" }}
                  >
                    {t("participants.all")}
                  </button>
                  <button
                    onClick={() => setCategoryFilter("business")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      categoryFilter === "business"
                        ? "bg-[#00A8FF] text-white shadow-md"
                        : isLight ? "text-slate-500 hover:text-slate-900" : "text-white/60 hover:text-white"
                    }`}
                    style={{ fontFamily: "var(--font-button)" }}
                  >
                    {t("participants.business")}
                  </button>
                  <button
                    onClick={() => setCategoryFilter("startup")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      categoryFilter === "startup"
                        ? "bg-[#00A8FF] text-white shadow-md"
                        : isLight ? "text-slate-500 hover:text-slate-900" : "text-white/60 hover:text-white"
                    }`}
                    style={{ fontFamily: "var(--font-button)" }}
                  >
                    {t("participants.startup")}
                  </button>
                </div>

                {/* Viloyat Select Dropdown */}
                <div className="relative shrink-0 min-w-[220px]">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00A8FF] pointer-events-none" />
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className={`w-full pl-9 pr-8 py-2.5 rounded-xl border outline-none cursor-pointer focus:border-[#00A8FF]/60 appearance-none font-bold tracking-wide transition-colors ${
                      isLight
                        ? "border-slate-200 bg-white text-slate-900"
                        : "border-white/10 bg-[#0a0a0c] text-white"
                    }`}
                  >
                    <option value="all">{t("participants.allRegions")} ({applications.length})</option>
                    {uniqueRegions.map((region) => (
                      <option key={region} value={region}>
                        {region} ({regionCounts[region]})
                      </option>
                    ))}
                  </select>
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] ${
                    isLight ? "text-slate-400" : "text-white/40"
                  }`}>
                    ▼
                  </div>
                </div>
              </div>

              {/* Filter Results Status Bar */}
              <div className="flex items-center justify-between mt-1 text-xs">
                <div className={`font-mono ${isLight ? "text-slate-400" : "text-white/40"}`}>
                  <span>
                    {filtered.length} {t("participants.countSuffix")}
                  </span>
                </div>

                {(searchQuery || categoryFilter !== "all" || regionFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                      setRegionFilter("all");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    {t("participants.clear")}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className={`w-8 h-8 border-2 rounded-full animate-spin ${
                isLight ? "border-slate-200 border-t-[#00A8FF]" : "border-white/20 border-t-[#00A8FF]"
              }`} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-32">
              <p className={`text-4xl mb-4 font-bold ${isLight ? "text-slate-200" : "text-white/10"}`} style={{ fontFamily: "var(--font-zuume)" }}>
                {t("participants.emptyTitle")}
              </p>
              <p className={`text-sm ${isLight ? "text-slate-400" : "text-white/30"}`}>
                {t("participants.emptyDesc")}
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
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider border hover:border-[#00A8FF]/40 hover:scale-102 cursor-pointer shadow-lg backdrop-blur-md transition-all duration-300 ${
                      isLight
                        ? "border-slate-200 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 shadow-slate-200/50"
                        : "border-white/10 text-white/70 hover:text-white bg-[#0a0a0c]/85 hover:bg-[#0a0a0c]"
                    }`}
                    style={{ fontFamily: "var(--font-button)" }}
                  >
                    <span>{t("participants.loadMore")}</span>
                    <ArrowRight size={12} className="rotate-90 text-[#00A8FF] animate-bounce" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer strip */}
        <div className={`border-t py-8 transition-colors ${isLight ? "border-slate-200" : "border-white/5"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <img src={isLight ? logoBlue : logo} alt="Logo" className="h-5 w-auto opacity-30" />
            <p className={`text-xs ${isLight ? "text-slate-400" : "text-white/20"}`} style={{ fontFamily: "var(--font-button)" }}>
              © {new Date().getFullYear()} {t("participants.label")}
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
