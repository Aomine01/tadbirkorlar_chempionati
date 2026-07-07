import { useEffect, useRef, useState } from "react";
import Container from "../components/Container";
import { ExportIcon, FlagIcon, MedalStarIcon, StatusUpIcon } from "../assets";

const steps = [
  {
    icon: ExportIcon,
    title: "Ro'yxatdan o'tish",
    date: "27-aprel - 31-may",
  },
  {
    icon: StatusUpIcon,
    title: "1-Bosqich va natijalar",
    date: "1-iyun - 10-iyun",
  },
  {
    icon: StatusUpIcon,
    title: "2-Bosqich va natijalar",
    date: "10-iyun - 10-iyul",
  },
  {
    icon: FlagIcon,
    title: "Final bosqichi",
    date: "15-iyul - 30-iyul",
  },
  {
    icon: MedalStarIcon,
    title: "Taqdirlash marosimi",
    date: "20-avgust",
  },
];

const Roadmap = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [progress, setProgress] = useState(0);

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
    <section ref={sectionRef} id="roadmap" className="relative py-20 sm:py-28">
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
              Yo'l xaritasi
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              CHEMPIONAT YO'L XARITASI
            </h2>
          </div>

          {/* <div className="hidden lg:block relative w-1 shrink-0">
            <div className="absolute inset-0 bg-white/10 rounded-full" />
            <div
              ref={lineRef}
              className="absolute top-0 left-0 w-full h-full rounded-full origin-top will-change-transform"
              style={{
                background: "linear-gradient(to bottom, #00a8ff, #0066cc)",
                transform: "scaleY(0)",
              }}
            />
          </div> */}

          {/* Right - Steps */}
          <div
            ref={stepsRef}
            className="lg:w-full flex flex-col gap-10 sm:gap-14"
          >
            {steps.map((step, i) => {
              const sp = getStepProgress(i);
              const words = step.title.split(" ");

              const Icon = step.icon;

              return (
                <div key={i}>
                  {/* Icon + Title */}
                  <div className="flex items-center gap-3 mb-2">
                    <Icon
                      className="w-5 h-5 sm:w-6 sm:h-6 shrink-0"
                      style={{ opacity: 0.15 + sp * 0.85 }}
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
                        return (
                          <span
                            key={wi}
                            style={{
                              color: `rgba(255, 255, 255, ${0.15 + wordProgress * 0.85})`,
                            }}
                          >
                            {word}
                            {wi < words.length - 1 ? " " : ""}
                          </span>
                        );
                      })}
                    </h3>
                  </div>

                  {/* Date */}
                  <p
                    className="text-sm ml-8 sm:ml-10 transition-all duration-300"
                    style={{
                      color:
                        sp > 0.3
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(255,255,255,0.15)",
                    }}
                  >
                    {step.date}
                  </p>
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
