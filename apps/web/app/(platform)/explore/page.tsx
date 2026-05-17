import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedDestinations, getHiddenGems } from "@/lib/supabase/queries/destinations";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { DiscoveryMap } from "@/components/map/DiscoveryMap";
import type { MapMarkerData } from "@/types";

export const metadata: Metadata = {
  title: "Explore Nepal — Interactive Map",
  description: "Discover Nepal on an interactive 3D map. Click any marker to explore destinations, hidden gems, and trekking routes.",
};

export const revalidate = 3600;

export default async function ExplorePage() {
  const [destinations, gems] = await Promise.all([
    getFeaturedDestinations(100),
    getHiddenGems(50),
  ]);

  const destMarkers: MapMarkerData[] = destinations.map((d) => ({
    id: d.id,
    coordinates: d.coordinates,
    type: d.category as any,
    label: d.name,
    slug: d.slug,
    coverImageUrl: d.coverImageUrl,
  }));

  const gemMarkers: MapMarkerData[] = gems
    .filter((g: any) => g.coordinates)
    .map((g: any) => ({
      id: g.id,
      coordinates: g.coordinates,
      type: "hidden_gem" as const,
      label: g.title,
      slug: g.destinations?.slug ?? "hidden-gems",
      coverImageUrl: g.cover_image_url,
    }));

  const allMarkers = [...destMarkers, ...gemMarkers];

  return (
    <div className="min-h-screen bg-base-950">
      <section className="pt-10 pb-6 px-5 border-b border-white/[0.06]">
        <div className="container max-w-[1200px] mx-auto">
          <AnimatedSection className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="section-label mb-2">Explore</p>
              <h1 className="text-display-md text-white">Discover Nepal on the map</h1>
              <p className="text-white/35 text-sm mt-2 max-w-md">
                Click any marker to explore. Clusters expand when you zoom in. Filter by category or province.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/destinations" className="btn-ghost text-sm px-4 py-2.5 rounded-xl">List view</Link>
              <Link href="/nearby" className="btn-ghost text-sm px-4 py-2.5 rounded-xl">📍 Near me</Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <div className="px-5 py-6">
        <div className="container max-w-[1200px] mx-auto">
          <DiscoveryMap markers={allMarkers} height={620} showFilters />
        </div>
      </div>

      <section className="px-5 pb-16">
        <div className="container max-w-[1200px] mx-auto">
          <AnimatedSection className="mb-5">
            <p className="section-label">Explore by Province</p>
          </AnimatedSection>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { name:"Koshi", icon:"🏔️", highlight:"Everest" },
              { name:"Madhesh", icon:"🌾", highlight:"Janakpur" },
              { name:"Bagmati", icon:"🛕", highlight:"Kathmandu" },
              { name:"Gandaki", icon:"⛰️", highlight:"Annapurna" },
              { name:"Lumbini", icon:"☮️", highlight:"Buddha's birthplace" },
              { name:"Karnali", icon:"💧", highlight:"Rara Lake" },
              { name:"Sudurpashchim", icon:"🌿", highlight:"Khaptad" },
            ].map((prov) => (
              <Link key={prov.name} href={`/destinations?province=${prov.name}`}
                className="glass-card p-4 text-center hover:-translate-y-1 hover:border-white/15 transition-all duration-300 group">
                <span className="text-2xl block mb-2">{prov.icon}</span>
                <p className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">{prov.name}</p>
                <p className="text-white/25 text-[10px] font-mono mt-0.5">{prov.highlight}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
