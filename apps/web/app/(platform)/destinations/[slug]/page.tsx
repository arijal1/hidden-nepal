// app/(platform)/destinations/[slug]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDestinationBySlug, getAllDestinationSlugs } from "@/lib/supabase/queries/destinations";
import { getDestinationMetadata } from "@/lib/seo/metadata";
import { destinationSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { DestinationHero } from "@/components/destinations/DestinationHero";
import { HowToReach } from "@/components/destinations/HowToReach";
import { NearbyAttractions } from "@/components/destinations/NearbyAttractions";
import { WeatherWidget } from "@/components/destinations/WeatherWidget";
import { ReviewsSection } from "@/components/destinations/ReviewsSection";
import { DestinationGallery } from "@/components/destinations/DestinationGallery";
import { DestinationMap } from "@/components/destinations/DestinationMap";
import { SaveButton } from "@/components/destinations/SaveButton";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { difficultyConfig, isBestSeason } from "@/lib/utils/formatters";

// ─── Static Generation ────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await getAllDestinationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const destination = await getDestinationBySlug((await params).slug);
  if (!destination) return {};
  return getDestinationMetadata(destination);
}

// ─── Page ─────────────────────────────────────────────────────

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const destination = await getDestinationBySlug((await params).slug);
  if (!destination) notFound();

  const inSeason = isBestSeason((destination as any).best_season ?? destination.bestSeason);

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(destinationSchema(destination)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: "https://hiddennepal.com" },
              { name: "Destinations", url: "https://hiddennepal.com/destinations" },
              { name: destination.name, url: `https://hiddennepal.com/destinations/${destination.slug}` },
            ])
          ),
        }}
      />

      <main className="min-h-screen bg-base-950">

        {/* ── Hero ─────────────────────────────────────────── */}
        <DestinationHero destination={destination} />

        {/* ── Content ──────────────────────────────────────── */}
        <div className="container max-w-[1200px] mx-auto px-5 pb-24">

          {/* Quick stats bar */}
          <AnimatedSection>
            <div className="flex flex-wrap items-center gap-6 py-8 border-b border-white/[0.06]">
              {destination.elevationM && (
                <StatItem icon="↑" label="Elevation" value={`${destination.elevationM.toLocaleString()}m`} />
              )}
              <StatItem icon="⭐" label="Rating" value={`${destination.avgRating} (${destination.reviewCount} reviews)`} />
              <StatItem icon="🗓" label="Best Season" value={(destination as any).best_season ?? destination.bestSeason.join(", ")} />
              <StatItem icon="📍" label="Province" value={destination.province} />
              {inSeason && (
                <span className="ml-auto flex items-center gap-2 text-brand-400 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
                  Currently in season
                </span>
              )}
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">

            {/* ── Main Column ─────────────────────────────── */}
            <div className="lg:col-span-2 space-y-16">

              {/* About */}
              <AnimatedSection>
                <SectionHeader label="About" title={`Why visit ${destination.name}`} />
                <p className="text-white/60 text-[16px] leading-relaxed mt-4 font-light">
                  {destination.description}
                </p>
                {destination.highlights && destination.highlights.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                    {destination.highlights.map((highlight, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                      >
                        <span className="text-brand-400 text-lg mt-0.5">◈</span>
                        <span className="text-white/70 text-sm leading-relaxed">{highlight}</span>
                      </div>
                    ))}
                  </div>
                )}
              </AnimatedSection>

              {/* Gallery */}
              {destination.galleryUrls?.length > 0 && (
                <AnimatedSection delay={0.1}>
                  <SectionHeader label="Gallery" title="Photos" />
                  <DestinationGallery
                    images={destination.galleryUrls}
                    coverImage={destination.coverImageUrl}
                    name={destination.name}
                  />
                </AnimatedSection>
              )}

              {/* Map */}
              <AnimatedSection delay={0.1}>
                <SectionHeader label="Location" title="Where is it?" />
                <DestinationMap
                  coordinates={destination.coordinates}
                  name={destination.name}
                />
              </AnimatedSection>

              {/* How To Reach */}
              <AnimatedSection delay={0.15}>
                <SectionHeader
                  label="Transport"
                  title="How to get there"
                  description={`All transport options from major cities to ${destination.name}`}
                />
                <HowToReach routes={destination.transportRoutes ?? []} />
              </AnimatedSection>

              {/* Reviews */}
              <AnimatedSection delay={0.15}>
                <SectionHeader
                  label="Reviews"
                  title={`What travelers say (${destination.reviewCount})`}
                />
                <ReviewsSection
                  destinationId={destination.id}
                  destinationName={destination.name}
                />
              </AnimatedSection>

              {/* Warnings */}
              {destination.warnings && destination.warnings.length > 0 && (
                <AnimatedSection delay={0.2}>
                  <div className="p-6 rounded-2xl bg-gold-500/[0.06] border border-gold-500/20">
                    <h3 className="text-gold-400 font-mono text-xs tracking-widest uppercase mb-4">
                      ⚠ Travel Notes
                    </h3>
                    <ul className="space-y-3">
                      {destination.warnings.map((warning, i) => (
                        <li key={i} className="flex items-start gap-3 text-white/60 text-sm">
                          <span className="text-gold-400 mt-0.5 shrink-0">·</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              )}
            </div>

            {/* ── Sidebar ──────────────────────────────────── */}
            <aside className="space-y-6">

              {/* Save / Plan CTA */}
              <AnimatedSection>
                <div className="glass-card p-6 space-y-4">
                  <SaveButton destinationId={destination.id} destinationName={destination.name} />
                  <a
                    href={`/plan?destination=${destination.slug}`}
                    className="btn-ghost flex items-center justify-center gap-2 w-full text-sm"
                  >
                    ✦ Plan a trip here
                  </a>
                </div>
              </AnimatedSection>

              {/* Weather */}
              <AnimatedSection delay={0.1}>
                <WeatherWidget
                  lat={destination.coordinates.lat}
                  lng={destination.coordinates.lng}
                  elevationM={destination.elevationM}
                  name={destination.name}
                />
              </AnimatedSection>

              {/* Quick Facts */}
              <AnimatedSection delay={0.1}>
                <div className="glass-card p-6">
                  <h3 className="section-label mb-4">Quick Facts</h3>
                  <dl className="space-y-3">
                    <FactRow label="Category" value={capitalize(destination.category.replace("_", " "))} />
                    <FactRow label="Province" value={destination.province} />
                    {destination.elevationM && (
                      <FactRow label="Elevation" value={`${destination.elevationM.toLocaleString()}m / ${Math.round(destination.elevationM * 3.281).toLocaleString()}ft`} />
                    )}
                    <FactRow label="Best Season" value={(destination as any).best_season ?? destination.bestSeason.join(", ")} />
                    {destination.isHiddenGem && (
                      <FactRow label="Type" value="✦ Hidden Gem" valueClass="text-gold-400" />
                    )}
                  </dl>
                </div>
              </AnimatedSection>

              {/* Tags */}
              {destination.tags?.length > 0 && (
                <AnimatedSection delay={0.15}>
                  <div className="glass-card p-6">
                    <h3 className="section-label mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {destination.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-mono text-white/40 border border-white/[0.08] rounded-full px-3 py-1 hover:border-brand-500/40 hover:text-brand-400 cursor-pointer transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              )}
            </aside>
          </div>

          {/* Nearby */}
          <AnimatedSection delay={0.2} className="mt-20">
            <SectionHeader label="Explore More" title="Nearby destinations" />
            <NearbyAttractions
              lat={destination.coordinates.lat}
              lng={destination.coordinates.lng}
              excludeId={destination.id}
            />
          </AnimatedSection>

        </div>
      </main>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function SectionHeader({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <p className="section-label mb-2">{label}</p>
      <h2 className="text-display-sm text-white">{title}</h2>
      {description && (
        <p className="text-white/40 text-sm mt-2 font-light">{description}</p>
      )}
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base">{icon}</span>
      <div>
        <span className="text-white/30 text-xs font-mono tracking-wider uppercase block">
          {label}
        </span>
        <span className="text-white/80 text-sm">{value}</span>
      </div>
    </div>
  );
}

function FactRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-start gap-4">
      <dt className="text-white/30 text-xs font-mono uppercase tracking-wider shrink-0">
        {label}
      </dt>
      <dd className={`text-sm text-right ${valueClass ?? "text-white/70"}`}>
        {value}
      </dd>
    </div>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
