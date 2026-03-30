"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Component as EtheralShadow } from "@/components/ui/etheral-shadow";

interface FormData {
  name: string;
  surname: string;
  phone: string;
  email: string;
  age: string;
  businessType: string;
  businessDuration: string;
}

const initialForm: FormData = {
  name: "",
  surname: "",
  phone: "",
  email: "",
  age: "",
  businessType: "",
  businessDuration: "",
};

export default function ApplyPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Xatolik yuz berdi");
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Xatolik yuz berdi";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 relative overflow-hidden">
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
            background:
              "linear-gradient(to bottom, rgba(13,6,23,0.55) 0%, rgba(13,6,23,0.3) 50%, rgba(13,6,23,0.7) 100%)",
            zIndex: 2,
          }}
        />
        <div className="max-w-md w-full text-center space-y-6 relative z-10">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl">
              check_circle
            </span>
          </div>
          <h1 className="font-headline text-4xl font-black text-white uppercase">
            Arizangiz Qabul Qilindi!
          </h1>
          <p className="text-neutral-400">
            Biz siz bilan tez orada bog&apos;lanamiz.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:scale-105 transition-transform"
          >
            Bosh sahifaga qaytish
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface py-20 px-4 flex flex-col items-center relative overflow-hidden">
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
          background:
            "linear-gradient(to bottom, rgba(13,6,23,0.55) 0%, rgba(13,6,23,0.3) 50%, rgba(13,6,23,0.7) 100%)",
          zIndex: 2,
        }}
      />
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl relative z-10">
        <Link
          href="/"
          className="absolute top-8 left-8 text-neutral-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>

        <div className="text-center mb-12 mt-8 md:mt-0">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
            Registration
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-black text-white uppercase">
            Apply for YTC
          </h1>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-300">
                Name (Ism)
              </label>
              <input
                required
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-300">
                Surname (Familiya)
              </label>
              <input
                required
                type="text"
                name="surname"
                value={form.surname}
                onChange={handleChange}
                className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-300">
                Phone number (Telefon raqam)
              </label>
              <input
                required
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+998"
                className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-300">
                Email (Pochta)
              </label>
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-300">
              Age (Yosh)
            </label>
            <input
              required
              type="number"
              name="age"
              min="16"
              value={form.age}
              onChange={handleChange}
              className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-300">
              What kind of business? (Biznes turi)
            </label>
            <select
              required
              name="businessType"
              value={form.businessType}
              onChange={handleChange}
              className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-neutral-900">
                Tanlang...
              </option>
              <option value="Idea" className="bg-neutral-900">
                Idea
              </option>
              <option value="IT-Startup" className="bg-neutral-900">
                IT-Startup
              </option>
              <option value="Traditional" className="bg-neutral-900">
                Traditional Business
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-300">
              How long is your business running? (Biznesingiz qachondan beri
              faoliyat yuritadi?)
            </label>
            <select
              required
              name="businessDuration"
              value={form.businessDuration}
              onChange={handleChange}
              className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-neutral-900">
                Tanlang...
              </option>
              <option value="0" className="bg-neutral-900">
                Faqat g&apos;oya
              </option>
              <option value="<1" className="bg-neutral-900">
                1 yildan kam
              </option>
              <option value="1-3" className="bg-neutral-900">
                1 yildan 3 yilgacha
              </option>
              <option value="3+" className="bg-neutral-900">
                3 yildan ko&apos;proq
              </option>
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Yuborilmoqda...
                </>
              ) : (
                "Ariza Topshirish"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
