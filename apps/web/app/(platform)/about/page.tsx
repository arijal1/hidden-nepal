import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

export const metadata: Metadata = {
  title: "About — How we curate, where data comes from",
  description: "Hidden Nepal is a curated travel platform. Here's how content is researched, where images come from, and our disclaimers.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-base-950 pb-24">
      {/* Hero */}
      <section className="pt-12 pb-10 px-5 border-b border-white/[0.06]">
        <div className="container max-w-[900px] mx-auto">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-brand-400 text-xs font-mono tracking-[0.3em] uppercase">About</span>
              <div className="h-px w-16 bg-brand-500/60" />
            </div>
            <h1 className="font-display text-white leading-[1.05] tracking-[-0.01em]" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              The Nepal we<br /><span className="italic text-brand-400 font-normal">wanted to read about.</span>
            </h1>
            <p className="text-white/55 text-base font-light mt-5 leading-relaxed max-w-2xl">
              Hidden Nepal is a curated travel platform built around a simple idea — that the most interesting Nepal isn't in the brochures. We focus on the places, people, and stories that don't show up in the first ten Google results.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div className="container max-w-[900px] mx-auto px-5 py-14 space-y-14">
        {/* Mission */}
        <AnimatedSection>
          <h2 className="text-brand-400 text-xs font-mono uppercase tracking-[0.3em] mb-4">What we're trying to do</h2>
          <div className="space-y-4 text-white/75 leading-relaxed">
            <p>Nepal punches absurdly above its weight. Eight of the world's fourteen 8,000-meter peaks. The birthplace of the Buddha. A hundred and twenty-six ethnic groups. Eight hundred and forty-seven bird species. And yet most travel writing about Nepal sticks to the same dozen destinations.</p>
            <p>This site exists to make the other ninety-nine percent of the country easier to find. Real villages. Quiet trails. Festivals that aren't on the front page. Adventure operators who've been doing it since the 1990s. The places people who live here would actually send you.</p>
          </div>
        </AnimatedSection>

        {/* How we curate */}
        <AnimatedSection>
          <h2 className="text-brand-400 text-xs font-mono uppercase tracking-[0.3em] mb-4">How we curate</h2>
          <div className="space-y-4 text-white/75 leading-relaxed">
            <p>Every destination on Hidden Nepal is researched from at least two sources: <strong className="text-white">OpenStreetMap</strong> for geographic accuracy, and either <strong className="text-white">Wikipedia</strong> or <strong className="text-white">Wikivoyage</strong> for context, history, and travel-relevant details.</p>
            <p>Our content engine scores each candidate destination on notability signals (does it have a Wikipedia article, an OpenStreetMap tourism tag, multilingual names, photographs) and only the higher-scoring ones make it onto the site. We don't fill the database with random map points just to inflate the count.</p>
            <p>Writing is drafted by Anthropic's Claude using verified source material, then reviewed and edited by us. We avoid the bland "must-visit hidden gem nestled in the breathtaking" travel-template language wherever possible.</p>
          </div>
        </AnimatedSection>

        {/* Data sources */}
        <AnimatedSection>
          <h2 className="text-brand-400 text-xs font-mono uppercase tracking-[0.3em] mb-4">Where the data comes from</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
              <p className="text-white font-medium mb-1">OpenStreetMap</p>
              <p className="text-white/55">Coordinates, elevation, place categories. © OSM contributors, ODbL-licensed.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
              <p className="text-white font-medium mb-1">Wikipedia & Wikivoyage</p>
              <p className="text-white/55">Historical and cultural context. Content under CC BY-SA 3.0.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
              <p className="text-white font-medium mb-1">Wikimedia Commons</p>
              <p className="text-white/55">All destination imagery is sourced from Wikimedia Commons under permissive licenses (CC BY, CC BY-SA, or Public Domain). Attribution preserved on each file's source.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
              <p className="text-white font-medium mb-1">Mapbox</p>
              <p className="text-white/55">Interactive maps and satellite imagery. Used under Mapbox's standard developer terms.</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Images & copyright */}
        <AnimatedSection>
          <h2 className="text-brand-400 text-xs font-mono uppercase tracking-[0.3em] mb-4">Images & copyright</h2>
          <div className="space-y-4 text-white/75 leading-relaxed">
            <p>We use only <strong className="text-white">Creative Commons-licensed</strong> photography from Wikimedia Commons, Unsplash (CC0 / Unsplash License), and contributors who explicitly grant us rights.</p>
            <p>If you believe an image on this site is used incorrectly or without proper attribution, please email <a href="mailto:hello@anuprijal.com" className="text-brand-400 hover:underline">hello@anuprijal.com</a> and we'll remove or correct it within 24 hours.</p>
          </div>
        </AnimatedSection>

        {/* Disclaimer */}
        <AnimatedSection>
          <h2 className="text-brand-400 text-xs font-mono uppercase tracking-[0.3em] mb-4">Disclaimer</h2>
          <div className="bg-gold-400/[0.05] border border-gold-400/15 rounded-xl p-5 space-y-3 text-white/70 text-sm leading-relaxed">
            <p>Hidden Nepal is an editorial travel guide, not a travel agency. Information on this site is provided for inspiration and reference. We cross-reference our sources carefully, but conditions in remote regions change quickly — roads close, permits get revised, prices shift seasonally.</p>
            <p><strong className="text-white">Before traveling</strong>, verify trail conditions, permits, and safety advisories with current sources: the Department of Tourism Nepal (tourism.gov.np), your embassy, and licensed local operators.</p>
            <p><strong className="text-white">For high-altitude treks</strong>, acclimatization is non-negotiable. Altitude sickness is real, sudden, and serious. Use a registered guide on any trek above 3,000m. Do not rely on this site as a sole source of medical or safety information.</p>
            <p>Hidden Nepal and its authors accept no liability for decisions made based on content here. Travel at your own discretion.</p>
          </div>
        </AnimatedSection>

        {/* Data collection */}
        <AnimatedSection>
          <h2 className="text-brand-400 text-xs font-mono uppercase tracking-[0.3em] mb-4">What we collect about you</h2>
          <div className="space-y-3 text-white/75 leading-relaxed text-sm">
            <p>We collect minimal data. When you create an account, we store your email and name via Clerk (our authentication provider). When you submit an inquiry for an adventure, we store the details you provide so we can respond and forward you to the appropriate operator.</p>
            <p>We use anonymous analytics to understand which pages are popular. We do not sell your data, run ad networks, or share your information with third parties beyond the operators you explicitly ask to be connected with.</p>
            <p>Email <a href="mailto:hello@anuprijal.com" className="text-brand-400 hover:underline">hello@anuprijal.com</a> to request data deletion at any time.</p>
          </div>
        </AnimatedSection>

        {/* Contact */}
        <AnimatedSection>
          <h2 className="text-brand-400 text-xs font-mono uppercase tracking-[0.3em] mb-4">Get in touch</h2>
          <div className="space-y-3 text-white/75 leading-relaxed">
            <p>Corrections, suggestions, partnership inquiries, complaints — all welcome.</p>
            <p>Email <a href="mailto:hello@anuprijal.com" className="text-brand-400 hover:underline">hello@anuprijal.com</a></p>
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection className="text-center pt-8 border-t border-white/[0.06]">
          <p className="text-white/55 mb-4">Ready to explore?</p>
          <Link href="/destinations" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-md text-sm font-medium tracking-wide transition-all">
            Browse destinations <span>→</span>
          </Link>
        </AnimatedSection>
      </div>
    </div>
  );
}
