import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Container from "../components/Container";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import type { TranslationKey } from "../lib/translations";

const faqKeys: { q: TranslationKey; a: TranslationKey }[] = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
  { q: "faq.q6", a: "faq.a6" },
  { q: "faq.q7", a: "faq.a7" },
  { q: "faq.q8", a: "faq.a8" },
  { q: "faq.q9", a: "faq.a9" },
  { q: "faq.q10", a: "faq.a10" },
  { q: "faq.q11", a: "faq.a11" },
];

const FAQItem = ({
  question,
  answer,
  isOpen,
  onToggle,
  isLight,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  isLight: boolean;
}) => (
  <div
    className={`border-b transition-colors ${
      isLight ? "border-slate-200" : "border-[#252528]"
    }`}
    style={{
      background: isOpen
        ? isLight ? "rgba(0,168,255,0.04)" : "rgba(255,255,255,0.03)"
        : "transparent",
    }}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 cursor-pointer text-left"
    >
      <div className="flex items-center gap-3">
        <span
          className={`text-sm sm:text-base font-medium ${
            isLight ? "text-slate-900" : "text-white"
          }`}
          style={{ fontFamily: "var(--font-body)" }}
        >
          {question}
        </span>
      </div>
      <ChevronDown
        size={18}
        className={`shrink-0 ml-4 transition-transform duration-300 ${
          isLight ? "text-slate-500" : "text-white/50"
        }`}
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
        className={`px-5 sm:px-6 pb-5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
          isLight ? "text-slate-600 font-medium" : "text-white/60"
        }`}
        style={{ fontFamily: "var(--font-button)" }}
      >
        {answer}
      </p>
    </div>
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isLight = theme === "light";

  return (
    <section id="faq" className="relative py-20 sm:py-28 transition-colors duration-300">
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
            {t("faq.label")}
          </span>
          <h2 className={`text-2xl uppercase sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            {t("faq.heading")}
          </h2>
        </div>

        {/* FAQ List */}
        <div className={`rounded-2xl overflow-hidden border transition-colors duration-300 ${
          isLight ? "bg-white border-slate-200 shadow-md shadow-slate-200/50" : "bg-[#0a0a0a] border-white/5"
        }`}>
          {faqKeys.map(({ q, a }, i) => (
            <FAQItem
              key={i}
              question={t(q)}
              answer={t(a)}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              isLight={isLight}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FAQ;
