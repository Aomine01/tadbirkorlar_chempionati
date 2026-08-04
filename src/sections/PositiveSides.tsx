import ImageOne from "../assets/positive-sides/img-one.png";
import ImageTwo from "../assets/positive-sides/img-two.png";
import ImageThird from "../assets/positive-sides/img-three.png";
import ImageFour from "../assets/positive-sides/img-four.png";
import ImageFive from "../assets/positive-sides/img-five.png";
import ImageSix from "../assets/positive-sides/img-six.png";
import HeroImage from "../assets/img/hero-image.png";
import HeroLightImage from "../assets/imglight/herolight.png";
import Container from "../components/Container";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import type { TranslationKey } from "../lib/translations";

const cardImages = [ImageOne, ImageTwo, ImageThird, ImageFour, ImageFive, ImageSix];
const cardKeys: { titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { titleKey: "positive.card1.title", descKey: "positive.card1.desc" },
  { titleKey: "positive.card2.title", descKey: "positive.card2.desc" },
  { titleKey: "positive.card3.title", descKey: "positive.card3.desc" },
  { titleKey: "positive.card4.title", descKey: "positive.card4.desc" },
  { titleKey: "positive.card5.title", descKey: "positive.card5.desc" },
  { titleKey: "positive.card6.title", descKey: "positive.card6.desc" },
];

const PositiveSides = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isLight = theme === "light";
  const bgImg = isLight ? HeroLightImage : HeroImage;

  return (
    <section id="why" className="relative w-full overflow-hidden transition-all duration-300">
      {/* Background image */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          backgroundImage: `url(${bgImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Light / Dark overlay */}
      <div className={`absolute inset-0 ${isLight ? "bg-white/80" : "bg-black/40"}`} />

      {/* Top fade-in */}
      <div
        className="absolute top-0 left-0 w-full h-40 pointer-events-none z-2"
        style={{
          background: isLight
            ? "linear-gradient(to bottom, #f8fafc 0%, transparent 100%)"
            : "linear-gradient(to bottom, #000001 0%, transparent 100%)",
        }}
      />

      {/* Bottom fade-out */}
      <div
        className="absolute bottom-0 left-0 w-full h-40 pointer-events-none z-1"
        style={{
          background: isLight
            ? "linear-gradient(to top, #f8fafc 0%, transparent 100%)"
            : "linear-gradient(to top, #000001 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <Container className="relative z-10 py-20 sm:py-28">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <span
            className="text-sm font-medium tracking-wide uppercase mb-4 block"
            style={{
              color: "#00a8ff",
              fontFamily: "var(--font-button)",
            }}
          >
            {t("positive.label")}
          </span>
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            {t("positive.heading").split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {cardKeys.map(({ titleKey, descKey }, i) => (
            <div
              key={i}
              className={`rounded-2xl overflow-hidden backdrop-blur-[100px] border transition-all duration-300 flex flex-col min-h-[180px] md:min-h-[290px] ${
                isLight
                  ? "bg-white/85 border-slate-200 hover:border-blue-400/50 shadow-md shadow-slate-200/50"
                  : "bg-gradient-to-b from-[#141414]/80 to-[#050505]/80 border-white/10 hover:border-white/20"
              }`}
            >
              {/* Card image */}
              <div className="relative h-15.5 overflow-hidden shrink-0">
                <img
                  src={cardImages[i]}
                  alt={t(titleKey)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Card content */}
              <div className="px-5 pt-5 pb-6 flex flex-col flex-1">
                <h3
                  className={`text-2xl sm:text-3xl font-bold leading-tight ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {t(titleKey)}
                </h3>
                <p
                  className={`text-xs sm:text-sm leading-relaxed mt-auto pt-4 ${
                    isLight ? "text-slate-600 font-medium" : "text-white/60"
                  }`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  {t(descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default PositiveSides;
