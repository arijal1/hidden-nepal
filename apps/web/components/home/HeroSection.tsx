"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden">
      {/* BG image with parallax */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `translateY(${scrollY * 0.3}px) scale(1.1)`,
          backgroundImage: "url('https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=2000&q=85')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Subtle gradient overlay — keeps photo visible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,20,25,0.3) 0%, rgba(15,20,25,0.15) 35%, rgba(15,20,25,0.8) 100%)",
        }}
      />

      {/* Content — centered modern */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <div
          className="max-w-4xl"
          style={{ animation: "fadeUp 1.2s cubic-bezier(0.22,1,0.36,1) 0.2s both" }}
        >
          {/* Eyebrow tag */}
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-brand-500" />
            <span className="text-brand-400 text-[11px] font-mono tracking-[0.35em] uppercase">
              नमस्ते · Welcome
            </span>
            <div className="h-px w-8 bg-brand-500" />
          </div>

          {/* Headline — big and confident */}
          <h1
            className="font-display text-white leading-[0.95] tracking-[-0.02em] mb-8"
            style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)" }}
          >
            Discover the Nepal<br />
            <span className="italic text-brand-400 font-normal">few ever see.</span>
          </h1>

          {/* Punchy subhead */}
          <p className="text-white/75 text-lg lg:text-xl font-light leading-relaxed max-w-xl mx-auto mb-12">
            Hidden trails. Sacred lakes. Real Nepal — by locals, for explorers.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 items-center justify-center">
            <Link
              href="/destinations"
              className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-md font-medium text-sm tracking-wide transition-all inline-flex items-center gap-3 shadow-lg shadow-brand-500/20"
            >
              Begin exploring
              <span className="text-base">→</span>
            </Link>
            <Link
              href="/plan"
              className="backdrop-blur-md bg-white/[0.08] border border-white/25 hover:border-white/50 hover:bg-white/[0.15] text-white/90 px-8 py-4 rounded-md font-medium text-sm tracking-wide transition-all"
            >
              Plan a trip
            </Link>
          </div>
        </div>

        {/* Stats row — floating bottom */}
        <div
          className="absolute bottom-16 left-0 right-0 flex items-center justify-center gap-12 lg:gap-20"
          style={{ animation: "fadeIn 1s ease-out 1.2s both" }}
        >
          <Stat number="48" label="Destinations" />
          <div className="h-10 w-px bg-white/15" />
          <Stat number="20" label="Curated Treks" />
          <div className="h-10 w-px bg-white/15" />
          <Stat number="7" label="Provinces" />
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        style={{ opacity: scrollY > 80 ? 0 : 1, transition: "opacity 0.3s" }}
      >
        <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
      </div>
    </section>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-white text-3xl lg:text-4xl">{number}</div>
      <div className="text-white/45 text-[10px] font-mono tracking-widest uppercase mt-1">
        {label}
      </div>
    </div>
  );
}
