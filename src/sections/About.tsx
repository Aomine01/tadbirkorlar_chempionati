import Container from "../components/Container";
import AboutImage from "../assets/img/about-image.png";
import AudienceLightImage from "../assets/imglight/audiencelight.png";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";

const About = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isLight = theme === "light";
  const bgImg = isLight ? AudienceLightImage : AboutImage;

  return (
    <section
      style={{
        background: isLight
          ? "linear-gradient(rgba(248,250,252,0.2) 74%, rgba(248,250,252,0.9) 105%)"
          : "linear-gradient(#00000026 74%, #000000bf 105%)",
        boxShadow: isLight
          ? "0px 30px 100px 0px #f8fafc inset, 0px -230px 250px 0px #f8fafc inset"
          : "0px 30px 100px 0px #000001 inset, 0px -230px 250px 0px #000000 inset",
      }}
      id="about"
      className="relative min-h-[50dvh] w-full overflow-hidden mt-20 transition-all duration-300"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          backgroundImage: `url(${bgImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Dark/Light overlay */}
      <div className={`absolute inset-0 ${isLight ? "bg-white/70" : "bg-black/60"}`} />

      <div
        className="absolute top-0 left-0 w-full h-40 pointer-events-none z-[2]"
        style={{
          background: isLight
            ? "linear-gradient(to bottom, #f8fafc 0%, transparent 100%)"
            : "linear-gradient(to bottom, #000001 0%, transparent 100%)",
        }}
      />

      {/* Blue gradient overlay for atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? "radial-gradient(ellipse at center, rgba(0,168,255,0.15) 0%, transparent 70%)"
            : "radial-gradient(ellipse at center, rgba(0,100,200,0.3) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <Container className="relative z-10" size="md">
        <div className="flex items-center py-12 sm:py-20">
          <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-20 items-start w-full">
            {/* Left - Heading */}
            <div className="min-w-[40%]">
              <span
                className="text-md font-medium tracking-wide uppercase mb-4 block"
                style={{
                  color: "#00a8ff",
                  fontFamily: "var(--font-button)",
                }}
              >
                {t("about.label")}
              </span>
              <h2
                className={`text-[28px] sm:text-[32px] md:text-[38px] lg:text-[48px] font-bold leading-tight ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                {t("about.heading1")}
                <br />
                {t("about.heading2")}
              </h2>
            </div>

            {/* Right - Description */}
            <div>
              <p
                className={`text-base sm:text-lg leading-relaxed ${
                  isLight ? "text-slate-800 font-medium" : "text-white/90"
                }`}
                style={{ fontFamily: "var(--font-body)" }}
              >
                {t("about.text")}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default About;
