"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Lang = 'uz' | 'ru' | 'en';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'uz',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('uz');

  useEffect(() => {
    const savedLang = localStorage.getItem('ytc_lang') as Lang;
    if (savedLang && ['uz', 'ru', 'en'].includes(savedLang)) {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('ytc_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
