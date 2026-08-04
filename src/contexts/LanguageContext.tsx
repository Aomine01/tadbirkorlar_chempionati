import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { translations, type Language, type TranslationKey } from "../lib/translations";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  cycleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const LANG_ORDER: Language[] = ["uz", "ru", "en"];

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("lang") as Language | null;
    return saved && LANG_ORDER.includes(saved) ? saved : "uz";
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  }, []);

  const cycleLang = useCallback(() => {
    setLangState((prev) => {
      const idx = LANG_ORDER.indexOf(prev);
      const next = LANG_ORDER[(idx + 1) % LANG_ORDER.length];
      localStorage.setItem("lang", next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[lang][key] ?? translations["uz"][key] ?? key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, cycleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
};
