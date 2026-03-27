"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import Image from "next/image";

export function Navbar() {
  const { lang, setLang } = useLanguage();
  const t = translations[lang];
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('home');
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Close lang menu on click outside could be added here, but keep it simple
  
  const handleNavClick = (tab: string, hash: string) => {
    setActiveTab(tab);
    if (pathname === '/') {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" onClick={() => setActiveTab('home')} className="flex items-center gap-3">
          <Image 
            src="/chempionshipLogo.png" 
            alt="YTC Logo" 
            width={160} 
            height={44} 
            className="object-contain max-h-[44px] w-auto" 
            priority
          />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href={pathname === '/' ? "#" : "/"}
            onClick={() => handleNavClick('home', '')}
            className={`font-bold pb-1 transition-colors border-b-2 ${activeTab === 'home' && pathname === '/' ? 'text-white border-indigo-500' : 'text-neutral-400 border-transparent hover:text-white'}`} 
          >
            {t.home}
          </Link>
          <Link 
            href={pathname === '/' ? "#champions" : "/#champions"}
            onClick={() => handleNavClick('champions', 'champions')}
            className={`font-bold pb-1 transition-colors border-b-2 ${activeTab === 'champions' ? 'text-white border-indigo-500' : 'text-neutral-400 border-transparent hover:text-white'}`} 
          >
            {t.champions}
          </Link>
          <Link 
            href={pathname === '/' ? "#rules" : "/#rules"}
            onClick={() => handleNavClick('rules', 'rules')}
            className={`font-bold pb-1 transition-colors border-b-2 ${activeTab === 'rules' ? 'text-white border-indigo-500' : 'text-neutral-400 border-transparent hover:text-white'}`} 
          >
            {t.rules}
          </Link>
          <Link 
            href={pathname === '/' ? "#partners" : "/#partners"}
            onClick={() => handleNavClick('partners', 'partners')}
            className={`font-bold pb-1 transition-colors border-b-2 ${activeTab === 'partners' ? 'text-white border-indigo-500' : 'text-neutral-400 border-transparent hover:text-white'}`} 
          >
            {t.partners}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {/* Language switcher */}
          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 text-neutral-400 hover:text-white font-bold uppercase text-sm border border-white/10 px-3 py-1.5 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">language</span>
              {lang}
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>

            {showLangMenu && (
              <div className="absolute top-full right-0 mt-2 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[120px]">
                {(['uz', 'ru', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      setShowLangMenu(false);
                    }}
                    className={`block w-full text-left px-4 py-3 uppercase text-sm font-bold transition-colors ${
                      lang === l ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    {l === 'uz' ? 'O\'zbek' : l === 'ru' ? 'Русский' : 'English'}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link 
            href="/apply"
            className="hidden sm:block bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-indigo-500 hover:text-white transition-all duration-300"
          >
            {t.registerNow}
          </Link>
        </div>
      </div>
    </nav>
  );
}
