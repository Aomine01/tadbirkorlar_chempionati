import { useEffect, useRef, useState } from "react";
import Container from "../components/Container";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";

interface CounterProps {
  end: number;
  suffix?: string;
  label: string;
  isLight?: boolean;
}

const Counter = ({ end, suffix = "", label, isLight }: CounterProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1000;
          const start = performance.now();

          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref}>
      <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
        {count.toLocaleString()}
        {suffix}
      </h2>
      <p className={`text-xs sm:text-sm md:text-base mt-1 sm:mt-2 ${isLight ? "text-slate-600 font-medium" : "text-white"}`}>
        {label}
      </p>
    </div>
  );
};

const Stats = () => {
  const textRef = useRef<HTMLHeadingElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { theme } = useTheme();
  const { t } = useLanguage();

  const isLight = theme === "light";
  const words = t("stats.scrollText").split(" ").filter(Boolean);

  useEffect(() => {
    const handleScroll = () => {
      const el = textRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const start = windowHeight;
      const end = windowHeight * 0.4;
      const progress = Math.max(
        0,
        Math.min(1, (start - rect.top) / (start - end)),
      );

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const revealedWords = Math.floor(scrollProgress * words.length);

  return (
    <section className={`flex flex-col items-center justify-center pt-24 pb-12 px-4 relative transition-colors duration-300 ${
      isLight ? "bg-[#f8fafc]" : "bg-[#000001]"
    }`}>
      <Container size="sm">
        <h2
          ref={textRef}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center leading-tight mb-12 sm:mb-20"
        >
          {words.map((word, i) => {
            const activeColor = isLight ? "#0f172a" : "#ffffff";
            const inactiveColor = isLight ? "rgba(15, 23, 42, 0.2)" : "rgba(255,255,255,0.2)";
            return (
              <span
                key={i}
                className="transition-colors duration-300"
                style={{
                  color: i < revealedWords ? activeColor : inactiveColor,
                }}
              >
                {word}{" "}
              </span>
            );
          })}
        </h2>
      </Container>

      <Container size="md">
        <div className="grid grid-cols-2 md:flex md:justify-between gap-6">
          <Counter end={3} suffix=" ta" label={t("stats.counter1.label")} isLight={isLight} />
          <Counter end={1} suffix=" mlrd" label={t("stats.counter2.label")} isLight={isLight} />
          <Counter end={100} suffix=" BHM" label={t("stats.counter3.label")} isLight={isLight} />
          <Counter end={100} suffix=" ta" label={t("stats.counter4.label")} isLight={isLight} />
        </div>
      </Container>
    </section>
  );
};

export default Stats;
