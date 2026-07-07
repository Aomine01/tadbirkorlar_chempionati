import ImageOne from "../assets/positive-sides/img-one.png";
import ImageTwo from "../assets/positive-sides/img-two.png";
import ImageThird from "../assets/positive-sides/img-three.png";
import ImageFour from "../assets/positive-sides/img-four.png";
import ImageFive from "../assets/positive-sides/img-five.png";
import ImageSix from "../assets/positive-sides/img-six.png";
import HeroImage from "../assets/img/hero-image.png";
import Container from "../components/Container";

const cards = [
  {
    title: "1 mlrd so‘mgacha investitsiya",
    image: ImageOne,
    description:
      "Eng kuchli 100 tagacha tadbirkorlar o‘z loyihalarini rivojlantirish uchun 1 mlrd. so‘mgacha investitsiya qo‘lga kiritadi.",
  },
  {
    title: "100 BHM miqdorda grant",
    image: ImageTwo,
    description:
      "Moliyaviy va marketing xizmatlari boʻyicha ekspertlarning bazaviy hisoblash miqdorining 100 baravarigacha xarajatlari toʻlab beriladi.",
  },
  {
    title: "Brend shakllantirish",
    image: ImageThird,
    description:
      "Loyihalar media, TV va omma oldida targ‘ib qilinib, kuchli brend va ishonchli qiyofaga ega bo‘ladi.",
  },
  {
    title: "Yosh tadbirkor Chempion unvoni",
    image: ImageFour,
    description:
      "G‘olib bo‘lgan ishtirokchilar “Yosh chempion tadbirkor” unvoniga ega bo‘ladi.",
  },
  {
    title: "Davlat mukofotlariga tavsiya etilish",
    image: ImageFive,
    description:
      "Chempionlar davlat mukofotlari, “Faol tadbirkor” va “Oʻzbekiston belgisi” koʻkrak nishonlariga tavsiya etiladi",
  },
  {
    title: "Xalqaro dasturlarda amaliyot",
    image: ImageSix,
    description:
      "Chempionat gʻoliblari nufuzli xorijiy akseleratorlar va kompaniyalarga amaliyot oʻtash dasturlariga yuboriladi",
  },
];

const PositiveSides = () => {
  return (
    <section id="why" className="relative w-full overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${HeroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Top fade-in from black */}
      <div
        className="absolute top-0 left-0 w-full h-40 pointer-events-none z-2"
        style={{
          background:
            "linear-gradient(to bottom, #000001 0%, transparent 100%)",
        }}
      />

      {/* Bottom fade-out to black */}
      <div
        className="absolute bottom-0 left-0 w-full h-40 pointer-events-none z-1"
        style={{
          background: "linear-gradient(to top, #000001 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <Container className="relative z-10 py-20 sm:py-28">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <span
            className="text-sm font-medium tracking-wide uppercase mb-4 block"
            style={{
              color: "#00a8ff",
              fontFamily: "var(--font-button)",
            }}
          >
            Chempionat afzalliklari
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            NIMA UCHUN <br /> ISHTIROK ETISH KERAK
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {cards.map((card, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden backdrop-blur-[100px] border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col min-h-[180px] md:min-h-[290px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(20, 20, 20, 0.8) 0%, rgba(5, 5, 5, 0.8) 100%)",
              }}
            >
              {/* Card image */}
              <div className="relative h-15.5 overflow-hidden shrink-0">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Card content */}
              <div className="px-5 pt-5 pb-6 flex flex-col flex-1">
                <h3
                  className="text-2xl sm:text-3xl font-bold leading-tight"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-white/60 text-xs sm:text-sm leading-relaxed mt-auto pt-4"
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default PositiveSides;
