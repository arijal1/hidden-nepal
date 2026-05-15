import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTrekBySlug, getAllTrekSlugs } from "@/lib/supabase/queries/treks";
import { getTrekMetadata } from "@/lib/seo/metadata";
import { trekSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { difficultyConfig, formatDuration, formatNPR } from "@/lib/utils/formatters";
import { ElevationChart } from "@/components/treks/ElevationChart";
import { StageCards } from "@/components/treks/StageCards";

export async function generateStaticParams() {
  const slugs = await getAllTrekSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const trek = await getTrekBySlug((await params).slug);
  if (!trek) return {};
  return getTrekMetadata(trek);
}

export default async function TrekDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const trek = await getTrekBySlug((await params).slug);
  if (!trek) notFound();

  const cfg = difficultyConfig[trek.difficulty];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(trekSchema(trek)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbSchema([
          { name: "Home", url: "https://hiddennepal.com" },
          { name: "Treks", url: "https://hiddennepal.com/treks" },
          { name: trek.name, url: `https://hiddennepal.com/treks/${trek.slug}` },
        ]))
      }} />

      <main className="min-h-screen bg-base-950">
        {/* Hero */}
        <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
          <Image src={trek.coverImageUrl} alt={trek.name} fill priority sizes="100vw" className="object-cover scale-105" />
          <div className="absolute inset-0 bg-hero-gradient" />
          <div className="absolute bottom-0 left-0 right-0 p-8 container max-w-[1200px] mx-auto">
            {/* Breadcrumb */}
            <nav className="flex gap-2 text-white/30 text-xs font-mono uppercase tracking-wider mb-6">
              <Link href="/" className="hover:text-white/60">Home</Link>
              <span>/</span>
              <Link href="/treks" className="hover:text-white/60">Treks</Link>
              <span>/</span>
              <span className="text-white/60">{trek.name}</span>
            </nav>
            <div
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full border mb-4"
              style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
            >
              {cfg.label}
            </div>
            <h1 className="text-display-xl text-white mb-3">{trek.name}</h1>
            <div className="flex flex-wrap gap-6 text-sm font-mono">
              <span className="text-white/50">📅 {trek.durationDays} days</span>
              <span className="text-white/50">↑ {trek.maxElevationM?.toLocaleString()}m max</span>
              <span className="text-white/50">📏 {trek.distanceKm}km</span>
              <span className="text-white/50">🚩 {trek.startPoint} → {trek.endPoint}</span>
            </div>
          </div>
        </div>

        <div className="container max-w-[1200px] mx-auto px-5 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main */}
            <div className="lg:col-span-2 space-y-14">
              {/* About */}
              <AnimatedSection>
                <SectionLabel>About</SectionLabel>
                <p className="text-white/55 text-base leading-relaxed font-light mt-4">{trek.description}</p>
                {trek.highlights?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                    {trek.highlights.map((h: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <span className="text-brand-400 shrink-0">◈</span>
                        <span className="text-white/65 text-sm">{h}</span>
                      </div>
                    ))}
                  </div>
                )}
              </AnimatedSection>

              {/* Elevation Profile */}
              {trek.elevationProfile?.length > 0 && (
                <AnimatedSection delay={0.1}>
                  <SectionLabel>Elevation Profile</SectionLabel>
                  <ElevationChart profile={trek.elevationProfile} />
                </AnimatedSection>
              )}

              {/* Stages */}
              {trek.stages?.length > 0 && (
                <AnimatedSection delay={0.1}>
                  <SectionLabel>Day-by-Day Stages</SectionLabel>
                  <StageCards stages={trek.stages} />
                </AnimatedSection>
              )}

              {/* Packing list */}
              {trek.packingList?.length > 0 && (
                <AnimatedSection delay={0.15}>
                  <SectionLabel>Packing List</SectionLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                    {trek.packingList.map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-white/50 text-sm">
                        <span className="text-brand-400 text-xs shrink-0">✓</span> {item}
                      </div>
                    ))}
                  </div>
                </AnimatedSection>
              )}

              {/* Emergency */}
              {trek.emergencyContacts?.length > 0 && (
                <AnimatedSection delay={0.2}>
                  <div className="p-6 rounded-2xl border border-gold-500/20 bg-gold-500/[0.04]">
                    <h3 className="text-gold-400 text-xs font-mono tracking-widest uppercase mb-4">⚠ Emergency Contacts</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {trek.emergencyContacts.map((c: any, i: number) => (
                        <div key={i}>
                          <p className="text-white/70 text-sm font-medium">{c.name}</p>
                          <p className="text-brand-400 text-sm font-mono mt-0.5">{c.phone}</p>
                          <p className="text-white/30 text-xs capitalize mt-0.5">{c.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-5">
              <AnimatedSection>
                {/* Quick stats */}
                <div className="glass-card p-6">
                  <h3 className="section-label mb-4">Quick Stats</h3>
                  <dl className="space-y-3">
                    <FactRow label="Duration" value={`${trek.durationDays} days`} />
                    <FactRow label="Max Elevation" value={`${trek.maxElevationM?.toLocaleString()}m`} />
                    <FactRow label="Distance" value={`${trek.distanceKm}km`} />
                    <FactRow label="Difficulty" value={cfg.label} valueStyle={{ color: cfg.color }} />
                    <FactRow label="Start" value={trek.startPoint} />
                    <FactRow label="End" value={trek.endPoint} />
                  </dl>
                </div>
              </AnimatedSection>

              {/* Permits */}
              <AnimatedSection delay={0.1}>
                <div className="glass-card p-6">
                  <h3 className="section-label mb-4">Permits</h3>
                  {trek.permitRequired ? (
                    <>
                      <p className="text-gold-400 text-sm mb-3">🎫 Permit required</p>
                      {trek.permitCostUsd && (
                        <p className="text-white/70 text-sm mb-2">~${trek.permitCostUsd} USD total</p>
                      )}
                      {trek.permitInfo && (
                        <p className="text-white/40 text-xs leading-relaxed">{trek.permitInfo}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-brand-400 text-sm">✓ No restricted area permit needed</p>
                  )}
                </div>
              </AnimatedSection>

              {/* Best season */}
              <AnimatedSection delay={0.1}>
                <div className="glass-card p-6">
                  <h3 className="section-label mb-4">Best Seasons</h3>
                  <div className="flex flex-wrap gap-2">
                    {trek.bestSeason?.map((s: string) => (
                      <span key={s} className="text-xs font-mono text-brand-400 border border-brand-500/25 bg-brand-500/[0.07] rounded-full px-3 py-1">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              {/* CTA */}
              <AnimatedSection delay={0.15}>
                <Link href={`/plan?trek=${trek.slug}`} className="btn-primary w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm">
                  ✦ Plan This Trek
                </Link>
              </AnimatedSection>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="section-label">{children}</p>;
}

function FactRow({ label, value, valueStyle }: { label: string; value: string; valueStyle?: React.CSSProperties }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-white/25 text-xs font-mono uppercase tracking-wider shrink-0">{label}</dt>
      <dd className="text-white/70 text-sm text-right" style={valueStyle}>{value}</dd>
    </div>
  );
}
