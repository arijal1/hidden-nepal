import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";

export const metadata: Metadata = {
  title: "Explore by Province",
  description: "Discover Nepal by its 7 provinces — from the eastern Himalayas of Koshi to the remote west of Sudurpashchim.",
};

export const revalidate = 3600;

const PROVINCES = [
  { name: "Koshi", nameNepali: "कोशी", description: "Eastern Himalaya, tea gardens of Ilam, Kanchenjunga base camp.", capital: "Biratnagar", region: "East" },
  { name: "Madhesh", nameNepali: "मधेश", description: "Terai plains, Janakpur's sacred temples, Chhath festival heartland.", capital: "Janakpur", region: "South" },
  { name: "Bagmati", nameNepali: "बागमती", description: "Kathmandu Valley, Langtang, Newari heritage, Nepal's political heart.", capital: "Hetauda", region: "Central" },
  { name: "Gandaki", nameNepali: "गण्डकी", description: "Annapurna, Pokhara, Mustang, Manaslu — trekking capital of Nepal.", capital: "Pokhara", region: "Central-West" },
  { name: "Lumbini", nameNepali: "लुम्बिनी", description: "Birthplace of Buddha, Chitwan jungle safari, Tharu villages.", capital: "Butwal", region: "South-West" },
  { name: "Karnali", nameNepali: "कर्णाली", description: "Rara Lake, Dolpo, Phoksundo — Nepal's wildest and least-visited.", capital: "Birendranagar", region: "West" },
  { name: "Sudurpashchim", nameNepali: "सुदूरपश्चिम", description: "Khaptad, Api Himal, untouched far-western Nepal.", capital: "Godawari", region: "Far West" },
];

export default async function ProvincesPage() {
  const supabase = await createClient();
  const { data: counts } = await supabase
    .from("destinations")
    .select("province")
    .eq("is_published", true);

  const countByProvince: Record<string, number> = {};
  (counts ?? []).forEach((d: any) => {
    if (d.province) countByProvince[d.province] = (countByProvince[d.province] ?? 0) + 1;
  });

  return (
    <div className="min-h-screen bg-base-950 pb-24">
      <section className="pt-12 pb-10 px-5 border-b border-white/[0.06]">
        <div className="container max-w-[1200px] mx-auto">
          <AnimatedSection className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-brand-400 text-xs font-mono tracking-[0.3em] uppercase">Explore</span>
              <div className="h-px w-16 bg-brand-500/60" />
            </div>
            <h1 className="font-display text-white leading-[1.05] tracking-[-0.01em]" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              Nepal's seven<br /><span className="italic text-brand-400 font-normal">provinces.</span>
            </h1>
            <p className="text-white/55 text-base font-light mt-5 leading-relaxed">
              From the eastern Himalayas of Koshi to the remote far-western corners of Sudurpashchim — every province is a different country.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div className="container max-w-[1200px] mx-auto px-5 py-14">
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROVINCES.map((p) => {
            const count = countByProvince[p.name] ?? 0;
            return (
              <StaggerItem key={p.name}>
                <Link
                  href={"/destinations?province=" + p.name}
                  className="block bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-brand-500/40 hover:bg-white/[0.05] transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-white/30 text-[10px] font-mono uppercase tracking-widest">{p.region}</span>
                    <span className="text-brand-400 text-xs font-mono">{count} {count === 1 ? "place" : "places"}</span>
                  </div>
                  <h2 className="font-display text-white text-3xl leading-tight mb-1">{p.name}</h2>
                  <p className="text-white/40 text-sm mb-4">{p.nameNepali}</p>
                  <p className="text-white/55 text-sm leading-relaxed mb-5">{p.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                    <span className="text-white/40 text-xs font-mono">Capital · {p.capital}</span>
                    <span className="text-brand-400 text-sm group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </div>
  );
}
