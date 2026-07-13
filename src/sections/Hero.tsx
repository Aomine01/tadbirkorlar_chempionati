import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import HeroImage from "../assets/img/hero-image.png";
import Container from "../components/Container";
import Button from "../components/Button";
import Animate from "../components/Animate";
import Navbar from "../components/Navbar";
import Tadbirkorlik from "../assets/hero-marq/tadbirkorlik-jamgarmasi.png";
import Agentlik from "../assets/hero-marq/yoshlar-ishlari-agentligi.png";
import Ventures from "../assets/hero-marq/yoshlar-ventures.png";
import Marquee from "../components/Marquee";

const partnerImages = [
  { src: Agentlik, alt: "Yoshlar Ishlari Agentligi" },
  { src: Tadbirkorlik, alt: "Tadbirkorlik Jamg'armasi" },
  { src: Ventures, alt: "Yoshlar Ventures" },
];

interface HeroProps {
  onApply?: () => void;
}

const Hero = ({ onApply }: HeroProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);
  const [introTransitionDone, setIntroTransitionDone] = useState(false);

  useEffect(() => {
    const introTimer = setTimeout(() => setIntroComplete(true), 50);
    const transitionTimer = setTimeout(
      () => setIntroTransitionDone(true),
      2100,
    );
    return () => {
      clearTimeout(introTimer);
      clearTimeout(transitionTimer);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      const heroHeight = heroRef.current.offsetHeight;
      setScrollProgress(Math.min(scrollY / heroHeight, 1));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const introScale = introComplete ? 1 : 1.5;
  const bgScale = introScale + scrollProgress * (isMobile ? 0.1 : 0.3);

  const bgTransition = introTransitionDone
    ? "transform 0.1s linear"
    : "transform 2s cubic-bezier(0.16, 1, 0.3, 1)";

  return (
    <div
      id="home"
      ref={heroRef}
      className="relative min-h-[100vh] w-full overflow-hidden"
      style={{
        background: "linear-gradient(#00000026 74%, #000000bf 105%)",
      }}
    >
      {/* Background with intro zoom + scroll zoom */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundImage: `url(${HeroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `scale(${bgScale})`,
          transition: bgTransition,
        }}
      />

      {/* Bottom gradient transition */}
      <div
        className="w-full absolute bottom-0 left-0 h-87.5 pointer-events-none z-1"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%)",
        }}
      />

      {/* Navbar */}
      <Navbar onApply={onApply} />

      <Container className="relative z-10 min-h-screen flex flex-col justify-center items-center pt-28 pb-24 px-4 text-center">
        {/* Hero content */}
        <Animate
          type="scale-fade"
          delay={50}
          duration={2}
          className="w-full flex flex-col items-center justify-center"
        >
          {/* Title line 1 - white gradient */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none">
            <span
              style={{
                background: "linear-gradient(90deg, #FFFFFF 0%, #DAE7FC 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              YOSH TADBIRKORLAR
            </span>
            <br />
            {/* Title line 2 - blue gradient */}
            <span
              style={{
                background: "linear-gradient(90deg, #0099FF 0%, #CEEFFF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              CHEMPIONATI
            </span>
          </h1>

          {/* Prize amount */}
          <Animate
            type="fade-up"
            delay={1000}
            duration={0.8}
            className="mt-10 mb-12 sm:mb-20"
          >
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold"
              style={{
                background: "linear-gradient(90deg, #FFFFFF 0%, #DAE7FC 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              $10 000 000
            </h1>
            <p className="text-white text-sm md:text-base mt-3 max-w-md mx-auto leading-relaxed">
              Startapingiz, biznesingiz yoki g'oyangizni taqdim eting{" "}
              <br className="hidden sm:inline" />
              va investitsiya uchun kurashing
            </p>
          </Animate>

          {/* Buttons */}
          <Animate
            type="fade-up"
            delay={1400}
            duration={0.8}
            className="flex flex-wrap items-center justify-center gap-4 mt-8"
          >
            <Button
              variant="primary"
              icon={<ArrowRight size={20} />}
              onClick={onApply}
            >
              Ariza topshirish
            </Button>
          </Animate>
        </Animate>
      </Container>

      {/* Partners at bottom */}
      <div
        className="absolute bottom-4 left-0 w-full z-20"
        style={{ zIndex: 20 }}
      >
        <Animate type="fade-up" delay={1800} duration={1}>
          {/* Desktop - static row */}
          <div className="hidden md:flex items-center justify-center gap-8 px-4">
            {partnerImages.map((p) => (
              <img
                key={p.alt}
                src={p.src}
                alt={p.alt}
                className="h-8 w-auto object-contain shrink-0"
              />
            ))}
          </div>

          {/* Mobile/Tablet - marquee */}
          <div className="md:hidden">
            <Marquee gap={32}>
              {partnerImages.map((p) => (
                <img
                  key={p.alt}
                  src={p.src}
                  alt={p.alt}
                  className="h-6 w-auto object-contain"
                />
              ))}
            </Marquee>
          </div>
        </Animate>
      </div>
      <div className="absolute z-1 bg-black/20 top-0 w-full h-full left-0" />
    </div>
  );
};

export default Hero;
