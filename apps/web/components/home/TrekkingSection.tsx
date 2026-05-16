"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";
import { difficultyConfig } from "@/lib/utils/formatters";
import type { Trek } from "@/types";

const FEATURES = ["Offline Maps", "Permit Info", "Emergency SOS", "Elevation Profile"];

export function TrekkingSection({ treks }: { treks: Trek[] }) {
  const displayTreks = treks.length > 0 ? treks : FALLBACK_TREKS;

  return (
    <section className="py-20 px-5 bg-black/20">
      <div className="container max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-brand-400 text-xs font-mono tracking-[0.3em] uppercase">Chapter 03 · Trekking</span>
              <div className="h-px w-12 bg-brand-500/60" />
            </div>
            <h2 className="font-display text-white leading-[1.05] tracking-[-0.01em] mb-5" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
              Pick your<br />
              <span className="italic text-brand-400 font-normal">line.</span>
            </h2>
            <p className="text-white/55 text-base font-light leading-relaxed mb-8 max-w-md">
              Elevation profiles, permit info, real costs, emergency contacts. From easy day hikes to 22-day Himalayan epics.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {FEATURES.map((f) => (
                <span key={f} className="text-xs font-mono text-brand-400 border border-brand-500/25 bg-brand-500/[0.07] rounded-full px-3 py-1.5">
                  {f}
                </span>
              ))}
            </div>
            <Link href="/treks" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm rounded-xl">
              Browse All Routes →
            </Link>
          </AnimatedSection>

          {/* Right trek cards */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayTreks.slice(0, 4).map((trek, i) => (
              <StaggerItem key={trek.id ?? i}>
                <TrekCard trek={trek} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}

function TrekCard({ trek }: { trek: any }) {
  const [hovered, setHovered] = useState(false);
  const cfg = difficultyConfig[trek.difficulty as keyof typeof difficultyConfig] ?? difficultyConfig.moderate;

  return (
    <Link href={`/treks/${trek.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="block glass-card p-5 hover:-translate-y-1 hover:border-white/15 transition-all duration-300"
    >
      <div className="text-2xl mb-3">{trek.icon ?? "🏔️"}</div>
      <h3 className="text-white font-display font-semibold text-base mb-2">{trek.name}</h3>
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        <span className="text-white/40">{trek.durationDays ?? trek.days} days</span>
        <span className="text-white/20">·</span>
        <span style={{ color: cfg.color }}>{cfg.label}</span>
        <span className="text-white/20">·</span>
        <span className="text-white/40">↑ {trek.maxElevationM?.toLocaleString() ?? trek.elevation}m</span>
      </div>
      <div className="mt-3 h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-gradient rounded-full transition-all duration-500"
          style={{ width: hovered ? "100%" : "35%" }}
        />
      </div>
    </Link>
  );
}

const FALLBACK_TREKS = [
  { id: 1, slug: "everest-base-camp", name: "EBC Trek", durationDays: 14, difficulty: "strenuous", maxElevationM: 5364, icon: "🏔️" },
  { id: 2, slug: "annapurna-base-camp", name: "Annapurna BC", durationDays: 11, difficulty: "moderate", maxElevationM: 4130, icon: "⛰️" },
  { id: 3, slug: "manaslu-circuit", name: "Manaslu Circuit", durationDays: 16, difficulty: "strenuous", maxElevationM: 5160, icon: "🗻" },
  { id: 4, slug: "annapurna-circuit", name: "Annapurna Circuit", durationDays: 18, difficulty: "strenuous", maxElevationM: 5416, icon: "🏕️" },
];
