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
    className={`border-b transition-all duration-200 ${
      isLight ? "border-slate-200/70" : "border-white/5"
    } ${
      isOpen
        ? isLight
          ? "bg-[#00A8FF]/6"
          : "bg-white/4"
        : isLight
        ? "hover:bg-slate-50/70"
        : "hover:bg-white/2"
    }`}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5.5 cursor-pointer text-left group"
    >
      <div className="flex items-center gap-3">
        <span
          className={`text-sm sm:text-base font-semibold transition-colors ${
            isOpen
              ? isLight
                ? "text-[#00A8FF]"
                : "text-[#00A8FF]"
              : isLight
              ? "text-slate-800 group-hover:text-[#00A8FF]"
              : "text-white/90 group-hover:text-white"
          }`}
          style={{ fontFamily: "var(--font-body)" }}
        >
          {question}
        </span>
      </div>
      <ChevronDown
        size={18}
        className={`shrink-0 ml-4 transition-transform duration-300 ${
          isOpen
            ? "text-[#00A8FF]"
            : isLight
            ? "text-slate-400 group-hover:text-slate-600"
            : "text-white/40 group-hover:text-white/70"
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
        className={`px-5 sm:px-7 pb-5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
          isLight ? "text-slate-600 font-normal" : "text-white/70"
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
        <div className="mb-10 sm:mb-14 text-center sm:text-left">
          <span
            className="text-xs sm:text-sm font-bold tracking-widest uppercase mb-3 block text-[#00a8ff]"
            style={{
              fontFamily: "var(--font-zuume)",
              letterSpacing: "0.1em",
            }}
          >
            {t("faq.label")}
          </span>
          <h2 className={`text-2xl uppercase sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            {t("faq.heading")}
          </h2>
        </div>

        {/* FAQ List */}
        <div className={`rounded-3xl overflow-hidden border transition-all duration-300 ${
          isLight ? "bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/50 backdrop-blur-md" : "bg-[#0a0a0c]/90 border-white/10 shadow-2xl backdrop-blur-md"
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
