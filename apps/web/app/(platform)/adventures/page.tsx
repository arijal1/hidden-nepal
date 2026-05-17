import type { Metadata } from "next";
import Link from "next/link";
import { getAdventures } from "@/lib/supabase/queries/adventures";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";

export const metadata: Metadata = {
  title: "Adventures in Nepal — Rafting, Paragliding, Bungee & More",
  description: "Curated adrenaline experiences: world-class rafting, paragliding over Phewa Lake, the world's 2nd-highest bungee, mountain biking, jungle safaris, and helicopter tours.",
};

export const revalidate = 1800;

const TYPE_LABELS: Record<string, string> = {
  rafting: "Rafting",
  paragliding: "Paragliding",
  bungee: "Bungee",
  mtb: "Mountain Biking",
  heli: "Helicopter",
  wildlife: "Wildlife Safari",
  climbing: "Climbing",
  zipline: "Zipline",
};

const TYPE_COLORS: Record<string, string> = {
  rafting: "#2a5d8f", paragliding: "#e9a829", bungee: "#c84630",
  mtb: "#4a7c4e", heli: "#4a6fa5", wildlife: "#7d745f",
  climbing: "#9a8f80", zipline: "#d97a3a",
};

export default async function AdventuresPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams;
  const adventures = await getAdventures({ type: params.type });

  const allTypes = Array.from(new Set((await getAdventures()).map(a => a.type)));

  return (
    <div className="min-h-screen bg-base-950 pb-24">
      <section className="pt-12 pb-10 px-5 border-b border-white/[0.06]">
        <div className="container max-w-[1200px] mx-auto">
          <AnimatedSection className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-brand-400 text-xs font-mono tracking-[0.3em] uppercase">Chapter 06 · Adventures</span>
              <div className="h-px w-16 bg-brand-500/60" />
            </div>
            <h1 className="font-display text-white leading-[1.05] tracking-[-0.01em]" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              Adrenaline,<br /><span className="italic text-brand-400 font-normal">Himalayan-scale.</span>
            </h1>
            <p className="text-white/55 text-base font-light mt-5 leading-relaxed">
              Rafting on glacier-fed rivers. Paragliding over Phewa Lake. The world's 2nd highest bungee jump. Curated by us, operated by Nepal's most experienced adventure outfits.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div className="container max-w-[1200px] mx-auto px-5 py-8">
        <div className="flex flex-wrap gap-2 mb-10">
          <Link href="/adventures" className={`text-sm px-4 py-2 rounded-full border transition-all ${!params.type ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-white/15 text-white/60 hover:border-white/40"}`}>All</Link>
          {allTypes.map(t => (
            <Link key={t} href={`/adventures?type=${t}`} className={`text-sm px-4 py-2 rounded-full border transition-all ${params.type === t ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-white/15 text-white/60 hover:border-white/40"}`}>{TYPE_LABELS[t] ?? t}</Link>
          ))}
        </div>

        {adventures.length === 0 ? (
          <p className="text-white/40 text-center py-20">No adventures found in this category.</p>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {adventures.map(adv => {
              const accent = TYPE_COLORS[adv.type] ?? "#d97a3a";
              return (
                <StaggerItem key={adv.id}>
                  <Link href={`/adventures/${adv.slug}`} className="group block rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {adv.coverImageUrl && <img src={adv.coverImageUrl} alt={adv.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/30 to-transparent" />
                      {adv.isSignature && <span className="absolute top-3 left-3 bg-brand-500/95 text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full">Signature</span>}
                      <span className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md" style={{ background: accent + "cc", color: "#fff" }}>{TYPE_LABELS[adv.type] ?? adv.type}</span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-white font-display text-xl leading-tight mb-1">{adv.name}</h3>
                      <p className="text-white/45 text-xs font-mono mb-3">{adv.locationName}</p>
                      {adv.tagline && <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-2">{adv.tagline}</p>}
                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                        <div>{adv.priceFrom && <><p className="text-white/40 text-[10px] font-mono uppercase">From</p><p className="text-white font-semibold">${adv.priceFrom}</p></>}</div>
                        <div className="text-right">{adv.durationLabel && <p className="text-white/40 text-[10px] font-mono uppercase">{adv.durationLabel}</p>}{adv.difficulty && <p className="text-white/60 text-xs capitalize">{adv.difficulty}</p>}</div>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
