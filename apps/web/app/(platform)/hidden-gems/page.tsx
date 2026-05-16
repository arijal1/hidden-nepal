import type { Metadata } from "next";
import Link from "next/link";
import { getHiddenGems } from "@/lib/supabase/queries/destinations";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";

export const metadata: Metadata = {
  title: "Hidden Gems — Secret Places in Nepal",
  description: "Nepal's best-kept secrets, sourced and verified by locals. Places even seasoned travelers never find.",
};

export const revalidate = 3600;

export default async function HiddenGemsPage() {
  const gems = await getHiddenGems(18);

  return (
    <div className="min-h-screen bg-base-950 pb-24">
      {/* Header */}
      <section className="pt-16 pb-12 px-5 border-b border-white/[0.06] bg-gradient-to-b from-gold-500/[0.04] to-transparent">
        <div className="container max-w-[1200px] mx-auto">
          <AnimatedSection className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 border border-gold-400/20 bg-gold-400/[0.06] rounded-full px-4 py-2 mb-6">
              <span className="text-gold-400 text-xs font-mono tracking-widest">✦ HIDDEN GEMS ENGINE</span>
            </div>
            <h1 className="text-display-lg text-white mb-4">
              Places even locals<br />
              <em className="italic text-gold-400">keep to themselves</em>
            </h1>
            <p className="text-white/40 text-base font-light leading-relaxed">
              Community-sourced discoveries, verified by local experts. No tours. No crowds. Just Nepal as it truly is.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.15} className="flex justify-center mt-8">
            <Link href="/community/submit-gem"
              className="inline-flex items-center gap-2 border border-gold-400/30 bg-gold-400/[0.08] text-gold-400 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-gold-400/[0.14] transition-colors"
            >
              ✦ Submit a Hidden Gem
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Gems grid */}
      <section className="py-14 px-5">
        <div className="container max-w-[1200px] mx-auto">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {gems.map((gem: any, i: number) => (
              <StaggerItem key={gem.id}>
                <GemCard gem={gem} index={i} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 px-5 bg-white/[0.02] border-t border-white/[0.06]">
        <div className="container max-w-[800px] mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-display-sm text-white mb-10">How the Gems Engine works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Community submits", desc: "Local guides, hikers, and travelers share undiscovered places" },
                { step: "02", title: "Experts verify", desc: "Our Nepal-based team verifies every submission on the ground" },
                { step: "03", title: "Published here", desc: "Verified gems go live with full travel info and coordinates" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <p className="text-white/15 font-display text-5xl font-medium mb-4">{item.step}</p>
                  <h3 className="text-white/80 font-semibold mb-2">{item.title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}

function GemCard({ gem, index }: { gem: any; index: number }) {
  return (
    <Link href={`/destinations/${gem.slug}`} className="block group glass-card p-5 border-gold-500/[0.1] hover:border-gold-500/25 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <span className="gem-badge">✦ Verified Gem</span>
        {gem.upvotes > 0 && (
          <span className="text-white/30 text-xs font-mono">▲ {gem.upvotes}</span>
        )}
      </div>
      <h3 className="text-white font-display font-semibold text-xl mb-2">{gem.title}</h3>
      <p className="text-white/45 text-sm leading-relaxed line-clamp-3">{gem.story}</p>
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
        <span className="text-white/25 text-xs font-mono uppercase tracking-wider">📍 {gem.region}</span>
        <span className="text-brand-400 text-xs">View →</span>
      </div>
    </Link>
  );
}
