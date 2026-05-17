import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAdventure } from "@/lib/supabase/queries/adventures";
import { InquiryForm } from "@/components/adventures/InquiryForm";

export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const adv = await getAdventure(slug);
  if (!adv) return { title: "Adventure not found" };
  return {
    title: adv.seoTitle ?? `${adv.name} — Hidden Nepal`,
    description: adv.seoDescription ?? adv.tagline,
    openGraph: { images: adv.coverImageUrl ? [adv.coverImageUrl] : [] },
  };
}

const TYPE_LABELS: Record<string, string> = {
  rafting: "Rafting", paragliding: "Paragliding", bungee: "Bungee",
  mtb: "Mountain Biking", heli: "Helicopter", wildlife: "Wildlife Safari",
  climbing: "Climbing", zipline: "Zipline",
};

export default async function AdventureDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const adv = await getAdventure(slug);
  if (!adv) notFound();

  return (
    <div className="min-h-screen bg-base-950">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[450px]">
        {adv.coverImageUrl && (
          <img src={adv.coverImageUrl} alt={adv.name} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/40 to-base-950/30" />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-10">
          <div className="container max-w-[1200px] mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-brand-500/95 text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full">
                {TYPE_LABELS[adv.type] ?? adv.type}
              </span>
              {adv.isSignature && (
                <span className="bg-white/15 text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md">
                  Signature
                </span>
              )}
              {adv.difficulty && (
                <span className="bg-white/15 text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md capitalize">
                  {adv.difficulty}
                </span>
              )}
            </div>
            <h1 className="font-display text-white leading-[1.05] tracking-[-0.01em] mb-3" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
              {adv.name}
            </h1>
            <p className="text-white/65 text-sm">{adv.locationName} · {adv.province}</p>
          </div>
        </div>
      </section>

      <div className="container max-w-[1200px] mx-auto px-5 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {adv.tagline && (
              <p className="font-display text-white/85 text-2xl leading-tight italic">"{adv.tagline}"</p>
            )}
            {adv.description && (
              <div className="text-white/70 text-base leading-relaxed whitespace-pre-line">{adv.description}</div>
            )}

            {adv.highlights.length > 0 && (
              <section>
                <h2 className="text-brand-400 text-xs font-mono uppercase tracking-[0.3em] mb-4">Highlights</h2>
                <ul className="space-y-2">
                  {adv.highlights.map((h, i) => (
                    <li key={i} className="flex gap-3 text-white/75 text-sm">
                      <span className="text-brand-400 mt-0.5">✦</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adv.whatsIncluded.length > 0 && (
                <section className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                  <h3 className="text-emerald-400 text-xs font-mono uppercase tracking-widest mb-3">Included</h3>
                  <ul className="space-y-1.5">
                    {adv.whatsIncluded.map((x, i) => (
                      <li key={i} className="text-white/70 text-sm flex gap-2">
                        <span className="text-emerald-400">✓</span><span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {adv.whatsExcluded.length > 0 && (
                <section className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                  <h3 className="text-white/50 text-xs font-mono uppercase tracking-widest mb-3">Not Included</h3>
                  <ul className="space-y-1.5">
                    {adv.whatsExcluded.map((x, i) => (
                      <li key={i} className="text-white/55 text-sm flex gap-2">
                        <span className="text-white/30">·</span><span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {adv.whatToBring.length > 0 && (
              <section>
                <h2 className="text-brand-400 text-xs font-mono uppercase tracking-[0.3em] mb-4">What to bring</h2>
                <div className="flex flex-wrap gap-2">
                  {adv.whatToBring.map((x, i) => (
                    <span key={i} className="text-white/65 text-sm bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5">{x}</span>
                  ))}
                </div>
              </section>
            )}

            {adv.warnings.length > 0 && (
              <section className="bg-gold-400/[0.06] border border-gold-400/20 rounded-2xl p-5">
                <h3 className="text-gold-400 text-xs font-mono uppercase tracking-widest mb-2">Good to know</h3>
                <ul className="space-y-1.5">
                  {adv.warnings.map((w, i) => (
                    <li key={i} className="text-white/70 text-sm flex gap-2"><span className="text-gold-400">⚠</span><span>{w}</span></li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar — pricing + CTA (sticky) */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-5">
            <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-6">
              {adv.priceFrom && (
                <div className="mb-5">
                  <p className="text-white/45 text-[10px] font-mono uppercase tracking-widest mb-1">From</p>
                  <p className="font-display text-white text-4xl leading-none">${adv.priceFrom}<span className="text-white/40 text-base font-mono ml-2">{adv.currency}</span></p>
                  {adv.priceTo && adv.priceTo > adv.priceFrom && (
                    <p className="text-white/45 text-sm mt-1">up to ${adv.priceTo}</p>
                  )}
                  {adv.priceNote && <p className="text-white/45 text-xs mt-2">{adv.priceNote}</p>}
                </div>
              )}

              <InquiryForm adventureId={adv.id} adventureName={adv.name} buttonClassName="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-md text-sm font-medium tracking-wide transition-all flex items-center justify-center gap-2" />

              <div className="mt-5 pt-5 border-t border-white/[0.08] space-y-3">
                {adv.durationLabel && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/45">Duration</span>
                    <span className="text-white">{adv.durationLabel}</span>
                  </div>
                )}
                {adv.difficulty && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/45">Difficulty</span>
                    <span className="text-white capitalize">{adv.difficulty}</span>
                  </div>
                )}
                {adv.bestSeason.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/45">Best season</span>
                    <span className="text-white text-right">{adv.bestSeason.join(", ")}</span>
                  </div>
                )}
                {adv.minAge !== undefined && adv.minAge !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/45">Min age</span>
                    <span className="text-white">{adv.minAge}+</span>
                  </div>
                )}
                {adv.groupSizeMin && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/45">Group size</span>
                    <span className="text-white">{adv.groupSizeMin}{adv.groupSizeMax ? `–${adv.groupSizeMax}` : "+"}</span>
                  </div>
                )}
              </div>
            </div>

            {adv.operatorName && (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-2">Operated by</p>
                <p className="text-white font-medium">{adv.operatorName}</p>
                {adv.operatorPhone && <p className="text-white/55 text-sm mt-1">{adv.operatorPhone}</p>}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
