import { ArrowRight } from "lucide-react";
import Container from "../components/Container";
import bgVideo from "../assets/video/10mln.mp4";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";

interface CTAProps {
  onApply?: () => void;
}

const CTA = ({ onApply }: CTAProps) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isLight = theme === "light";

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Full background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={bgVideo} type="video/mp4" />
      </video>

      {/* Light mode video overlay only if light */}
      {isLight && (
        <div className="absolute inset-0 bg-white/70 pointer-events-none" />
      )}

      {/* Content */}
      <Container className="relative z-10">
        <div className="flex justify-center">
          <div
            className={`rounded-3xl px-8 sm:px-14 py-8 sm:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 w-full max-w-5xl backdrop-blur-[50px] border transition-colors duration-300 ${
              isLight
                ? "bg-white/80 border-slate-200 shadow-xl text-slate-900"
                : "border-white/15 text-white"
            }`}
            style={{
              background: isLight ? undefined : "rgba(0,0,0,0.1)",
            }}
          >
            {/* Left - Text */}
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
                <span style={{ color: isLight ? "#0F172A" : "#FFFFFF" }}>
                  {t("cta.title1")}
                </span>
                <br />
                <span style={{ color: "#00A8FF" }}>{t("cta.title2")}</span>
              </h2>
            </div>

            {/* Right - Button */}
            <button
              onClick={onApply}
              className="flex items-stretch shrink-0 cursor-pointer group"
            >
              <div
                className={`px-8 sm:px-10 py-4 flex items-center rounded-l-2xl border-2 border-r-0 text-base sm:text-lg font-medium transition-all duration-300 ${
                  isLight
                    ? "border-[#00A8FF] bg-[#00A8FF] text-white group-hover:bg-[#0088cc] group-hover:border-[#0088cc]"
                    : "border-white/30 group-hover:bg-[#00A8FF] group-hover:border-white/50"
                }`}
                style={{ fontFamily: "var(--font-button)" }}
              >
                {t("cta.button")}
              </div>
              <div
                className={`w-14 rounded-r-2xl border-2 flex items-center justify-center transition-all duration-300 ${
                  isLight
                    ? "border-[#00A8FF] bg-[#00A8FF] text-white group-hover:bg-[#0088cc] group-hover:border-[#0088cc]"
                    : "border-white/30 group-hover:bg-[#00A8FF] group-hover:border-white/50"
                }`}
              >
                <ArrowRight
                  size={22}
                  strokeWidth={2.5}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </div>
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTA;
