"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const { lang } = useLanguage();
  const t = translations[lang];

  const faqs = [
    { q: t.faqQ1, a: t.faqA1 },
    { q: t.faqQ2, a: t.faqA2 },
    { q: t.faqQ3, a: t.faqA3 },
    { q: t.faqQ4, a: t.faqA4 },
    { q: t.faqQ5, a: t.faqA5 }
  ];

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans">
      <Navbar />

      {/* Cinematic Hero Section */}
      <header className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden bg-[#0e0e0e]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4601FA]/30 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#4601FA]/20 blur-[120px] rounded-full"></div>
        <div className="absolute top-1/2 -left-24 w-64 h-64 bg-[#CA8FF9]/10 blur-[100px] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors text-sm font-bold tracking-wider uppercase">
            <span className="material-symbols-outlined text-sm">arrow_back</span> {t.home}
          </Link>
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#aca3ff] text-sm font-bold tracking-wider mb-6 font-mono">
                {t.faqSupport}
            </span>
            <h1 className="text-5xl md:text-7xl font-space-grotesk font-extrabold tracking-tighter text-white mb-8 uppercase leading-tight">
                {t.faqTitle1} <br/> <span className="text-[#aca3ff]">{t.faqTitle2}</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                {t.faqDesc}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Transition */}
      <main className="bg-white text-gray-900 rounded-t-[3rem] -mt-12 relative z-20 pb-24">
        <div className="max-w-7xl mx-auto px-8 pt-24">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-4 mb-16">
            <button className="px-8 py-3 rounded-full bg-[#aca3ff] text-[#27009a] font-bold shadow-lg shadow-[#aca3ff]/20">{t.faqGen}</button>
            <button className="px-8 py-3 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors">{t.faqElig}</button>
            <button className="px-8 py-3 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors">{t.faqTracks}</button>
            <button className="px-8 py-3 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors">{t.faqFunding}</button>
          </div>

          {/* Bento Grid Accordion Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Featured Illustration */}
            <div className="lg:col-span-4 h-full">
              <div className="sticky top-32 p-8 bg-gray-50 rounded-3xl overflow-hidden group">
                <div className="mb-6">
                  <h3 className="text-2xl font-space-grotesk font-bold mb-4">{t.faqStillQ}</h3>
                  <p className="text-gray-500 mb-8 leading-relaxed">{t.faqCantFind}</p>
                  <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#aca3ff] hover:text-[#27009a] transition-colors">
                    <span className="material-symbols-outlined text-xl">mail</span>
                    {t.faqTouch}
                  </button>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  alt="Contact Support" 
                  className="w-full h-48 object-cover rounded-2xl shadow-xl" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3hfLqTizX5U1kESNorlMPZ4mnB1F6fYXa0vby8PeYBNEGeh4U5-fJK3BhXWR-91dYVFqY43u-MtSdRiAWOZnROIHOlZyBvycpysCrSU1yWuP8yANSgnWHeZnDr-B9TWJjMzfyvBzyRCD6xDu_fzsELDsx4MPkkpNnUxnS9eB0DLJS4xwMSWzR6DKwOmyhUkUVoSi5VbDaZAGIGSXOc7hRKKFwBLLCX3sfz4CDuEfGpR3uTcGKt3HLSJl4qZ9Jfqt4f3rDrf3yEyk"
                />
              </div>
            </div>

            {/* Right Column: The Accordions */}
            <div className="lg:col-span-8 space-y-6">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div 
                    key={index} 
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className={`p-8 rounded-3xl transition-all duration-300 cursor-pointer ${
                      isOpen 
                      ? 'bg-gray-50 border border-transparent hover:border-[#aca3ff]/20' 
                      : 'bg-white border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50'
                    }`}
                  >
                    <div className={`flex justify-between ${isOpen ? 'items-start' : 'items-center'}`}>
                      <div className={isOpen ? 'pr-8' : ''}>
                        <h4 className={`text-xl font-space-grotesk font-bold text-gray-900 ${isOpen ? 'mb-4' : ''}`}>
                          {faq.q}
                        </h4>
                        {isOpen && (
                          <div className="text-gray-600 leading-relaxed text-lg">
                            {faq.a}
                          </div>
                        )}
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? 'bg-[#aca3ff]/10 text-[#aca3ff]' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <span className="material-symbols-outlined">{isOpen ? 'remove' : 'add'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>

          {/* Secondary Info Section */}
          <section className="mt-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#0e0e0e] text-white p-12 rounded-[2.5rem] relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-3xl font-space-grotesk font-bold mb-6">{t.faqRoadmap}</h3>
                  <p className="text-gray-400 mb-8 leading-relaxed max-w-sm">{t.faqRoadmapDesc}</p>
                  <a className="inline-flex items-center gap-2 text-[#aca3ff] font-bold hover:gap-4 transition-all" href="#">
                    {t.faqViewTime}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </a>
                </div>
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#aca3ff]/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              </div>
              <div className="bg-[#aca3ff]/5 p-12 rounded-[2.5rem] border border-[#aca3ff]/10">
                <h3 className="text-3xl font-space-grotesk font-bold mb-6 text-gray-900">{t.faqResources}</h3>
                <p className="text-gray-600 mb-8 leading-relaxed max-w-sm">{t.faqResourcesDesc}</p>
                <a className="inline-flex items-center gap-2 text-gray-900 font-bold hover:gap-4 transition-all" href="#">
                  {t.faqBrowse}
                  <span className="material-symbols-outlined">folder_open</span>
                </a>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
