import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTreks } from "@/lib/supabase/queries/treks";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";
import { difficultyConfig } from "@/lib/utils/formatters";
import type { TrekDifficulty } from "@/types";

export const metadata: Metadata = {
  title: "Trekking Routes in Nepal",
  description: "Complete guide to Nepal's best trekking routes. EBC, Annapurna Circuit, Manaslu, and dozens more. Permits, elevation profiles, difficulty ratings.",
};

export const revalidate = 86400;

const DIFFICULTIES: { value: TrekDifficulty | "all"; label: string }[] = [
  { value: "all", label: "All Levels" },
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "strenuous", label: "Strenuous" },
  { value: "extreme", label: "Extreme" },
];

export default async function TreksPage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: TrekDifficulty }>;
}) {
  const sp = await searchParams;
  const treks = await getTreks(sp.difficulty, 24);
  const active = sp.difficulty ?? "all";

  return (
    <div className="min-h-screen bg-base-950 pb-24">
      {/* Header */}
      <section className="border-b border-white/[0.06] pt-12 pb-10 px-5">
        <div className="container max-w-[1200px] mx-auto">
          <AnimatedSection>
            <p className="section-label mb-3">◈ Trekking Routes</p>
            <h1 className="text-display-lg text-white mb-2">
              Nepal's trails<br />
              <em className="italic text-white/35">from valley floor to glacier</em>
            </h1>
            <p className="text-white/40 text-sm max-w-md mt-3">
              Every major route with elevation profiles, permit info, emergency contacts, and offline maps.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className="flex gap-2 flex-wrap mt-8">
            {DIFFICULTIES.map((d) => (
              <Link
                key={d.value}
                href={d.value === "all" ? "/treks" : `/treks?difficulty=${d.value}`}
                className={`px-4 py-2 rounded-full border text-sm transition-all duration-200 ${
                  active === d.value
                    ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                    : "border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white/80"
                }`}
              >
                {d.label}
              </Link>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* Trek cards */}
      <section className="px-5 py-12">
        <div className="container max-w-[1200px] mx-auto">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {treks.map((trek) => (
              <StaggerItem key={trek.id}>
                <TrekCard trek={trek} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Permit info strip */}
      <section className="px-5">
        <div className="container max-w-[1200px] mx-auto">
          <div className="p-8 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <h3 className="text-white font-display text-xl mb-4">Trekking Permits in Nepal</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "TIMS Card", cost: "$20 USD", desc: "Required for all trekking areas. Available in Kathmandu & Pokhara." },
                { name: "National Park Entry", cost: "$30–100 USD", desc: "Sagarmatha, Annapurna, Manaslu, Langtang, etc. Zone-dependent." },
                { name: "Restricted Area Permit", cost: "$100+/week", desc: "Required for Mustang, Manaslu, Dolpo. Must book through agent." },
              ].map((permit) => (
                <div key={permit.name} className="flex gap-3">
                  <span className="text-brand-400 text-lg mt-0.5 shrink-0">◈</span>
                  <div>
                    <p className="text-white/80 text-sm font-medium">{permit.name}</p>
                    <p className="text-brand-400 text-xs font-mono mt-0.5">{permit.cost}</p>
                    <p className="text-white/35 text-xs mt-1 leading-relaxed">{permit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TrekCard({ trek }: { trek: any }) {
  const cfg = difficultyConfig[trek.difficulty as TrekDifficulty] ?? difficultyConfig.moderate;

  return (
    <Link href={`/treks/${trek.slug}`}
      className="group block rounded-2xl overflow-hidden border border-white/[0.07] hover:border-white/15 hover:-translate-y-1 transition-all duration-350 shadow-card"
    >
      <div className="relative h-48">
        <Image
          src={trek.coverImageUrl}
          alt={trek.name}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-card-gradient" />
        <div
          className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border"
          style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
        >
          {cfg.label}
        </div>
      </div>
      <div className="p-5 bg-white/[0.02]">
        <h3 className="text-white font-display font-semibold text-lg mb-3">{trek.name}</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Days" value={trek.durationDays} />
          <Stat label="Max Elev" value={`${trek.maxElevationM?.toLocaleString()}m`} />
          <Stat label="Distance" value={`${trek.distanceKm}km`} />
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
          <span className="text-white/30 text-xs font-mono">
            {trek.permitRequired ? "🎫 Permit required" : "✓ No special permit"}
          </span>
          <span className="text-brand-400 text-sm group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-white/25 text-[9px] font-mono uppercase tracking-wider">{label}</p>
      <p className="text-white/70 text-sm font-mono mt-0.5">{value}</p>
    </div>
  );
}
