"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";
import type { Destination } from "@/types";

export function DestinationsGrid({ destinations }: { destinations: Destination[] }) {
  return (
    <section className="py-20 px-5">
      <div className="container max-w-[1200px] mx-auto">
        <AnimatedSection className="flex items-end justify-between gap-4 flex-wrap mb-14">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-brand-400 text-xs font-mono tracking-[0.3em] uppercase">Chapter 01</span>
              <div className="h-px w-16 bg-brand-500/60" />
            </div>
            <h2 className="font-display text-white leading-[1.05] tracking-[-0.01em]" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
              Destinations<br />
              <span className="italic text-brand-400 font-normal">worth the journey.</span>
            </h2>
            <p className="text-white/55 text-base font-light mt-5 max-w-md leading-relaxed">
              Curated places that don't show up on Instagram. Yet.
            </p>
          </div>
          <Link href="/destinations" className="border border-white/20 hover:border-white/50 hover:bg-white/[0.04] text-white/80 px-6 py-3 rounded-md text-sm tracking-wide transition-all">
            View all 48 →
          </Link>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinations.map((dest, i) => (
            <StaggerItem key={dest.id}>
              <DestCard dest={dest} large={i === 0 || i === 3} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

function DestCard({ dest, large }: { dest: Destination; large: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/destinations/${dest.slug}`}
      className="destination-card group relative block rounded-2xl overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: large ? "span 2" : "span 1",
        transform: hovered ? "translateY(-5px)" : "none",
        boxShadow: hovered ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        transition: "all 0.45s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <div style={{ height: large ? 440 : 300, position: "relative" }}>
        <Image
          src={dest.coverImageUrl}
          alt={dest.name}
          fill
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 400px"
          className="object-cover destination-card-img"
        />
      </div>
      <div className="absolute inset-0 bg-card-gradient" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {dest.isHiddenGem && <span className="gem-badge mb-2 inline-block">Hidden Gem</span>}
        <p className="text-white/50 text-[10px] font-mono tracking-widest uppercase mb-1">
          {dest.province} · {dest.category}
        </p>
        <h3 className={`text-white font-display font-semibold ${large ? "text-2xl" : "text-lg"}`}>
          {dest.name}
        </h3>
        <p className="text-white/60 text-sm mt-1">{dest.tagline}</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-gold-400 text-sm">★ {dest.avgRating}</span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/40 text-xs font-mono">{dest.bestSeason?.slice(0,2).join(" & ")}</span>
        </div>
      </div>
      <motion.div
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85 }}
        className="absolute top-4 right-4 w-9 h-9 rounded-full glass-card flex items-center justify-center text-white text-base"
      >→</motion.div>
    </Link>
  );
}
