import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";

export const metadata: Metadata = {
  title: "Community — Hidden Nepal",
  description: "Join the Hidden Nepal community. Submit hidden gems, write reviews, share travel stories, and connect with local guides.",
};

const ACTIONS = [
  {
    icon: "✦",
    title: "Submit a Hidden Gem",
    desc: "Know a secret waterfall, hidden lake, or undiscovered viewpoint? Share it with the community. Our team verifies every submission.",
    href: "/community/submit-gem",
    cta: "Submit a Gem",
    color: "#f4a261",
    bg: "rgba(244,162,97,0.06)",
    border: "rgba(244,162,97,0.15)",
  },
  {
    icon: "★",
    title: "Write a Review",
    desc: "Visited a destination or completed a trek? Help other travelers with an honest review. Your experience matters.",
    href: "/community/review",
    cta: "Write a Review",
    color: "#52b788",
    bg: "rgba(82,183,136,0.06)",
    border: "rgba(82,183,136,0.15)",
  },
  {
    icon: "📖",
    title: "Share Your Story",
    desc: "Write a long-form travel story with photos and an embedded map. Inspire others to discover Nepal.",
    href: "/community/stories/new",
    cta: "Write a Story",
    color: "#90e0ef",
    bg: "rgba(144,224,239,0.06)",
    border: "rgba(144,224,239,0.15)",
  },
  {
    icon: "🧭",
    title: "Become a Local Guide",
    desc: "Are you a certified Nepal guide? Get verified and connect with travelers looking for authentic local expertise.",
    href: "/community/guides/apply",
    cta: "Apply as Guide",
    color: "#f4a261",
    bg: "rgba(244,162,97,0.06)",
    border: "rgba(244,162,97,0.15)",
  },
];

const STATS = [
  { value: "3,240+", label: "Verified hidden gems" },
  { value: "18,500+", label: "Community reviews" },
  { value: "840+", label: "Local guides" },
  { value: "50,000+", label: "Active travelers" },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-base-950 pb-24">
      {/* Header */}
      <section className="pt-14 pb-12 px-5 border-b border-white/[0.06] bg-gradient-to-b from-brand-500/[0.04] to-transparent">
        <div className="container max-w-[1200px] mx-auto">
          <AnimatedSection className="max-w-2xl">
            <p className="section-label mb-4">Community</p>
            <h1 className="text-display-lg text-white mb-4">
              Nepal, built by those<br />
              <em className="italic text-brand-400">who know it best</em>
            </h1>
            <p className="text-white/40 text-base font-light leading-relaxed">
              Every hidden gem, every review, every story on this platform comes from real travelers and local experts.
              This is Nepal as it truly is — not as tourism brochures describe it.
            </p>
          </AnimatedSection>

          {/* Stats */}
          <AnimatedSection delay={0.15} className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {STATS.map((s, i) => (
              <div key={i}>
                <p className="text-white font-display text-3xl font-medium">{s.value}</p>
                <p className="text-white/35 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* Action cards */}
      <section className="py-14 px-5">
        <div className="container max-w-[1200px] mx-auto">
          <AnimatedSection className="mb-8">
            <h2 className="text-white/70 font-display text-xl">How to contribute</h2>
          </AnimatedSection>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ACTIONS.map((action, i) => (
              <StaggerItem key={i}>
                <div
                  className="rounded-2xl border p-7 hover:-translate-y-1 transition-all duration-300"
                  style={{ background: action.bg, borderColor: action.border }}
                >
                  <div className="text-3xl mb-4" style={{ color: action.color }}>{action.icon}</div>
                  <h3 className="text-white font-display font-semibold text-xl mb-2">{action.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed mb-6">{action.desc}</p>
                  <Link
                    href={action.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                    style={{ color: action.color }}
                  >
                    {action.cta} →
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Community guidelines */}
      <section className="py-10 px-5">
        <div className="container max-w-[800px] mx-auto">
          <AnimatedSection>
            <div className="glass-card p-8 text-center">
              <h2 className="text-white/70 font-display text-xl mb-3">Community Guidelines</h2>
              <p className="text-white/35 text-sm leading-relaxed mb-6">
                Our community is built on honesty and respect. We verify every gem submission, moderate all reviews, and remove anything misleading. Nepal deserves accurate information — people's safety depends on it.
              </p>
              <div className="flex flex-wrap gap-3 justify-center text-xs font-mono">
                {["Be accurate", "Be respectful", "No spam", "No self-promotion", "Credit locals"].map((rule) => (
                  <span key={rule} className="border border-white/[0.08] text-white/35 rounded-full px-3 py-1.5">{rule}</span>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
