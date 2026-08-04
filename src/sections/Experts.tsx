import Container from "../components/Container";
import ExpertOne from "../assets/experts/p1.webp";
import ExpertTwo from "../assets/experts/p2.webp";
import ExpertThree from "../assets/experts/p3.webp";
import ExpertFour from "../assets/experts/p4.webp";
import ExpertFive from "../assets/experts/p5.webp";
import Marquee from "../components/Marquee";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";

const experts = [
  {
    name: "Abdullayev Farrux",
    company: "Belissimo Pizza Asoschisi",
    image: ExpertOne,
  },
  {
    name: "Tojimirzayeva Gulbahor",
    company: '"BA ASSOCIATION" rahbari',
    image: ExpertTwo,
  },
  {
    name: "Yakubov Abdulaziz",
    company: '"Yoshlar Ventures" direktori',
    image: ExpertThree,
  },
  {
    name: "Kuldoshov Mirzobek",
    company: "Yoshlar Tadbirkorligini Rivojlantirish Jamg'armasi direktori",
    image: ExpertFour,
  },
  {
    name: "Kurbanova Diana",
    company: '"Franchayzing" uyushmasi rahbari',
    image: ExpertFive,
  },
];

const ExpertCard = ({ expert }: { expert: (typeof experts)[0] }) => (
  <div className="shrink-0 w-[240px] sm:w-[280px] md:w-[300px] select-none">
    <div className="rounded-2xl overflow-hidden bg-[#111] border border-white/10 relative aspect-[3/4] shadow-lg">
      <img
        src={expert.image}
        alt={expert.name}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      {/* Bottom gradient shadow */}
      <div
        className="absolute bottom-0 left-0 w-full px-4 pb-4 pt-16"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
        }}
      >
        <h3 className="text-lg sm:text-2xl font-bold text-white">{expert.name}</h3>
        <p
          className="text-white/70 text-xs sm:text-sm"
          style={{ fontFamily: "var(--font-button)" }}
        >
          {expert.company}
        </p>
      </div>
    </div>
  </div>
);

const Experts = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isLight = theme === "light";
  const fadeColor = isLight ? "#f8fafc" : "#000001";

  return (
    <section id="experts" className="relative py-20 sm:py-28 overflow-hidden transition-colors duration-300">
      <Container>
        <div className="text-center mb-10 sm:mb-14">
          <span
            className="text-sm font-medium tracking-wide uppercase mb-4 block"
            style={{
              color: "#00a8ff",
              fontFamily: "var(--font-button)",
            }}
          >
            {t("experts.label")}
          </span>
          <h2 className={`text-2xl uppercase sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            {t("experts.heading")}
          </h2>
        </div>
      </Container>

      {/* Marquee */}
      <div className="relative">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-10 sm:w-32 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to right, ${fadeColor}, transparent)`,
          }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-10 sm:w-32 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to left, ${fadeColor}, transparent)`,
          }}
        />
        <Marquee gap={30}>
          {[...experts, ...experts, ...experts].map((expert, i) => (
            <ExpertCard key={i} expert={expert} />
          ))}
        </Marquee>
      </div>

      <style>{`
        @keyframes experts-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
};

export default Experts;
