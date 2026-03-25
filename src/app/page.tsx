'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Component as EtheralShadow } from '@/components/ui/etheral-shadow';

/* ─── Logo data ───────────────────────────────────────── */
const LOGOS = [
  { src: '/ventureLogo.png',      alt: 'Yoshlar Ventures' },
  { src: '/agencyLogo.png',       alt: 'Yoshlar Ishlari Agentligi' },
  { src: '/chempionshipLogo.png', alt: 'Tadbirkorlar Chempionati' },
  { src: '/fundLogo.png',         alt: 'Fund' },
];
// 4× duplication so the seamless loop (translate -50%) works fine
const TRACK = [...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS];

/* ─── AnimatedBadge ───────────────────────────────────── */
function AnimatedBadge() {
  return (
    <div
      className="relative mb-7 px-5 py-2 text-sm font-semibold uppercase tracking-widest rounded-full select-none"
      style={{
        background: 'rgba(202,143,249,0.1)',
        color: '#D8B4FE',
        backdropFilter: 'blur(10px)',
        animation: 'rotate-badge-border 4s linear infinite',
      }}
    >
      {/* Running-light conic border */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          padding: '1.5px',
          background: `conic-gradient(
            from var(--badge-angle, 0deg),
            transparent 0%,
            transparent 25%,
            rgba(202,143,249,0.1) 40%,
            #4601FA 48%,
            #fff    50%,
            #4601FA 52%,
            rgba(202,143,249,0.1) 60%,
            transparent 75%,
            transparent 100%
          )`,
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      COMING SOON
    </div>
  );
}

/* ─── SubscribeForm ───────────────────────────────────── */
function SubscribeForm({
  email,
  setEmail,
  sent,
  loading,
  onSubmit,
}: {
  email: string;
  setEmail: (val: string) => void;
  sent: boolean;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  if (sent) {
    return (
      <p
        className="text-sm font-semibold text-center px-8 py-4 rounded-full"
        style={{
          background: 'rgba(70,1,250,0.2)',
          color: '#CA8FF9',
          border: '1px solid rgba(202,143,249,0.3)',
        }}
      >
        ✓ Siz ro&apos;yxatdan o&apos;tdingiz!
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full"
      style={{
        maxWidth: 520,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        backdropFilter: 'blur(20px)',
        borderRadius: 100,
        padding: '8px 8px 8px 24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        gap: 8,
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="E-mail manzilingizni kiriting..."
        className="flex-1 border-none outline-none text-base font-medium rounded-full"
        style={{ 
          background: 'rgba(245, 245, 255, 0.95)',
          color: '#111827',
          padding: '12px 20px',
          minWidth: 0 
        }}
      />
      <button
        type="submit"
        disabled={loading}
        className="shrink-0 text-sm sm:text-base font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95"
        style={{
          background: '#6D28D9',
          color: '#fff',
          border: 'none',
          padding: '12px 26px',
          borderRadius: 100,
          fontFamily: 'inherit',
          boxShadow: '0 4px 14px rgba(109, 40, 217, 0.5)',
          whiteSpace: 'nowrap',
          marginLeft: '4px',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Yuborilmoqda...' : 'Xabar berish'}
      </button>
    </form>
  );
}

/* ─── LogoSlider ──────────────────────────────────────── */
function LogoSlider() {
  return (
    <div
      className="absolute left-0 w-full overflow-hidden pointer-events-none"
      style={{
        bottom: 56,
        maskImage:
          'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
        zIndex: 10,
      }}
    >
      <div
        className="flex w-max pointer-events-auto"
        style={{ animation: 'scrollLogos 28s linear infinite' }}
        onMouseEnter={e =>
          ((e.currentTarget as HTMLElement).style.animationPlayState = 'paused')
        }
        onMouseLeave={e =>
          ((e.currentTarget as HTMLElement).style.animationPlayState = 'running')
        }
      >
        {TRACK.map((logo, i) => (
          <div
            key={i}
            className="shrink-0 flex items-center mr-8 sm:mr-12 md:mr-16"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={200}
              height={56}
              className="object-contain h-8 sm:h-10 md:h-14 w-auto"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────── */
export default function Home() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
      }
    } catch (err) {
      console.error(err);
      alert("Tarmoq xatosi. Iltimos qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative flex flex-col items-center justify-center text-center text-white overflow-hidden"
      style={{ minHeight: '100svh', background: '#0d0617' }}
    >
      {/* ── Etheral Shadow Background ── */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <EtheralShadow
          color="rgba(70, 1, 250, 1)"
          animation={{ scale: 80, speed: 70 }}
          noise={{ opacity: 0.6, scale: 1.5 }}
          sizing="fill"
        />
      </div>
      {/* Dark overlay to keep text readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(13,6,23,0.55) 0%, rgba(13,6,23,0.3) 50%, rgba(13,6,23,0.7) 100%)',
          zIndex: 2,
        }}
      />

      {/* ── Hero content ── */}
      <div
        className="relative flex flex-col items-center px-5 w-full"
        style={{ zIndex: 10, maxWidth: 900, paddingBottom: 120 }}
      >
        <AnimatedBadge />

        <h1
          className="m-0 uppercase"
          style={{
            fontFamily: "'Agdasima', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(2.5rem, 12vw, 7rem)',
            lineHeight: 0.92,
            marginBottom: '0.5em',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #B8B8B8 48%, #FFFFFF 52%, #D9D9D9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.01em',
          }}
        >
          Tadbirkorlar
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, #CA8FF9 0%, #8753FB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Chempionati
          </span>
        </h1>

        <p
          className="leading-relaxed mx-auto"
          style={{
            fontSize: 'clamp(0.85rem, 3.5vw, 1.15rem)',
            color: 'rgba(242,242,247,0.72)',
            maxWidth: 580,
            marginBottom: '2.5rem',
            padding: '0 1rem',
          }}
        >
          Startapingiz, biznesingiz yoki g&apos;oyangizni taqdim eting va{' '}
          10 million dollarlik investitsiya uchun kurashing.
        </p>

        {/* Desktop form (row) — hidden on mobile */}
        <div className="hidden sm:flex w-full justify-center">
          <SubscribeForm 
            email={email}
            setEmail={setEmail}
            sent={sent}
            loading={loading}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Mobile form (stacked) */}
        {!sent ? (
          <form onSubmit={handleSubmit} className="flex sm:hidden w-full flex-col gap-3 px-2" style={{ maxWidth: 420 }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(20px)',
                borderRadius: 20,
                padding: '4px 16px',
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="E-mail manzilingiz..."
                className="w-full border-none outline-none text-sm font-medium rounded-xl"
                style={{ 
                  background: 'rgba(245, 245, 255, 0.95)',
                  color: '#111827',
                  padding: '12px 16px',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-sm font-bold py-3.5 rounded-2xl cursor-pointer transition-transform hover:scale-105 active:scale-95"
              style={{
                background: '#6D28D9',
                color: '#fff',
                border: 'none',
                fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(109, 40, 217, 0.5)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Yuborilmoqda...' : 'Xabar berish'}
            </button>
          </form>
        ) : (
          <div className="flex sm:hidden w-full justify-center px-4">
            <p
              className="text-sm font-semibold text-center w-full py-4 rounded-2xl"
              style={{
                background: 'rgba(70,1,250,0.2)',
                color: '#CA8FF9',
                border: '1px solid rgba(202,143,249,0.3)',
              }}
            >
              ✓ Siz ro&apos;yxatdan o&apos;tdingiz!
            </p>
          </div>
        )}
      </div>

      {/* ── Logo slider ── */}
      <LogoSlider />
    </main>
  );
}
