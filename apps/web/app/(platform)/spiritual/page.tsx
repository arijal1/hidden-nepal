import type { Metadata } from "next";
import Link from "next/link";
import { getDestinations } from "@/lib/supabase/queries/destinations";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";

export const metadata: Metadata = {
  title: "Spiritual & Cultural Nepal — Temples, Monasteries, Pilgrimages",
  description: "Sacred temples, ancient monasteries, and pilgrimage sites across Nepal. Hindu, Buddhist, Newari, and indigenous traditions in one of the world's most religiously diverse countries.",
};

export const revalidate = 3600;

const PILLARS = [
  {
    title: "Hindu Pilgrimages",
    nepali: "हिन्दू तीर्थ",
    description: "Pashupatinath, Muktinath, Janakpur — Nepal is home to some of Hinduism's most sacred sites.",
    icon: "ॐ",
    color: "#d97a3a",
    examples: ["Pashupatinath Temple", "Muktinath", "Janaki Mandir, Janakpur", "Manakamana"],
  },
  {
    title: "Buddhist Sites",
    nepali: "बौद्ध तीर्थ",
    description: "From Buddha's birthplace in Lumbini to high-altitude monasteries in Mustang and Solu-Khumbu.",
    icon: "☸",
    color: "#e9a829",
    examples: ["Lumbini (Buddha's birthplace)", "Boudhanath Stupa", "Swayambhunath", "Tengboche Monastery"],
  },
  {
    title: "Newari Heritage",
    nepali: "नेवारी संस्कृति",
    description: "Living medieval cities of Kathmandu Valley — Patan, Bhaktapur, and the unique Newari Hindu-Buddhist syncretism.",
    icon: "✦",
    color: "#c84630",
    examples: ["Patan Durbar Square", "Bhaktapur Durbar Square", "Changu Narayan", "Kathmandu Durbar Square"],
  },
];

export default async function SpiritualPage() {
  // Pull destinations tagged as religious/heritage or with relevant categories
  const { data: temples } = await getDestinations({ category: "temple" as any }, 1, 12);

  return (
    <div className="min-h-screen bg-base-950 pb-24">
      {/* Hero */}
      <section className="pt-12 pb-10 px-5 border-b border-white/[0.06]">
        <div className="container max-w-[1200px] mx-auto">
          <AnimatedSection className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-brand-400 text-xs font-mono tracking-[0.3em] uppercase">Experiences · Spiritual</span>
              <div className="h-px w-16 bg-brand-500/60" />
            </div>
            <h1 className="font-display text-white leading-[1.05] tracking-[-0.01em]" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              Sacred Nepal,<br /><span className="italic text-brand-400 font-normal">walked for centuries.</span>
            </h1>
            <p className="text-white/55 text-base font-light mt-5 leading-relaxed">
              Hinduism, Buddhism, and Newari syncretism — Nepal is one of the world's most religiously layered countries. Temples are not museums here; they are still in daily use.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Three pillars */}
      <section className="container max-w-[1200px] mx-auto px-5 py-14">
        <h2 className="text-white/70 text-sm font-mono uppercase tracking-[0.2em] mb-6">Three traditions</h2>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PILLARS.map((p) => (
            <StaggerItem key={p.title}>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 h-full hover:border-white/20 transition-all">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-4xl leading-none" style={{ color: p.color }}>{p.icon}</span>
                  <div>
                    <h3 className="text-white font-display text-2xl leading-tight">{p.title}</h3>
                    <p className="text-white/40 text-xs font-mono mt-1">{p.nepali}</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-4">{p.description}</p>
                <ul className="space-y-1.5">
                  {p.examples.map((e) => (
                    <li key={e} className="text-white/70 text-sm flex gap-2">
                      <span style={{ color: p.color }}>·</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Featured spiritual destinations */}
      {temples.length > 0 && (
        <section className="container max-w-[1200px] mx-auto px-5 py-10 border-t border-white/[0.04]">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-white font-display text-3xl md:text-4xl">Sacred destinations</h2>
              <p className="text-white/45 text-sm mt-2">Temples and pilgrimage sites across Nepal</p>
            </div>
            <Link href="/destinations?category=temple" className="text-sm text-white/60 hover:text-white border border-white/15 hover:border-white/40 px-4 py-2 rounded-md">View all temples →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {temples.slice(0, 9).map((d: any) => (
              <Link key={d.id} href={`/destinations/${d.slug}`} className="group block rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {d.coverImageUrl && (
                    <img src={d.coverImageUrl} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/30 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="text-white font-display text-xl leading-tight mb-1">{d.name}</h3>
                  <p className="text-white/45 text-xs font-mono mb-2">{d.province}</p>
                  {d.tagline && <p className="text-white/55 text-sm leading-relaxed line-clamp-2">{d.tagline}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container max-w-[1200px] mx-auto px-5 py-12 text-center">
        <p className="text-white/60 text-base mb-4">Want to time your trip around a festival?</p>
        <Link href="/plan" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-md text-sm font-medium tracking-wide transition-all">
          Plan a spiritual journey <span>→</span>
        </Link>
      </section>
    </div>
  );
}
