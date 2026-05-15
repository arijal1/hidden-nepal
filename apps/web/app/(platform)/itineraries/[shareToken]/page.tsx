import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

async function getItinerary(shareToken: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("itineraries")
    .select("*")
    .eq("share_token", shareToken)
    .eq("is_public", true)
    .single();
  return data;
}

export async function generateMetadata({ params }: { params: { shareToken: string } }): Promise<Metadata> {
  const itinerary = await getItinerary(params.shareToken);
  if (!itinerary) return {};
  return {
    title: itinerary.title ?? `${itinerary.days}-Day Nepal Itinerary`,
    description: `A ${itinerary.days}-day ${itinerary.travel_style} Nepal itinerary generated with Hidden Nepal AI Planner.`,
  };
}

export default async function SharedItineraryPage({ params }: { params: { shareToken: string } }) {
  const itinerary = await getItinerary(params.shareToken);
  if (!itinerary) notFound();

  const plan = itinerary.generated_plan;

  return (
    <div className="min-h-screen bg-base-950 pb-24">
      {/* Header */}
      <section className="pt-14 pb-10 px-5 border-b border-white/[0.06] bg-gradient-to-b from-brand-500/[0.05] to-transparent">
        <div className="container max-w-[800px] mx-auto text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 border border-brand-500/25 bg-brand-500/[0.07] rounded-full px-4 py-2 mb-5">
              <span className="text-brand-400 text-xs font-mono tracking-wider">✦ AI GENERATED ITINERARY</span>
            </div>
            <h1 className="text-display-lg text-white mb-3">{plan?.title ?? `${itinerary.days}-Day Nepal Journey`}</h1>
            <p className="text-white/40 text-base font-light">{plan?.summary}</p>

            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <Badge label={`${itinerary.days} days`} icon="📅" />
              <Badge label={`$${itinerary.budget_usd} budget`} icon="💰" />
              <Badge label={itinerary.travel_style ?? ""} icon="🎒" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      <div className="container max-w-[800px] mx-auto px-5 py-12 space-y-6">
        {/* Budget breakdown */}
        {plan?.totalBudgetBreakdown && (
          <AnimatedSection>
            <div className="glass-card p-6">
              <p className="section-label mb-4">Budget Breakdown</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(plan.totalBudgetBreakdown).map(([k, v]: [string, any]) => (
                  <div key={k} className="text-center">
                    <p className="text-white/25 text-[10px] font-mono uppercase tracking-wider capitalize">{k}</p>
                    <p className="text-white/75 text-lg font-display mt-1">${v}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Days */}
        {plan?.days?.map((day: any, i: number) => (
          <AnimatedSection key={i} delay={i * 0.06}>
            <div className="glass-card overflow-hidden">
              <div className="p-5 border-b border-white/[0.06] flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center text-brand-400 font-mono font-bold text-sm shrink-0">
                  {day.day}
                </div>
                <div>
                  <p className="text-white/80 font-medium">{day.location}</p>
                  <p className="text-white/35 text-xs italic">{day.theme}</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {/* Activities */}
                <div className="space-y-3">
                  {day.activities?.map((act: any, j: number) => (
                    <div key={j} className="flex gap-3">
                      <span className="text-white/25 text-xs font-mono w-12 shrink-0 mt-0.5">{act.time}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white/75 text-sm">{act.title}</p>
                          {act.hiddenGem && <span className="gem-badge text-[7px]">Gem</span>}
                        </div>
                        <p className="text-white/35 text-xs mt-0.5">{act.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Accommodation */}
                {day.accommodation && (
                  <div className="flex items-center gap-2 pt-3 border-t border-white/[0.05] text-xs text-white/35 font-mono">
                    <span>🏨</span>
                    <span>{day.accommodation.name} · ~${day.accommodation.estimatedCostUsd}/night</span>
                  </div>
                )}
              </div>
            </div>
          </AnimatedSection>
        ))}

        {/* Permits */}
        {plan?.permits?.length > 0 && (
          <AnimatedSection>
            <div className="glass-card p-6">
              <p className="section-label mb-4">Permits Required</p>
              <div className="space-y-3">
                {plan.permits.map((p: any, i: number) => (
                  <div key={i} className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-white/70 text-sm">{p.name}</p>
                      <p className="text-white/30 text-xs mt-0.5">{p.whereToGet}</p>
                    </div>
                    <span className="text-brand-400 text-sm font-mono shrink-0">{p.cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* CTA */}
        <AnimatedSection>
          <div className="text-center py-6 border border-dashed border-white/[0.08] rounded-2xl">
            <p className="text-white/40 text-sm mb-4">Want a personalised itinerary like this?</p>
            <Link href="/plan" className="btn-primary px-8 py-3 rounded-xl text-sm inline-flex items-center gap-2">
              <span>✦</span> Build My Own Itinerary
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}

function Badge({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 glass-card rounded-full px-3 py-1.5 text-xs text-white/60 font-mono capitalize">
      {icon} {label}
    </span>
  );
}
