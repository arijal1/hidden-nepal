// components/home/GemsSection.tsx
import Link from "next/link";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";

export function GemsSection({ gems }: { gems: any[] }) {
  const displayGems = gems.length > 0 ? gems : FALLBACK_GEMS;
  return (
    <section className="py-20 px-5 bg-gradient-to-b from-transparent via-gold-500/[0.03] to-transparent">
      <div className="container max-w-[1200px] mx-auto">
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 border border-gold-400/20 bg-gold-400/[0.06] rounded-full px-4 py-2 mb-5">
            <span className="text-gold-400 text-xs font-mono tracking-widest">✦ HIDDEN GEMS ENGINE</span>
          </div>
          <h2 className="text-display-md text-white mb-4">
            Places even locals<br /><em className="italic text-gold-400">keep to themselves</em>
          </h2>
          <p className="text-white/35 text-sm max-w-sm mx-auto">Community-sourced discoveries, verified by local experts.</p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {displayGems.slice(0, 6).map((gem, i) => (
            <StaggerItem key={gem.id ?? i}>
              <div className="glass-card p-5 border-gold-500/[0.12] hover:border-gold-500/25 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                  <span className="gem-badge">Hidden Gem</span>
                  <span className="text-white/15 group-hover:text-white/40 transition-colors">→</span>
                </div>
                <h3 className="text-white font-display font-semibold text-lg mb-1">{gem.title ?? gem.name}</h3>
                <p className="text-white/45 text-sm leading-relaxed line-clamp-2">{gem.story ?? gem.desc}</p>
                <p className="text-white/25 text-[10px] font-mono uppercase tracking-wider mt-3">📍 {gem.region}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="text-center">
          <Link href="/hidden-gems" className="inline-flex items-center gap-2 border border-gold-400/25 bg-gold-400/[0.07] text-gold-400 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gold-400/[0.12] transition-colors">
            Submit a Hidden Gem ✦
          </Link>
        </div>
      </div>
    </section>
  );
}

const FALLBACK_GEMS = [
  { id: 1, title: "Panch Pokhari", story: "Five sacred glacial lakes above 4,000m in Sindhupalchok — barely 80km from Kathmandu.", region: "Sindhupalchok" },
  { id: 2, title: "Khopra Ridge", story: "The anti-Poon Hill. Same Annapurna views, zero crowds. Community homestays at 3,660m.", region: "Myagdi" },
  { id: 3, title: "Sailung Hill", story: "360° Himalaya panorama 2 hours from Kathmandu. Almost no foreign tourists know this exists.", region: "Dolakha" },
  { id: 4, title: "Limi Valley", story: "Tibet-border villages so remote they receive fewer than 100 foreign visitors per year.", region: "Humla" },
  { id: 5, title: "Jatapokhari", story: "A ghost lake lost in bamboo forest. Sacred, silent, other-worldly.", region: "Taplejung" },
  { id: 6, title: "Ganesh Himal BC", story: "An untouched base camp with Ganesh Himal views — no permit required, no crowds.", region: "Gorkha" },
];
