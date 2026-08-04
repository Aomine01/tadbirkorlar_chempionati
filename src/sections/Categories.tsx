import { useNavigate } from "react-router-dom";
import { Lightbulb, Building2, Rocket } from "lucide-react";
import Container from "../components/Container";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import type { TranslationKey } from "../lib/translations";

const cardDefs: { key: string; icon: typeof Building2; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { key: "business", icon: Building2, titleKey: "cat.biz.title", descKey: "cat.biz.desc" },
  { key: "startup", icon: Rocket, titleKey: "cat.startup.title", descKey: "cat.startup.desc" },
  { key: "ideas", icon: Lightbulb, titleKey: "cat.idea.title", descKey: "cat.idea.desc" },
];

const Categories = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isLight = theme === "light";

  return (
    <section id="categories" className="relative py-16 sm:py-24 transition-colors duration-300">
      <Container>
        <div className="text-center mb-10 sm:mb-14">
          <span
            className="text-sm font-medium tracking-wide uppercase mb-4 block"
            style={{ color: "#00a8ff", fontFamily: "var(--font-button)" }}
          >
            {t("cat.label")}
          </span>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl uppercase lg:text-5xl font-bold leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            {t("cat.heading").split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 max-w-5xl mx-auto">
          {cardDefs.map(({ key, icon: Icon, titleKey, descKey }) => (
            <div
              key={key}
              className={`flex-1 flex flex-col gap-4 rounded-xl px-5 sm:px-6 py-5 sm:py-6 border transition-all duration-300 ${
                isLight
                  ? "bg-white border-slate-200 shadow-md shadow-slate-200/50 hover:border-blue-400/50"
                  : "bg-[#111] border-white/10"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                isLight ? "bg-blue-50 text-[#00A8FF]" : "bg-white/10 text-white/70"
              }`}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <h3
                  className={`text-lg sm:text-xl font-bold mb-3 ${isLight ? "text-slate-900" : "text-white"}`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {t(titleKey)}
                </h3>
                <p
                  className={`text-xs sm:text-sm leading-relaxed ${isLight ? "text-slate-600 font-medium" : "text-white/60"}`}
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  {t(descKey)}
                </p>
              </div>
              <button
                onClick={() => navigate(`/forms/${key}`)}
                className={`w-full py-2.5 rounded-lg text-sm font-medium border transition-all duration-300 cursor-pointer ${
                  isLight
                    ? "bg-[#00A8FF] text-white border-[#00A8FF] hover:bg-[#0088cc]"
                    : "bg-white/5 border-white/10 hover:bg-[#00A8FF]/20 hover:border-[#00A8FF]/40 hover:text-[#00A8FF] text-white/80"
                }`}
                style={{ fontFamily: "var(--font-button)" }}
              >
                {t("cat.button")}
              </button>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Categories;
