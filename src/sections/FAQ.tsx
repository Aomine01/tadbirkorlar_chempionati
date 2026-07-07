import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Container from "../components/Container";

const faqs = [
  {
    question: "Bu qarzmi? Nimani evaziga pul beriladi?",
    answer:
      "Qarz emas. Investitsiya sizning ustav kapitalingizga kiritiladigan ulush. Shakli loyihaga qarab farqlanadi — to'g'ridan-to'g'ri ulushdorlik, konvertatsiya qilinadigan moliyalashtirish yoki grant elementi mavjud aralash moliyalashtirish.",
  },
  {
    question: "Investitsiyani nimaga ishlatish mumkin va mumkin emas?",
    answer:
      "Mumkin: uskunalar, dasturiy ta'minot, MVP, marketing, sertifikatlash, eksportga tayyorgarlik, mutaxassislar, aylanma mablag'lar. Mumkin emas: avvalgi qarzlar, dividendlar, shaxsiy xarajatlar, taqiqlangan faoliyat.",
  },
  {
    question: "G'olib bo'lgach nima bo'ladi?",
    answer:
      "Investitsiya shartnomasi tuziladi, mablag' bir martalik yoki transhlar asosida ajratiladi. Har chorakda hisobot topshirasiz, loyihangiz KPI lar orqali monitoring qilinadi.",
  },
  {
    question: "KPI ga erisha olmasam nima bo'ladi?",
    answer:
      "Keyingi transh to'xtatilishi, investitsiya shartlari qayta ko'rib chiqilishi yoki shartnoma bekor qilinishi mumkin. Jiddiy buzilishlarda mablag'lar qonunchilik asosida undiriladi.",
  },
  {
    question: "G'oyam maxfiymi?",
    answer:
      "Ha. Taqdim etilgan biznes-reja, moliyaviy model va tijorat sirlari uchinchi shaxslarga oshkor etilmaydi.",
  },
  {
    question: "Hali tadbirkorlik subyektim ro'yxatdan o'tmagan, ishtirok etsam bo'ladimi?",
    answer:
      "Ha, fuqarolik sifatida ariza berish mumkin — g'olib bo'lgach tadbirkorlik subyekti tashkil etish sharti bilan.",
  },
  {
    question: "Loyihalar qanday mezonlar asosida baholanadi?",
    answer:
      "Biznes modelning asoslanganligi, bozor salohiyati, moliyaviy barqarorlik, jamoa malakasi, innovatsionlik darajasi, texnologik tayyorgarlik, ish o'rinlari yaratish imkoniyati, eksport salohiyati va qo'shimcha xususiy investitsiya jalb qilish imkoniyati. Baholash ikki bosqichda — hujjatlar asosida va pitch taqdimotda amalga oshiriladi.",
  },
  {
    question: "Apellyatsiya qanday beriladi?",
    answer:
      "Natijalar e'lon qilingan kundan e'tiboran 3 ish kuni ichida yozma yoki elektron shaklda Jamg'armaga apellyatsiya kiritish mumkin. Jamg'arma 10 kun ichida ko'rib chiqib javob beradi.",
  },
  {
    question: "Bir nechta odam jamoa sifatida ariza bera oladimi?",
    answer:
      "Ha. Jamoa sifatida yuridik shaxs orqali ariza berish mumkin — biroq ustav kapitalining kamida 50% 30 yoshgacha bo'lgan tadbirkorga tegishli bo'lishi shart.",
  },
];

const FAQItem = ({
  faq,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div
    className="border-b border-[#252528] transition-colors"
    style={{
      background: isOpen ? "rgba(255,255,255,0.03)" : "transparent",
    }}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 cursor-pointer text-left"
    >
      <div className="flex items-center gap-3">
        <span
          className="text-sm sm:text-base font-medium"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {faq.question}
        </span>
      </div>
      <ChevronDown
        size={18}
        className="shrink-0 ml-4 text-white/50 transition-transform duration-300"
        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
      />
    </button>
    <div
      className="overflow-hidden transition-all duration-300"
      style={{
        maxHeight: isOpen ? "600px" : "0px",
        opacity: isOpen ? 1 : 0,
      }}
    >
      <p
        className="px-5 sm:px-6 pb-5 text-white/60 text-xs sm:text-sm leading-relaxed"
        style={{ fontFamily: "var(--font-button)" }}
      >
        {faq.answer}
      </p>
    </div>
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <Container size="md">
        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <span
            className="text-sm font-medium tracking-wide uppercase mb-4 block"
            style={{
              color: "#00a8ff",
              fontFamily: "var(--font-button)",
            }}
          >
            FAQ
          </span>
          <h2 className="text-2xl uppercase sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            Ko'p beriladigan savollar
          </h2>
        </div>

        {/* FAQ List */}
        <div className="rounded-2xl overflow-hidden bg-[#0a0a0a]">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FAQ;
