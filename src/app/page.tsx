"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Component as EtheralShadow } from '@/components/ui/etheral-shadow';
import { UzbekistanMap } from '@/components/ui/uzbekistan-map';

import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { lang } = useLanguage();
  const [chartData, setChartData] = useState([40, 60, 45, 85, 100, 70, 55]);
  const t = translations[lang];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = prev.map(() => Math.floor(Math.random() * 60) + 40);
        // Ensure there's always one peak at 100
        const peakIndex = Math.floor(Math.random() * newData.length);
        newData[peakIndex] = 100;
        return newData;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />

      {/* ── Hero — sticky so main content rolls over it ── */}
      <header
        className="sticky top-0 min-h-screen w-full flex flex-col items-center justify-center text-center px-4"
        style={{ zIndex: 10, overflow: 'hidden' }}
      >
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <EtheralShadow
            color="rgba(128, 128, 128, 1)"
            animation={{ scale: 100, speed: 90 }}
            noise={{ opacity: 1, scale: 1.2 }}
            sizing="fill"
          />
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(13,6,23,0.55) 0%, rgba(13,6,23,0.3) 50%, rgba(13,6,23,0.75) 100%)',
            zIndex: 2,
          }}
        />
        <div className="relative z-10 max-w-5xl mt-20">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-xl mb-8 transition-colors hover:bg-white/10">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-bold tracking-[0.2em] uppercase">
              {t.season}
            </span>
          </div>
          <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-[0.9] uppercase">
            {t.heroTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{t.heroSubtitle}</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 font-body leading-relaxed">
            {t.heroDesc}
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link href="/apply" className="px-10 py-5 bg-indigo-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-transform neon-glow">{t.registerNow.toUpperCase()}</Link>
            <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all">{t.viewRules}</button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <span className="material-symbols-outlined text-neutral-400 text-3xl">keyboard_double_arrow_down</span>
        </div>
      </header>

      {/* ── Main content — slides up over the sticky hero ── */}
      <main className="bg-white text-neutral-900 relative overflow-hidden" style={{ zIndex: 20 }}>
        {/* Strategic Pillars */}
        <section id="rules" className="max-w-7xl mx-auto px-8 py-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-neutral-950 mb-4 uppercase">{t.pillarsTitle}</h2>
              <p className="text-neutral-600 text-lg">{t.pillarsDesc}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "lightbulb", title: t.ideaTitle, desc: t.ideaDesc, link: "/idea" },
              { icon: "rocket_launch", title: t.itTitle, desc: t.itDesc, link: "/it-startup" },
              { icon: "storefront", title: t.tradTitle, desc: t.tradDesc, link: "/traditional" },
            ].map((p) => (
              <Link href={p.link} key={p.icon} className="group p-8 rounded-[32px] bg-neutral-50 hover:bg-indigo-600 transition-all duration-500 block cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-8 group-hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined text-indigo-600 text-3xl group-hover:text-white">{p.icon}</span>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-4 group-hover:text-white transition-colors">{p.title}</h3>
                <p className="text-neutral-600 mb-8 group-hover:text-white/80 transition-colors">{p.desc}</p>
                <div className="inline-flex items-center gap-2 font-bold text-indigo-600 group-hover:text-white transition-colors">
                  {t.learnTrack} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Evaluation Algorithm */}
        <section className="bg-neutral-50 py-24">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full mb-6">{t.algoStatus}</div>
                <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-neutral-900 mb-6 uppercase leading-tight">{t.algoTitle}</h2>
                <p className="text-neutral-600 text-lg mb-8 leading-relaxed">{t.algoDesc}</p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white rounded-2xl shadow-sm">
                    <p className="text-neutral-500 text-sm font-medium mb-1">{t.fairness}</p>
                    <div className="text-3xl font-black text-indigo-600">99.98%</div>
                  </div>
                  <div className="p-6 bg-white rounded-2xl shadow-sm">
                    <p className="text-neutral-500 text-sm font-medium mb-1">{t.latency}</p>
                    <div className="text-3xl font-black text-indigo-600">0.02ms</div>
                  </div>
                </div>
              </div>
              <div className="relative bg-neutral-900 rounded-[32px] p-8 overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="text-indigo-400 text-xs font-mono">LIVE_DATA_STREAM_SCORING</div>
                </div>
                <div className="h-64 flex items-end gap-2 mb-8 items-stretch pt-12">
                  {chartData.map((h, i) => (
                    <div key={i} className="flex-1 overflow-visible relative flex items-end">
                      <div 
                        className="w-full rounded-t-lg transition-all duration-500 ease-in-out relative" 
                        style={{ height: `${h}%`, backgroundColor: `rgba(79,70,229,${Math.max(0.4, h / 100)})` }}
                      >
                        {h === 100 && <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-2 py-1 rounded text-[10px] font-bold">PEAK</div>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><span className="text-white text-sm font-mono">Node_Alpha_Processing</span></div>
                    <span className="text-indigo-400 font-mono text-xs">ONLINE</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><span className="text-white text-sm font-mono">Regional_Sync_Latency</span></div>
                    <span className="text-indigo-400 font-mono text-xs">14ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nationwide Movement + Interactive Map */}
        <section className="py-24 max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-neutral-950 mb-4 uppercase">{t.movementTitle}</h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">{t.movementDesc}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 relative">
              <div className="aspect-video bg-neutral-50 rounded-[40px] flex items-center justify-center overflow-hidden border border-neutral-100 p-6">
                <UzbekistanMap lang={lang} />
              </div>
              <div className="absolute top-8 left-8 p-4 bg-white/90 backdrop-blur shadow-xl rounded-2xl border border-indigo-100">
                <div className="text-2xl font-black text-indigo-600">12</div>
                <div className="text-[10px] font-bold text-neutral-500 uppercase">{t.regions}</div>
              </div>
            </div>
            <div className="lg:col-span-5 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-neutral-50 rounded-3xl">
                  <div className="text-4xl font-black text-neutral-900 mb-1">200+</div>
                  <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">{t.districts}</div>
                </div>
                <div className="p-6 bg-neutral-50 rounded-3xl">
                  <div className="text-4xl font-black text-neutral-900 mb-1">50k+</div>
                  <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">{t.applicants}</div>
                </div>
              </div>
              <div className="p-8 bg-indigo-600 rounded-[32px] text-white">
                <h4 className="font-headline text-xl font-bold mb-2">{t.rankTitle}</h4>
                <p className="text-white/80 text-sm mb-6">{t.rankDesc}</p>
                <button className="w-full py-4 bg-white text-indigo-600 rounded-full font-bold hover:bg-neutral-100 transition-colors">{t.localHub}</button>
              </div>
            </div>
          </div>
        </section>

        {/* Partners */}
        <section id="partners" className="py-20 border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-8">
            <p className="text-center text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] mb-12">{t.empowered}</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
              <div className="h-12 flex items-center opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-500">
                <Image src="/ventureLogoBlack.png" alt="Venture Logo" height={48} width={160} className="object-contain max-h-12 w-auto" />
              </div>
              <div className="h-12 flex items-center opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-500">
                <Image src="/yia logo full_uz black.png" alt="Agency Logo" height={48} width={160} className="object-contain max-h-12 w-auto" />
              </div>
              <div className="h-12 flex items-center opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-500">
                <Image src="/fundLogoBlack.png" alt="Fund Logo" height={48} width={160} className="object-contain max-h-12 w-auto" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-8 pb-24">
          <div className="relative w-full rounded-[48px] bg-indigo-600 p-12 md:p-24 overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-800 opacity-50"></div>
            <div className="relative z-10">
              <h2 className="font-headline text-4xl md:text-7xl font-black tracking-tight text-white mb-8 uppercase leading-none">
                {t.ctaTitle} <br /> {t.ctaTitle2}
              </h2>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">{t.ctaDesc}</p>
              <div className="flex flex-col md:flex-row gap-6 justify-center">
                <Link href="/apply" className="px-12 py-6 bg-white text-indigo-600 rounded-full font-black text-lg hover:scale-105 transition-transform shadow-2xl">{t.applyBtn}</Link>
                <button className="px-12 py-6 bg-indigo-500/30 border border-white/20 text-white rounded-full font-black text-lg hover:bg-indigo-500/50 transition-all">{t.downloadGuide}</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
