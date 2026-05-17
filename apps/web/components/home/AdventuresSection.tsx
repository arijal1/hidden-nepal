import Link from "next/link";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";
import type { Adventure } from "@/lib/supabase/queries/adventures";

const TYPE_LABELS: Record<string, string> = {
  rafting: "Rafting",
  paragliding: "Paragliding",
  bungee: "Bungee",
  mtb: "Mountain Biking",
  heli: "Helicopter",
  wildlife: "Wildlife Safari",
  climbing: "Climbing",
  kayaking: "Kayaking",
  zipline: "Zipline",
  canyoning: "Canyoning",
};

const TYPE_COLORS: Record<string, string> = {
  rafting: "#2a5d8f",
  paragliding: "#e9a829",
  bungee: "#c84630",
  mtb: "#4a7c4e",
  heli: "#4a6fa5",
  wildlife: "#7d745f",
  climbing: "#9a8f80",
  kayaking: "#2a5d8f",
  zipline: "#d97a3a",
  canyoning: "#4a7c4e",
};

export function AdventuresSection({ adventures }: { adventures: Adventure[] }) {
  if (!adventures || adventures.length === 0) return null;

  return (
    <section className="py-20 px-5">
      <div className="container max-w-[1200px] mx-auto">
        <AnimatedSection className="flex items-end justify-between gap-4 flex-wrap mb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-brand-400 text-xs font-mono tracking-[0.3em] uppercase">Chapter 06 · Adventures</span>
              <div className="h-px w-16 bg-brand-500/60" />
            </div>
            <h2 className="font-display text-white leading-[1.05] tracking-[-0.01em]" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
              Adrenaline,<br />
              <span className="italic text-brand-400 font-normal">Himalayan-scale.</span>
            </h2>
            <p className="text-white/55 text-base font-light mt-5 max-w-md leading-relaxed">
              Rafting on glacier-fed rivers. Paragliding over Phewa Lake. Bungee from a 228m bridge. The world's most dramatic adventures, run by Nepal's most experienced operators.
            </p>
          </div>
          <Link href="/adventures" className="border border-white/20 hover:border-white/50 hover:bg-white/[0.04] text-white/80 px-6 py-3 rounded-md text-sm tracking-wide transition-all">
            View all adventures →
          </Link>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adventures.map((adv) => {
            const accent = TYPE_COLORS[adv.type] ?? "#d97a3a";
            return (
              <StaggerItem key={adv.id}>
                <Link
                  href={`/adventures/${adv.slug}`}
                  className="group relative block rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {adv.coverImageUrl && (
                      <img
                        src={adv.coverImageUrl}
                        alt={adv.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/30 to-transparent" />
                    {adv.isSignature && (
                      <span className="absolute top-3 left-3 bg-brand-500/95 text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full">
                        Signature
                      </span>
                    )}
                    <span
                      className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md"
                      style={{ background: accent + "cc", color: "#fff" }}
                    >
                      {TYPE_LABELS[adv.type] ?? adv.type}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-white font-display text-xl leading-tight mb-1">{adv.name}</h3>
                    <p className="text-white/45 text-xs font-mono mb-3">{adv.locationName}</p>
                    {adv.tagline && (
                      <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-2">{adv.tagline}</p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                      <div>
                        {adv.priceFrom && (
                          <>
                            <p className="text-white/40 text-[10px] font-mono uppercase">From</p>
                            <p className="text-white font-semibold">${adv.priceFrom}</p>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        {adv.durationLabel && <p className="text-white/40 text-[10px] font-mono uppercase">{adv.durationLabel}</p>}
                        {adv.difficulty && <p className="text-white/60 text-xs capitalize">{adv.difficulty}</p>}
                      </div>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
