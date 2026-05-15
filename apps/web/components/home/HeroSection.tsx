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
    <section className="relative h-screen min-h-[700px] overflow-hidden flex items-center justify-center">
      {/* BG image with parallax */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${scrollY * 0.28}px) scale(1.1)` }}
      >
        <Image
          src="https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1920&q=85"
          alt="Nepal Himalayas"
          fill priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-gradient-to-r from-base-950/25 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative text-center px-5 max-w-4xl mx-auto" style={{ animation: "fadeUp 1s ease-out 0.2s both" }}>
        <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
          <span className="text-white/60 text-xs font-mono tracking-widest uppercase">Discover the real Nepal</span>
        </div>

        <h1 className="text-display-2xl text-white mb-6">
          Where the world <em className="italic text-gold-400">ends</em>
          <br />and Nepal <em className="italic">begins</em>
        </h1>

        <p className="text-white/55 text-lg font-light leading-relaxed max-w-xl mx-auto mb-10">
          AI-powered discovery of hidden gems, ancient trails, and untouched Himalayan secrets.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/explore" className="btn-primary flex items-center gap-2 px-8 py-4 text-base rounded-xl">
            <span>✦</span> Start Exploring
          </Link>
          <Link href="/plan" className="btn-ghost flex items-center gap-2 px-8 py-4 text-base rounded-xl">
            Plan My Trip →
          </Link>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float"
        style={{ opacity: scrollY > 80 ? 0 : 1, transition: "opacity 0.3s" }}>
        <span className="text-white/25 text-[10px] font-mono tracking-widest">SCROLL</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
      </div>

      {/* Location tag */}
      <div className="absolute bottom-10 right-5 text-right" style={{ animation: "fadeIn 1s ease-out 1s both" }}>
        <p className="text-white/25 text-[10px] font-mono tracking-wider uppercase">Featured</p>
        <p className="text-white/60 font-display italic text-sm mt-0.5">Annapurna Range</p>
        <p className="text-white/20 text-[10px] font-mono">28.5°N · 83.9°E</p>
      </div>
    </section>
  );
}
