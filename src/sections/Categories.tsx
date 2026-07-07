import { useNavigate } from "react-router-dom";
import { Lightbulb, Building2, Rocket } from "lucide-react";
import Container from "../components/Container";

const cards = [
  {
    key: "business",
    icon: Building2,
    title: "An'anaviy biznes",
    description:
      "Sizda allaqachon ishlayotgan biznes bor. Uni kengaytiring, yangi darajaga olib chiqing va O'zbekistondagi yirik kompaniyalardan biriga aylaning.",
  },
  {
    key: "startup",
    icon: Rocket,
    title: "Startap",
    description:
      "Siz muammoga aniq va kuchli yechim topgansiz. Endi uni tezroq o'stiring, investitsiya jalb qiling va katta o'yinchilardan biriga aylaning.",
  },
  {
    key: "ideas",
    icon: Lightbulb,
    title: "G'oya",
    description:
      "Sizda hali amalga oshirilmagan, lekin kuchli potensialga ega g'oya bor. Uni real mahsulotga aylantiring, MVP chiqaring va investitsiya olib keyingi bosqichga olib chiqing.",
  },
];

const Categories = () => {
  const navigate = useNavigate();

  return (
    <section id="categories" className="relative py-16 sm:py-24">
      <Container>
        <div className="text-center mb-10 sm:mb-14">
          <span
            className="text-sm font-medium tracking-wide uppercase mb-4 block"
            style={{ color: "#00a8ff", fontFamily: "var(--font-button)" }}
          >
            Chempionat yo'nalishlari
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl uppercase lg:text-5xl font-bold leading-tight">
            3ta yo‘nalish bo‘yicha ariza <br /> qabul qilamiz
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 max-w-5xl mx-auto">
          {cards.map(({ key, icon: Icon, title, description }) => (
            <div
              key={key}
              className="flex-1 flex flex-col gap-4 bg-[#111] rounded-xl px-5 sm:px-6 py-5 sm:py-6"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/10">
                <Icon size={20} className="text-white/70" />
              </div>
              <div className="flex-1">
                <h3
                  className="text-lg sm:text-xl font-bold mb-3"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-white/60 text-xs sm:text-sm leading-relaxed"
                  style={{ fontFamily: "var(--font-button)" }}
                >
                  {description}
                </p>
              </div>
              <button
                onClick={() => navigate(`/forms/${key}`)}
                className="w-full py-2.5 rounded-lg text-sm font-medium border border-white/10 bg-white/5 hover:bg-[#00A8FF]/20 hover:border-[#00A8FF]/40 hover:text-[#00A8FF] text-white/80 transition-all duration-300 cursor-pointer"
                style={{ fontFamily: "var(--font-button)" }}
              >
                Ariza topshirish
              </button>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Categories;
