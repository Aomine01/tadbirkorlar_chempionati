import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Application } from "../types/database";
import logo from "../assets/logos/white full.png";
import HeroImage from "../assets/img/hero-image.png";
import largeCardMen from "../assets/img/largecardmen.png";
import largeCardFemale from "../assets/img/largcardfemale.png";

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

const LOCAL_PARTICIPANTS: ExtendedApplication[] = [
  {
    id: "abbasov-abdullo",
    user_id: "local-user-1",
    category: "business",
    age: 33,
    region: "SAMARQAND VILOYATI",
    location: "Samarqand shahri",
    brand_name: "BERT AGRO",
    full_name: "Abbasov Abdullo",
    legal_name: "BERT AGRO LLC",
    gender: "male",
    business_description: "Qishloq xo'jaligida foydalaniladigan yerlar uchun oziqaviy va nitratlardan xoli organik-mineral o'g'it ishlab chiqarish bilan shug'ullanadi. Korxona ekologik toza va samarali mahsulot ishlab chiqarishga ixtisoslashgan. [Gender: male]",
    goals: [
      "Organik-mineral o'g'it ishlab chiqarish hajmini kengaytirish.",
      "Ishlab chiqarish quvvatini oshirish va zamonaviy uskunalar bilan jihozlash.",
      "Mahsulot sifatini yanada yaxshilash hamda bozor talabini qondirish.",
      "Yiliga 5 000 tonna tayyor mahsulot ishlab chiqarish quvvatiga erishish.",
      "Korxona faoliyatini kengaytirib, yangi hamkorlar va mijozlar sonini oshirish."
    ],
    potential_impact: [
      "Ekologik toza organik-mineral o'g'itlar ishlab chiqarish rivojlantiriladi.",
      "Qishloq xo'jaligi hosildorligi va tuproq unumdorligi oshiriladi.",
      "Mahalliy ishlab chiqarish quvvatlari kengaytiriladi.",
      "Yangi ish o'rinlari yaratiladi."
    ],
    avatar_url: "/users/Abbasov Abdullo/Abbasov Abdullo.png",
    product_image_url: "/users/Abbasov Abdullo/Abbasov Abdullo.png",
    gallery: [
      "/users/Abbasov Abdullo/Frame 1597883717.png",
      "/users/Abbasov Abdullo/Frame 1597883722.png",
      "/users/Abbasov Abdullo/Frame 1597883723.png",
      "/users/Abbasov Abdullo/Frame 1597883741.png"
    ],
    phone: "+998 99 371 13 37",
    status: "approved",
    created_at: "2026-07-07T12:00:00Z",
    updated_at: "2026-07-07T12:00:00Z"
  }
];

/* ─── Compact Participant Card ─────────────────────── */

const ParticipantCard = ({
  app,
  onClick
}: {
  app: ExtendedApplication;
  onClick: () => void;
}) => {
  return (
    <article
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden border border-white/5 transition-all duration-300 hover:border-[#00A8FF]/40 hover:-translate-y-0.5 bg-[#0a0a0c]/80 backdrop-blur-sm cursor-pointer shadow-md flex flex-col justify-between"
    >
      <div>
        {/* Aspect 3/4 Portrait Photo */}
        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-950">
          {app.product_image_url ? (
            <img
              src={app.product_image_url}
              alt={app.full_name || app.brand_name}
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300 scale-100 group-hover:scale-103 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A8FF]/10 to-transparent" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10">
            <span
              className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider backdrop-blur-md bg-black/60 border border-white/10 text-[#00A8FF]"
              style={{ fontFamily: "var(--font-button)" }}
            >
              {CATEGORY_LABELS[app.category] ?? app.category}
            </span>
          </div>
        </div>

        {/* Text Area */}
        <div className="p-3">
          {/* Region */}
          <div className="text-[9px] uppercase tracking-wider text-white/40 mb-1" style={{ fontFamily: "var(--font-button)" }}>
            {app.region}
          </div>
          {/* Founder Name */}
          <h2
            className="text-xl font-bold text-white leading-tight uppercase truncate"
            style={{ fontFamily: "var(--font-zuume)" }}
          >
            {app.full_name || app.brand_name}
          </h2>
          {/* Brand/Business Name Subtitle */}
          <div className="text-xs text-[#00A8FF] font-medium truncate mt-0.5" style={{ fontFamily: "var(--font-button)" }}>
            {app.brand_name}
          </div>
        </div>
      </div>

      {/* Action Strip */}
      <div className="px-3 pb-3 pt-1 border-t border-white/5 flex items-center justify-between text-[10px] font-semibold text-white/40 group-hover:text-[#00A8FF] transition-colors duration-200" style={{ fontFamily: "var(--font-button)" }}>
        <span>Ko'proq ma'lumot</span>
        <ArrowRight size={10} className="transform translate-x-0 group-hover:translate-x-0.5 transition-transform" />
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

  // Parse gender (supports both native db column and fallback tag)
  const rawDescription = app.business_description || "";
  const genderMatch = rawDescription.match(/\[Gender:\s*(male|female)\]/i);
  const gender = app.gender || (genderMatch ? genderMatch[1].toLowerCase() as "male" | "female" : "male");
  const cleanDescription = rawDescription.replace(/\[Gender:\s*(male|female)\]/i, "").trim();

  const bgImage = gender === "female" ? largeCardFemale : largeCardMen;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in" data-lenis-prevent>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card with Gender Background */}
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl z-10 no-scrollbar animate-modal-in flex flex-col gap-6"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(3, 3, 5, 0.45) 0%, rgba(3, 3, 5, 0.6) 100%), url(${bgImage})`,
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

        {/* ── Grid Layout matching the reference card sheet ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Portrait image + info boxes */}
          <div className="md:col-span-4 flex flex-col gap-5">
            {/* Portrait Image (Aspect 3/4) */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-zinc-950">
              <img
                src={app.product_image_url || ""}
                alt={app.full_name || app.brand_name}
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
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-white/40">Telefon:</span>
                  <a href={`tel:${app.phone}`} className="font-semibold text-[#00A8FF] hover:underline">
                    {app.phone}
                  </a>
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

          {/* Right Column: giant name, brand name, biz overview, goals, and frames gallery */}
          <div className="md:col-span-8 flex flex-col gap-6">
            
            {/* Header Identity Block */}
            <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
              <div className="text-white/40 text-xs uppercase tracking-widest font-bold" style={{ fontFamily: "var(--font-button)" }}>
                {app.region}
              </div>
              <h2
                className="text-4xl sm:text-6xl font-black text-white leading-none uppercase tracking-tight"
                style={{ fontFamily: "var(--font-zuume)" }}
              >
                {app.full_name || app.brand_name}
              </h2>
              <div className="text-xl font-bold text-[#00A8FF] uppercase mt-1" style={{ fontFamily: "var(--font-button)" }}>
                {app.brand_name}
              </div>
            </div>

            {/* Biznes Haqida */}
            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md p-5 hover:border-[#00A8FF]/20 transition-all duration-300">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#00A8FF] mb-3" style={{ fontFamily: "var(--font-button)" }}>
                Biznes Haqida
              </h3>
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                {cleanDescription}
              </p>
            </div>

            {/* Goals */}
            {app.goals && app.goals.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md p-5 hover:border-[#00A8FF]/20 transition-all duration-300">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#00A8FF] mb-3" style={{ fontFamily: "var(--font-button)" }}>
                  Maqsadlari
                </h3>
                <ul className="flex flex-col gap-3">
                  {app.goals.map((goal, idx) => (
                    <li key={idx} className="flex gap-2.5 text-xs sm:text-sm text-white/70 leading-relaxed items-start">
                      <span className="flex items-center justify-center w-5 h-5 rounded bg-[#00A8FF]/10 text-[#00A8FF] text-[10px] font-bold shrink-0 mt-0.5">
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
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#00A8FF]" style={{ fontFamily: "var(--font-button)" }}>
                  Loyihadan Lavhalar (Taqdimot Sahifalari)
                </h3>
                
                {/* Featured Large Image Box */}
                <div 
                  onClick={() => setActiveImage(galleryImages[activeGalleryIdx])}
                  className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/15 bg-zinc-950/80 shadow-lg cursor-pointer group hover:border-[#00A8FF]/30 transition-colors duration-300"
                >
                  <img
                    src={galleryImages[activeGalleryIdx]}
                    alt={`Showcase frame ${activeGalleryIdx + 1}`}
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
                          ? "border-[#00A8FF] ring-2 ring-[#00A8FF]/20 scale-102"
                          : "border-white/10 bg-zinc-950/40 hover:border-white/20 hover:scale-102"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${i + 1}`}
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
            src={activeImage}
            alt="Presentation slide expanded"
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

  useEffect(() => {
    supabase
      .from("applications")
      .select("*")
      .eq("status", "approved")
      .eq("is_deleted", false)          // exclude soft-deleted applications
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const dbApps = data ?? [];
        // Combine static premium local participants with Supabase database applications
        setApplications([...LOCAL_PARTICIPANTS, ...dbApps]);
        setLoading(false);
      });
  }, []);

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
            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((app) => (
                <ParticipantCard
                  key={app.id}
                  app={app}
                  onClick={() => setSelectedApp(app)}
                />
              ))}
            </div>
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

