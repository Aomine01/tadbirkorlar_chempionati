import { useEffect, useRef, useState } from "react";
import Container from "../components/Container";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { ExportIcon, FlagIcon, MedalStarIcon, StatusUpIcon } from "../assets";

const Roadmap = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const { theme } = useTheme();
  const { t } = useLanguage();

  const isLight = theme === "light";

  const steps = [
    { icon: ExportIcon, titleKey: "roadmap.step1.title" as const, subtextKey: "roadmap.step1.subtext" as const },
    { icon: StatusUpIcon, titleKey: "roadmap.step2.title" as const, subtextKey: "roadmap.step2.subtext" as const },
    { icon: StatusUpIcon, titleKey: "roadmap.step3.title" as const, subtextKey: "roadmap.step3.subtext" as const },
    { icon: FlagIcon, titleKey: "roadmap.step4.title" as const, subtextKey: "roadmap.step4.subtext" as const },
    { icon: MedalStarIcon, titleKey: "roadmap.step5.title" as const, subtextKey: "roadmap.step5.subtext" as const },
  ];

  useEffect(() => {
    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const el = stepsRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const start = viewportHeight * 0.9;
        const end = -el.offsetHeight + viewportHeight * 0.3;
        const p = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));

        if (lineRef.current) {
          lineRef.current.style.transform = `scaleY(${p})`;
        }

        setProgress(p);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const getStepProgress = (index: number) => {
    const segmentSize = 1 / steps.length;
    const start = index * segmentSize;
    return Math.max(0, Math.min(1, (progress - start) / segmentSize));
  };

  return (
    <section ref={sectionRef} id="roadmap" className="relative py-20 sm:py-28 transition-colors duration-300">
      <Container>
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left - Sticky header */}
          <div className="lg:sticky lg:top-32 lg:self-start w-full">
            <span
              className="text-sm font-medium tracking-wide uppercase mb-4 block"
              style={{
                color: "#00a8ff",
                fontFamily: "var(--font-button)",
              }}
            >
              {t("roadmap.label")}
            </span>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              {t("roadmap.heading")}
            </h2>
          </div>

          {/* Right - Steps */}
          <div
            ref={stepsRef}
            className="lg:w-full flex flex-col gap-10 sm:gap-14"
          >
            {steps.map((step, i) => {
              const sp = getStepProgress(i);
              const title = t(step.titleKey);
              const words = title.split(" ");
              const Icon = step.icon;

              return (
                <div key={i} className="group">
                  {/* Icon + Title */}
                  <div className="flex items-center gap-3 mb-2">
                    <Icon
                      className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-colors ${
                        sp > 0.1 ? "text-[#00A8FF]" : isLight ? "text-slate-400" : "text-white/30"
                      }`}
                    />
                    <h3 className="text-2xl sm:text-3xl uppercase md:text-4xl font-bold leading-tight">
                      {words.map((word, wi) => {
                        const wordProgress =
                          words.length === 1
                            ? sp
                            : Math.max(
                                0,
                                Math.min(
                                  1,
                                  (sp - wi / words.length) / (1 / words.length),
                                ),
                              );
                        
                        const alpha = 0.35 + wordProgress * 0.65;
                        return (
                          <span
                            key={wi}
                            style={{
                              color: isLight
                                ? `rgba(15, 23, 42, ${alpha})`
                                : `rgba(255, 255, 255, ${alpha})`,
                            }}
                          >
                            {word}
                            {wi < words.length - 1 ? " " : ""}
                          </span>
                        );
                      })}
                    </h3>
                  </div>

                  {/* Subtext Badge */}
                  <div className="ml-8 sm:ml-9 mt-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium tracking-wide border transition-all duration-300"
                    style={{
                      backgroundColor: isLight ? "rgba(0, 168, 255, 0.08)" : "rgba(0, 168, 255, 0.12)",
                      borderColor: "rgba(0, 168, 255, 0.25)",
                      color: "#00A8FF",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A8FF]" />
                    <span>{t(step.subtextKey)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Roadmap;
