import { useEffect, useRef, useState } from "react";
import Container from "../components/Container";

const words = [
  "INVESTITSIYA",
  "ORQALI",
  "-",
  "ENG",
  "KUCHLI",
  "G'OYALAR,",
  "ENG",
  "JASUR",
  "TADBIRKORLAR",
  "VA",
  "ULARDAN",
  "O'SIB",
  "CHIQADIGAN",
  "DUNYO",
  "MIQYOSIDAGI",
  "O'ZBEK",
  "BRENDLARINI",
  "QO'LLAB-QUVVATLAYMIZ",
];

interface CounterProps {
  end: number;
  suffix?: string;
  label: string;
}

const Counter = ({ end, suffix = "", label }: CounterProps) => {
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
            // ease-out cubic
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
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
        {count.toLocaleString()}
        {suffix}
      </h2>
      <p className="text-xs sm:text-sm md:text-base text-white mt-1 sm:mt-2">
        {label}
      </p>
    </div>
  );
};

const Stats = () => {
  const textRef = useRef<HTMLHeadingElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = textRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start revealing when the text top enters the viewport,
      // fully revealed when text top reaches 40% from the top of screen
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
    <section className=" bg-[#000001] flex flex-col items-center justify-center pt-24 pb-12 px-4 relative">
      <Container size="sm">
        <h2
          ref={textRef}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center leading-tight mb-12 sm:mb-20"
        >
          {words.map((word, i) => (
            <span
              key={i}
              className="transition-colors duration-300"
              style={{
                color: i < revealedWords ? "#ffffff" : "rgba(255,255,255,0.2)",
              }}
            >
              {word}{" "}
            </span>
          ))}
        </h2>
      </Container>

      <Container size="md">
        <div className="grid grid-cols-2 md:flex md:justify-between gap-6">
          <Counter end={3} suffix=" ta" label="Yo‘nalish" />
          <Counter end={1} suffix=" mlrd" label="So'mgacha Investitsiya" />
          <Counter end={100} suffix=" BHM" label="Grant" />
          <Counter end={100} suffix=" ta" label="G'oliblar soni" />
        </div>
      </Container>
    </section>
  );
};

export default Stats;
