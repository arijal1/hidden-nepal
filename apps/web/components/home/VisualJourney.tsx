import { AnimatedSection } from "@/components/shared/AnimatedSection";

// All from Wikimedia Commons (CC BY-SA / CC BY / Public Domain)
const FRAMES = [
  {
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Everest_kalapatthar.jpg/1600px-Everest_kalapatthar.jpg",
    title: "Sagarmatha",
    subtitle: "8,848m · the highest there is",
    credit: "Pavel Novak / CC BY-SA",
  },
  {
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Phewa_Tal_Reflection.jpg/1600px-Phewa_Tal_Reflection.jpg",
    title: "Phewa Tal",
    subtitle: "Pokhara · Machhapuchhre's mirror",
    credit: "Wikimedia Commons",
  },
  {
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Boudhanath_Stupa_Kathmandu.jpg/1600px-Boudhanath_Stupa_Kathmandu.jpg",
    title: "Boudhanath",
    subtitle: "Kathmandu · prayer flags & pilgrim feet",
    credit: "Wikimedia Commons",
  },
  {
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Rara_Lake%2C_Mugu.jpg/1600px-Rara_Lake%2C_Mugu.jpg",
    title: "Rara Lake",
    subtitle: "Karnali · 3,000m · the country's largest",
    credit: "Wikimedia Commons",
  },
  {
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Annapurna_South_from_Annapurna_Base_Camp.jpg/1600px-Annapurna_South_from_Annapurna_Base_Camp.jpg",
    title: "Annapurna Sanctuary",
    subtitle: "Gandaki · the amphitheater of giants",
    credit: "Wikimedia Commons",
  },
  {
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Patan_Durbar_Square_Nepal.jpg/1600px-Patan_Durbar_Square_Nepal.jpg",
    title: "Patan Durbar",
    subtitle: "Lalitpur · Newari medieval city",
    credit: "Wikimedia Commons",
  },
  {
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Ilam_Tea_Garden_Nepal.jpg/1600px-Ilam_Tea_Garden_Nepal.jpg",
    title: "Ilam Tea Gardens",
    subtitle: "Koshi · rolling green of the east",
    credit: "Wikimedia Commons",
  },
  {
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Muktinath_temple_in_Mustang_Nepal.jpg/1600px-Muktinath_temple_in_Mustang_Nepal.jpg",
    title: "Muktinath",
    subtitle: "Mustang · 3,800m · sacred to two faiths",
    credit: "Wikimedia Commons",
  },
];

export function VisualJourney() {
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

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto md:overflow-visible -mx-5 px-5 md:mx-0 md:px-0 snap-x snap-mandatory pb-4">
          {FRAMES.map((f, idx) => (
            <article
              key={f.title}
              className="min-w-[280px] md:min-w-0 snap-start group relative aspect-[3/4] overflow-hidden rounded-2xl"
              style={{ animation: `fadeUp 0.8s ease-out ${idx * 0.05}s both` }}
            >
              <img
                src={f.img}
                alt={f.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-display text-white text-2xl leading-tight mb-1">{f.title}</h3>
                <p className="text-white/70 text-xs">{f.subtitle}</p>
              </div>
              <p className="absolute top-3 right-3 text-white/30 text-[9px] font-mono">{f.credit}</p>
            </article>
          ))}
        </div>

        <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest text-center mt-8">
          All photography sourced from Wikimedia Commons under permissive licenses
        </p>
      </div>
    </section>
  );
}
