"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <section className="relative h-screen min-h-[720px] overflow-hidden flex items-center">
      {/* BG image */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${scrollY * 0.25}px) scale(1.08)` }}
      >
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Annapurna_South_from_ABC.jpg/2000px-Annapurna_South_from_ABC.jpg"
          alt="Annapurna South from Annapurna Base Camp"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Warm cinematic overlays */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,20,25,0.45) 0%, rgba(15,20,25,0.25) 40%, rgba(15,20,25,0.9) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(15,20,25,0.7) 0%, transparent 50%)",
        }}
      />

      {/* Content — left-aligned editorial */}
      <div className="relative w-full px-6 lg:px-16 max-w-[1440px] mx-auto">
        <div
          className="max-w-3xl"
          style={{ animation: "fadeUp 1.2s cubic-bezier(0.22,1,0.36,1) 0.2s both" }}
        >
          {/* Nepali greeting + meta */}
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px w-12 bg-brand-500" />
            <span className="text-brand-400 text-xs font-mono tracking-[0.3em] uppercase">
              नमस्ते · Welcome
            </span>
          </div>

          {/* Big editorial headline */}
          <h1 className="font-display text-white leading-[0.95] tracking-[-0.02em] mb-8" style={{ fontSize: "clamp(3rem, 7vw, 7rem)" }}>
            The Nepal<br />
            <span className="text-brand-400 italic font-normal">nobody</span> told<br />
            you about.
          </h1>

          {/* Subhead — specific, not generic */}
          <p className="text-white/65 text-base lg:text-lg font-light leading-relaxed max-w-xl mb-10">
            Forty-eight hand-picked places. Twenty curated treks. Sacred lakes only locals know the names of, villages frozen in 1820, and Himalayan passes the guidebooks missed.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 items-center">
            <Link
              href="/destinations"
              className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-md font-medium text-sm tracking-wide transition-colors inline-flex items-center gap-3"
            >
              Begin exploring
              <span className="text-base">→</span>
            </Link>
            <Link
              href="/plan"
              className="border border-white/25 hover:border-white/60 hover:bg-white/[0.04] text-white/85 px-8 py-4 rounded-md font-medium text-sm tracking-wide transition-all"
            >
              Plan an itinerary
            </Link>
          </div>

          {/* Stats strip below CTAs */}
          <div className="flex gap-10 mt-16 pt-8 border-t border-white/10 max-w-lg">
            <Stat number="48" label="Destinations" />
            <Stat number="20" label="Curated treks" />
            <Stat number="7" label="Provinces" />
          </div>
        </div>
      </div>

      {/* Location tag — bottom right */}
      <div
        className="absolute bottom-8 right-6 lg:right-16 text-right hidden sm:block"
        style={{ animation: "fadeIn 1s ease-out 1.2s both" }}
      >
        <p className="text-white/30 text-[10px] font-mono tracking-widest uppercase mb-1">Cover image</p>
        <p className="text-white/70 font-display italic text-sm">Annapurna South · 7,219m</p>
        <p className="text-white/25 text-[10px] font-mono mt-0.5">28.5°N · 83.9°E</p>
      </div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity: scrollY > 80 ? 0 : 1, transition: "opacity 0.3s" }}
      >
        <span className="text-white/30 text-[10px] font-mono tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
      </div>
    </section>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="font-display text-white text-3xl lg:text-4xl">{number}</div>
      <div className="text-white/40 text-[10px] font-mono tracking-widest uppercase mt-1">
        {label}
      </div>
    </div>
  );
}
