"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

export function Footer() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <footer className="bg-neutral-950 border-t border-white/10 pt-24 pb-12 relative overflow-hidden z-20">
      {/* Decorative glows */}
      <div className="absolute bottom-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <Link href="/" className="mb-6">
               <Image src="/chempionshipLogo.png" alt="YTC Logo" width={120} height={40} className="object-contain" />
            </Link>
            <p className="text-neutral-400 leading-relaxed mb-8 max-w-sm">
              {t.heroDesc}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all">
                <span className="material-symbols-outlined text-[20px]">send</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all">
                <span className="material-symbols-outlined text-[20px]">public</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Tracks Links */}
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">{t.tracksTitle}</h4>
              <ul className="space-y-4">
                <li><Link href="/idea" className="text-neutral-400 hover:text-indigo-400 transition-colors">{t.ideaTitle}</Link></li>
                <li><Link href="/it-startup" className="text-neutral-400 hover:text-indigo-400 transition-colors">{t.itTitle}</Link></li>
                <li><Link href="/traditional" className="text-neutral-400 hover:text-indigo-400 transition-colors">{t.tradTitle}</Link></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">{t.resourcesTitle}</h4>
              <ul className="space-y-4">
                <li><Link href="/#rules" className="text-neutral-400 hover:text-indigo-400 transition-colors">{t.rules}</Link></li>
                <li><Link href="/faq" className="text-neutral-400 hover:text-indigo-400 transition-colors">FAQ</Link></li>
                <li><Link href="#" className="text-neutral-400 hover:text-indigo-400 transition-colors">{t.downloadGuide}</Link></li>
                <li><Link href="#" className="text-neutral-400 hover:text-indigo-400 transition-colors">{t.pressKit}</Link></li>
              </ul>
            </div>

            {/* Contact & Legal */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">{t.contactTitle}</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-neutral-400 hover:text-indigo-400 transition-colors">{t.privacyPolicy}</Link></li>
                <li><Link href="#" className="text-neutral-400 hover:text-indigo-400 transition-colors">{t.termsOfService}</Link></li>
                <li className="flex items-center gap-3 text-neutral-400 mt-6 pt-6 border-t border-white/10">
                  <span className="material-symbols-outlined text-indigo-500 text-lg">location_on</span>
                  <span>{t.address}</span>
                </li>
                <li className="flex items-center gap-3 text-neutral-400">
                  <span className="material-symbols-outlined text-indigo-500 text-lg">mail</span>
                  <a href="mailto:hello@ytc.uz" className="hover:text-indigo-400 transition-colors">hello@ytc.uz</a>
                </li>
                <li className="flex items-center gap-3 text-neutral-400">
                  <span className="material-symbols-outlined text-indigo-500 text-lg">call</span>
                  <a href="tel:+998712345678" className="hover:text-indigo-400 transition-colors">+998 71 234 56 78</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500 font-medium">
          <p>{t.copyright}</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
