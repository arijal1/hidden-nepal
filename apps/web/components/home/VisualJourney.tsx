import { AnimatedSection } from "@/components/shared/AnimatedSection";
import type { Destination } from "@/types";

export function VisualJourney({ frames }: { frames: Destination[] }) {
  if (!frames || frames.length === 0) return null;

  return (
    <section className="py-20 px-5 bg-base-950 overflow-hidden">
      <div className="container max-w-[1440px] mx-auto">
        <AnimatedSection className="max-w-2xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-brand-500/60" />
            <span className="text-brand-400 text-xs font-mono tracking-[0.3em] uppercase">In Pictures</span>
            <div className="h-px w-10 bg-brand-500/60" />
          </div>
          <h2 className="font-display text-white leading-[1.05] tracking-[-0.01em]" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
            One country,<br />
            <span className="italic text-brand-400 font-normal">eight landscapes.</span>
          </h2>
          <p className="text-white/55 text-base font-light mt-5 max-w-md mx-auto leading-relaxed">
            From the world's highest peaks to subtropical jungles, all within 200km of each other.
          </p>
        </AnimatedSection>

        <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto md:overflow-visible -mx-5 px-5 md:mx-0 md:px-0 snap-x snap-mandatory pb-4">
          {frames.slice(0, 8).map((f: any, idx: number) => (
            <a
            
              key={f.id}
              href={`/destinations/${f.slug}`}
              className="min-w-[260px] md:min-w-0 snap-start group relative aspect-[3/4] overflow-hidden rounded-2xl block"
              style={{ animation: `fadeUp 0.8s ease-out ${idx * 0.05}s both` }}
            >
              {f.coverImageUrl && (
                <img
                  src={f.coverImageUrl}
                  alt={f.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-display text-white text-xl leading-tight mb-1">{f.name}</h3>
                <p className="text-white/70 text-xs">{f.province}{f.elevationM ? ` · ${f.elevationM}m` : ""}</p>
              </div>
            </a>
          ))}
        </div>

        <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest text-center mt-8">
          Photography from Wikimedia Commons under permissive licenses
        </p>
      </div>
    </section>
  );
}
