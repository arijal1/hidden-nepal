import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";
import { SearchBox } from "@/components/shared/SearchBox";

export const metadata: Metadata = { title: "Search Nepal" };

async function search(query: string) {
  if (!query || query.trim().length < 2) return { destinations: [], treks: [], gems: [] };
  const supabase = await createClient();

  const [{ data: destinations }, { data: treks }, { data: gems }] = await Promise.all([
    supabase
      .from("destinations")
      .select("id, slug, name, tagline, category, cover_image_url, is_hidden_gem, avg_rating, province")
      .eq("is_published", true)
      .textSearch("fts", query, { type: "websearch", config: "english" })
      .limit(9),
    supabase
      .from("treks")
      .select("id, slug, name, difficulty, cover_image_url, duration_days, max_elevation_m")
      .eq("is_published", true)
      .textSearch("fts", query, { type: "websearch", config: "english" })
      .limit(6),
    supabase
      .from("hidden_gems")
      .select("id, title, story, cover_image_url, region")
      .eq("is_published", true)
      .eq("is_verified", true)
      .ilike("title", `%${query}%`)
      .limit(6),
  ]);

  return {
    destinations: destinations ?? [],
    treks: treks ?? [],
    gems: gems ?? [],
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = await search(query);
  const total = results.destinations.length + results.treks.length + results.gems.length;

  return (
    <div className="min-h-screen bg-base-950 pb-24">
      {/* Search header */}
      <section className="pt-12 pb-10 px-5 border-b border-white/[0.06]">
        <div className="container max-w-[800px] mx-auto">
          <AnimatedSection>
            <p className="section-label mb-4">◈ Search</p>
            <SearchBox initialQuery={query} />
            {query && (
              <p className="text-white/30 text-sm mt-4 font-mono">
                {total > 0
                  ? `${total} results for "${query}"`
                  : `No results for "${query}"`}
              </p>
            )}
          </AnimatedSection>
        </div>
      </section>

      <div className="container max-w-[1200px] mx-auto px-5 py-12 space-y-14">
        {/* Empty / no query */}
        {!query && (
          <AnimatedSection className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-white/50 font-display text-xl mb-2">Search Nepal</p>
            <p className="text-white/25 text-sm">
              Try "Rara Lake", "EBC trek", "hidden waterfall", or "Mustang"
            </p>
          </AnimatedSection>
        )}

        {query && total === 0 && (
          <AnimatedSection className="text-center py-16">
            <p className="text-5xl mb-4">◈</p>
            <p className="text-white/50 font-display text-xl mb-2">Nothing found</p>
            <p className="text-white/25 text-sm mb-8">
              Try different keywords or browse by category
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Rara Lake", "Everest Base Camp", "Mustang", "Hidden Gems", "Pokhara"].map((s) => (
                <Link key={s} href={`/search?q=${encodeURIComponent(s)}`}
                  className="text-xs font-mono text-brand-400 border border-brand-500/25 rounded-full px-3 py-1.5 hover:bg-brand-500/10 transition-colors">
                  {s}
                </Link>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Destinations */}
        {results.destinations.length > 0 && (
          <AnimatedSection>
            <ResultSection title="Destinations" count={results.destinations.length} href={`/destinations?q=${query}`}>
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.destinations.map((d: any) => (
                  <StaggerItem key={d.id}>
                    <Link href={`/destinations/${d.slug}`}
                      className="flex items-center gap-4 glass-card p-4 hover:-translate-y-0.5 hover:border-white/15 transition-all duration-200 group">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <Image src={d.cover_image_url} alt={d.name} fill sizes="64px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {d.is_hidden_gem && <span className="gem-badge text-[8px] mb-1 inline-block">Gem</span>}
                        <p className="text-white/85 text-sm font-medium truncate">{d.name}</p>
                        <p className="text-white/35 text-xs font-mono mt-0.5">{d.province} · {d.category}</p>
                        <p className="text-white/40 text-xs mt-1 line-clamp-1">{d.tagline}</p>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </ResultSection>
          </AnimatedSection>
        )}

        {/* Treks */}
        {results.treks.length > 0 && (
          <AnimatedSection delay={0.1}>
            <ResultSection title="Trekking Routes" count={results.treks.length} href="/treks">
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.treks.map((t: any) => (
                  <StaggerItem key={t.id}>
                    <Link href={`/treks/${t.slug}`}
                      className="flex items-center gap-4 glass-card p-4 hover:-translate-y-0.5 hover:border-white/15 transition-all duration-200 group">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <Image src={t.cover_image_url} alt={t.name} fill sizes="64px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div>
                        <p className="text-white/85 text-sm font-medium">{t.name}</p>
                        <p className="text-white/35 text-xs font-mono mt-0.5 capitalize">{t.difficulty} · {t.duration_days} days</p>
                        <p className="text-white/30 text-xs mt-1">↑ {t.max_elevation_m?.toLocaleString()}m</p>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </ResultSection>
          </AnimatedSection>
        )}

        {/* Hidden Gems */}
        {results.gems.length > 0 && (
          <AnimatedSection delay={0.15}>
            <ResultSection title="Hidden Gems" count={results.gems.length} href="/hidden-gems">
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.gems.map((g: any) => (
                  <StaggerItem key={g.id}>
                    <div className="glass-card p-5 border-gold-500/[0.1]">
                      <span className="gem-badge mb-3 inline-block">Hidden Gem</span>
                      <p className="text-white/80 text-sm font-medium mb-1">{g.title}</p>
                      <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{g.story}</p>
                      <p className="text-white/25 text-[10px] font-mono mt-3">📍 {g.region}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </ResultSection>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}

function ResultSection({ title, count, href, children }: { title: string; count: number; href: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-white/70 font-display text-lg">{title}</h2>
          <span className="text-xs font-mono text-white/30 border border-white/[0.08] rounded-full px-2 py-0.5">{count}</span>
        </div>
        <Link href={href} className="text-brand-400 text-xs hover:text-brand-300 transition-colors">View all →</Link>
      </div>
      {children}
    </div>
  );
}
