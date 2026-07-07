import Container from "../components/Container";
import AboutImage from "../assets/img/about-image.png";

const About = () => {
  return (
    <section
      style={{
        background: "linear-gradient(#00000026 74%, #000000bf 105%)",
        boxShadow:
          "0px 30px 100px 0px #000001 inset, 0px -230px 250px 0px #000000 inset",
      }}
      id="about"
      className="relative min-h-[50dvh] w-full overflow-hidden mt-20"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${AboutImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      <div
        className="absolute top-0 left-0 w-full h-40 pointer-events-none z-[2]"
        style={{
          background:
            "linear-gradient(to bottom, #000001 0%, transparent 100%)",
        }}
      />

      {/* Blue gradient overlay for atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,100,200,0.3) 0%, transparent 70%)",
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
                Chempionat haqida
              </span>
              <h2 className="text-[28px] sm:text-[32px] md:text-[38px] lg:text-[48px] font-bold leading-tight">
                CHEMPIONATDA
                <br />
                NIMALAR KUTILMOQDA
              </h2>
            </div>

            {/* Right - Description */}
            <div>
              <p
                className="text-base sm:text-lg text-white/90 leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Yurtboshimizning PQ-59 sonli qaroriga asosan tashkil qilingan va
                har yili o‘tkaziladia tanlov bo‘lib, 18 yoshdan 30 yoshgacha
                bo‘lgan an’anaviy biznes, startap va g‘oyaga ega yoshlar
                ishtirok etishi mumkin. Tanlov yakunida 100 tagacha biznes va
                startap loyihalarning har biriga 1 milliard soʻmgacha
                investitsiya kiritiladi, ularni brendga aylantirish uchun
                moliyaviy va marketing xizmatlari boʻyicha ekspertlarning
                bazaviy hisoblash miqdorining 100 baravarigacha miqdorda
                xarajatlari toʻlab beriladi.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default About;
