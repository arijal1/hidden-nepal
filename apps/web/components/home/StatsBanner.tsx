// components/home/StatsBanner.tsx
import { AnimatedSection } from "@/components/shared/AnimatedSection";

const STATS = [
  { value: "8", label: "of world's 10 highest peaks" },
  { value: "847", label: "bird species" },
  { value: "126", label: "ethnic groups" },
  { value: "35+", label: "trekking routes" },
];

export function StatsBanner() {
  return (
    <section className="py-14 bg-white/[0.02] border-y border-white/[0.06]">
      <div className="container max-w-[1200px] mx-auto px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <AnimatedSection key={i} delay={i * 0.08}>
              <p className="text-display-lg text-white leading-none mb-2">{s.value}</p>
              <p className="text-white/35 text-sm">{s.label}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
