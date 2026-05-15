import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDestinations } from "@/lib/supabase/queries/destinations";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";
import type { DestinationCategory, Province, SearchFilters } from "@/types";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Explore all destinations in Nepal — hidden lakes, ancient villages, mountain viewpoints, and cultural sites across all 7 provinces.",
};

export const revalidate = 3600;

const CATEGORIES: { value: DestinationCategory | "all"; label: string; icon: string }[] = [
  { value: "all", label: "All", icon: "◈" },
  { value: "lake", label: "Lakes", icon: "💧" },
  { value: "trek", label: "Trekking", icon: "🥾" },
  { value: "hidden_gem", label: "Gems", icon: "✦" },
  { value: "village", label: "Villages", icon: "🏡" },
  { value: "temple", label: "Temples", icon: "🙏" },
  { value: "viewpoint", label: "Viewpoints", icon: "🏔️" },
  { value: "city", label: "Cities", icon: "🌆" },
];

const PROVINCES: Province[] = [
  "Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"
];

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: { category?: string; province?: string; gem?: string; page?: string; q?: string };
}) {
  const filters: SearchFilters = {
    category: (searchParams.category !== "all" ? searchParams.category : undefined) as DestinationCategory | undefined,
    province: searchParams.province as Province | undefined,
    isHiddenGem: searchParams.gem === "true" ? true : undefined,
    query: searchParams.q,
  };

  const page = parseInt(searchParams.page ?? "1");
  const { data: destinations, total, hasMore } = await getDestinations(filters, page, 12);
  const activeCategory = searchParams.category ?? "all";

  return (
    <div className="min-h-screen bg-base-950 pb-24">
      {/* Page header */}
      <section className="border-b border-white/[0.06] pt-12 pb-10 px-5">
        <div className="container max-w-[1200px] mx-auto">
          <AnimatedSection>
            <p className="section-label mb-3">◈ Destinations</p>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h1 className="text-display-lg text-white">
                Explore Nepal<br />
                <em className="italic text-white/35">all {total} destinations</em>
              </h1>
              {/* Search */}
              <form className="relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={searchParams.q}
                  placeholder="Search destinations..."
                  className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white placeholder:text-white/25 text-sm outline-none focus:border-brand-500/40 transition-colors w-64"
                />
              </form>
            </div>
          </AnimatedSection>

          {/* Category tabs */}
          <AnimatedSection delay={0.1} className="mt-8 overflow-x-auto">
            <div className="flex gap-2 pb-1 min-w-max">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.value}
                  href={`/destinations?category=${cat.value}${searchParams.province ? `&province=${searchParams.province}` : ""}`}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-all duration-200 ${
                    activeCategory === cat.value
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                      : "border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                  }`}
                >
                  <span>{cat.icon}</span> {cat.label}
                </Link>
              ))}
            </div>
          </AnimatedSection>

          {/* Province filter */}
          <AnimatedSection delay={0.15} className="mt-4 overflow-x-auto">
            <div className="flex gap-2 pb-1 min-w-max">
              <Link
                href={`/destinations?category=${activeCategory}`}
                className={`px-3 py-1.5 rounded-full border text-xs whitespace-nowrap transition-all duration-200 ${
                  !searchParams.province
                    ? "border-white/20 text-white/70 bg-white/[0.06]"
                    : "border-white/[0.07] text-white/30 hover:text-white/60"
                }`}
              >
                All Provinces
              </Link>
              {PROVINCES.map((prov) => (
                <Link
                  key={prov}
                  href={`/destinations?category=${activeCategory}&province=${prov}`}
                  className={`px-3 py-1.5 rounded-full border text-xs whitespace-nowrap transition-all duration-200 ${
                    searchParams.province === prov
                      ? "border-brand-500/40 bg-brand-500/[0.08] text-brand-400"
                      : "border-white/[0.07] text-white/30 hover:text-white/60"
                  }`}
                >
                  {prov}
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Grid */}
      <section className="px-5 py-12">
        <div className="container max-w-[1200px] mx-auto">
          {destinations.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-white/25 text-6xl mb-6">◈</p>
              <p className="text-white/40 text-lg font-display">No destinations found</p>
              <p className="text-white/25 text-sm mt-2">Try adjusting your filters</p>
              <Link href="/destinations" className="btn-ghost inline-block mt-6 px-6 py-3 rounded-xl text-sm">
                Clear filters
              </Link>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {destinations.map((dest) => (
                <StaggerItem key={dest.id}>
                  <DestinationListCard destination={dest} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          {/* Pagination */}
          {(page > 1 || hasMore) && (
            <div className="flex items-center justify-center gap-4 mt-16">
              {page > 1 && (
                <Link
                  href={`/destinations?page=${page - 1}&category=${activeCategory}`}
                  className="btn-ghost px-6 py-2.5 rounded-xl text-sm"
                >
                  ← Previous
                </Link>
              )}
              <span className="text-white/30 text-sm font-mono">Page {page}</span>
              {hasMore && (
                <Link
                  href={`/destinations?page=${page + 1}&category=${activeCategory}`}
                  className="btn-primary px-6 py-2.5 rounded-xl text-sm"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function DestinationListCard({ destination }: { destination: any }) {
  return (
    <Link href={`/destinations/${destination.slug}`}
      className="destination-card group block rounded-2xl overflow-hidden border border-white/[0.07] hover:border-white/15 hover:-translate-y-1 transition-all duration-350 shadow-card hover:shadow-card-hover"
    >
      <div className="relative h-52 overflow-hidden">
        <Image
          src={destination.coverImageUrl}
          alt={destination.name}
          fill
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          className="object-cover destination-card-img"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {destination.isHiddenGem && (
          <div className="absolute top-3 left-3">
            <span className="gem-badge">✦ Gem</span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-1 glass-card rounded-full px-2 py-1 text-xs">
          <span className="text-gold-400">★</span>
          <span className="text-white/80 font-mono">{destination.avgRating}</span>
        </div>
      </div>
      <div className="p-5 bg-white/[0.02]">
        <p className="text-white/30 text-[10px] font-mono tracking-widest uppercase mb-1">
          {destination.province} · {destination.category?.replace("_", " ")}
        </p>
        <h3 className="text-white font-display font-semibold text-lg leading-tight mb-1">{destination.name}</h3>
        <p className="text-white/45 text-sm leading-relaxed line-clamp-2">{destination.tagline}</p>
        <div className="flex items-center gap-3 mt-4">
          <span className="text-white/25 text-xs font-mono">
            🗓 {destination.bestSeason?.slice(0, 2).join(", ")}
          </span>
          {destination.elevationM && (
            <>
              <span className="text-white/15">·</span>
              <span className="text-white/25 text-xs font-mono">↑ {destination.elevationM?.toLocaleString()}m</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
