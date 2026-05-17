import type { Metadata } from "next";
import Link from "next/link";
import { getDestinations } from "@/lib/supabase/queries/destinations";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import type { DestinationCategory, Province, SearchFilters } from "@/types";

export const metadata: Metadata = {
  title: "Destinations — All of Nepal, by Province",
  description: "Every destination across Nepal's 7 provinces. Hidden lakes, ancient villages, mountain viewpoints, sacred temples.",
};

export const revalidate = 3600;

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "lake", label: "Lakes" },
  { value: "temple", label: "Temples" },
  { value: "viewpoint", label: "Viewpoints" },
  { value: "village", label: "Villages" },
  { value: "city", label: "Cities" },
  { value: "trek", label: "Trekking" },
];

const PROVINCES: Province[] = ["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"];

const SORT_OPTIONS = [
  { value: "province", label: "By Province (default)" },
  { value: "featured", label: "Featured first" },
  { value: "name", label: "Name A–Z" },
  { value: "elevation", label: "Highest elevation" },
  { value: "new", label: "Recently added" },
  { value: "gems", label: "Hidden gems first" },
];

function qs(base: Record<string, string | undefined>, override: Record<string, string | undefined>): string {
  const params = { ...base, ...override };
  const entries = Object.entries(params).filter(([_, v]) => v && v !== "all");
  if (entries.length === 0) return "/destinations";
  return "/destinations?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join("&");
}

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; province?: string; gem?: string; q?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const currentSort = sp.sort ?? "province";
  const filters: SearchFilters & { sortBy?: string } = {
    category: (sp.category && sp.category !== "all" ? sp.category : undefined) as DestinationCategory | undefined,
    province: sp.province as Province | undefined,
    isHiddenGem: sp.gem === "true" ? true : undefined,
    query: sp.q,
    sortBy: currentSort,
  };

  const { data: destinations, total } = await getDestinations(filters, 1, 200);
  const showGrouped = currentSort === "province" && !sp.province;

  // Group by province
  const grouped: Record<string, typeof destinations> = {};
  for (const d of destinations) {
    const key = (d as any).province ?? "Other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d);
  }

  // Active filter chips
  const activeFilters = [
    sp.category && sp.category !== "all" && { label: CATEGORIES.find((c) => c.value === sp.category)?.label ?? sp.category, removeKey: "category" },
    sp.province && { label: sp.province, removeKey: "province" },
    sp.gem === "true" && { label: "Hidden gems only", removeKey: "gem" },
    sp.q && { label: `"${sp.q}"`, removeKey: "q" },
  ].filter(Boolean) as Array<{ label: string; removeKey: string }>;

  return (
    <div className="min-h-screen bg-base-950 pb-24">
      {/* Hero */}
      <section className="pt-12 pb-8 px-5 border-b border-white/[0.06]">
        <div className="container max-w-[1200px] mx-auto">
          <AnimatedSection className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-brand-400 text-xs font-mono tracking-[0.3em] uppercase">Destinations</span>
              <div className="h-px w-16 bg-brand-500/60" />
            </div>
            <h1 className="font-display text-white leading-[1.05] tracking-[-0.01em]" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              All of Nepal,<br />
              <span className="italic text-brand-400 font-normal">by province.</span>
            </h1>
            <p className="text-white/55 text-base font-light mt-5 leading-relaxed">
              {total} destinations across 7 provinces. Filter, sort, or browse by region.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-[64px] z-30 bg-base-950/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="container max-w-[1200px] mx-auto px-5 py-4">
          {/* Search */}
          <form className="mb-3">
            <input
              type="text"
              name="q"
              defaultValue={sp.q}
              placeholder="Search destinations…"
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-md px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:border-brand-500 outline-none"
            />
            {/* preserve other filters */}
            {sp.category && <input type="hidden" name="category" value={sp.category} />}
            {sp.province && <input type="hidden" name="province" value={sp.province} />}
            {sp.gem && <input type="hidden" name="gem" value={sp.gem} />}
            {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
          </form>

          {/* Filter chips row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category chips */}
            {CATEGORIES.map((c) => {
              const isActive = (sp.category ?? "all") === c.value;
              return (
                <Link
                  key={c.value}
                  href={qs(sp, { category: c.value })}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${isActive ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-white/15 text-white/60 hover:border-white/40"}`}
                >
                  {c.label}
                </Link>
              );
            })}

            <div className="h-5 w-px bg-white/10 mx-2" />

            {/* Gem toggle */}
            <Link
              href={qs(sp, { gem: sp.gem === "true" ? undefined : "true" })}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${sp.gem === "true" ? "border-gold-400 bg-gold-400/10 text-gold-400" : "border-white/15 text-white/60 hover:border-white/40"}`}
            >
              ✦ Hidden Gems
            </Link>

            <div className="h-5 w-px bg-white/10 mx-2" />

            {/* Sort dropdown */}
            <form className="ml-auto">
              <select
                name="sort"
                defaultValue={currentSort}
                className="bg-white/[0.04] border border-white/[0.1] rounded-full px-3 py-1.5 text-xs text-white/80 focus:border-brand-500 outline-none cursor-pointer"
                onChange={undefined}
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>Sort: {s.label}</option>
                ))}
              </select>
              {sp.category && <input type="hidden" name="category" value={sp.category} />}
              {sp.province && <input type="hidden" name="province" value={sp.province} />}
              {sp.gem && <input type="hidden" name="gem" value={sp.gem} />}
              {sp.q && <input type="hidden" name="q" value={sp.q} />}
              <button type="submit" className="hidden" />
              <noscript>
                <button type="submit" className="ml-2 text-xs underline text-white/60">Apply</button>
              </noscript>
            </form>
          </div>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
              <span className="text-white/35 text-[10px] font-mono uppercase tracking-widest">Filters:</span>
              {activeFilters.map((f) => (
                <Link
                  key={f.removeKey}
                  href={qs(sp, { [f.removeKey]: undefined })}
                  className="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 hover:bg-brand-500/20"
                >
                  {f.label} ✕
                </Link>
              ))}
              <Link href="/destinations" className="text-xs text-white/40 hover:text-white/70 underline ml-2">Clear all</Link>
            </div>
          )}
        </div>
      </div>

      {/* Province links — quick jump */}
      {showGrouped && (
        <div className="container max-w-[1200px] mx-auto px-5 py-6 border-b border-white/[0.04]">
          <div className="flex flex-wrap gap-2">
            <span className="text-white/35 text-xs font-mono uppercase mr-2 self-center">Jump to:</span>
            {PROVINCES.map((p) => {
              const count = grouped[p]?.length ?? 0;
              if (count === 0) return null;
              return (
                <a key={p} href={`#${p}`} className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/70 hover:text-white hover:border-white/20">
                  {p} <span className="text-white/40">{count}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container max-w-[1200px] mx-auto px-5 py-10">
        {destinations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 mb-4">No destinations match your filters.</p>
            <Link href="/destinations" className="text-brand-400 hover:text-brand-300 text-sm">Clear filters</Link>
          </div>
        ) : showGrouped ? (
          // ─── Magazine: grouped by province ─────────
          PROVINCES.filter((p) => grouped[p]?.length > 0).map((province) => (
            <section key={province} id={province} className="mb-14 scroll-mt-44">
              <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-px w-8 bg-brand-500" />
                    <span className="text-brand-400 text-xs font-mono uppercase tracking-[0.25em]">{grouped[province].length} places</span>
                  </div>
                  <h2 className="font-display text-white text-3xl md:text-4xl">{province}</h2>
                </div>
                <Link href={`/destinations?province=${province}`} className="text-sm text-white/60 hover:text-white border border-white/15 hover:border-white/40 px-4 py-2 rounded-md">
                  View all in {province} →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[province].slice(0, 6).map((d: any) => <DestCard key={d.id} d={d} />)}
              </div>
            </section>
          ))
        ) : (
          // ─── Flat sorted grid ──────────────────────
          <>
            <p className="text-white/40 text-sm mb-5">{total} {total === 1 ? "result" : "results"}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinations.map((d: any) => <DestCard key={d.id} d={d} showProvince />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DestCard({ d, showProvince }: { d: any; showProvince?: boolean }) {
  return (
    <Link href={`/destinations/${d.slug}`} className="group block rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all">
      <div className="relative aspect-[4/3] overflow-hidden">
        {d.coverImageUrl && (
          <img src={d.coverImageUrl} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/30 to-transparent" />
        {d.isHiddenGem && (
          <span className="absolute top-3 left-3 bg-gold-400/95 text-base-950 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full">✦ Gem</span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-white font-display text-xl leading-tight mb-1">{d.name}</h3>
        <p className="text-white/45 text-xs font-mono mb-2">
          {showProvince && d.province ? `${d.province} · ` : ""}{d.category}
          {d.elevationM ? ` · ${d.elevationM}m` : ""}
        </p>
        {d.tagline && <p className="text-white/55 text-sm leading-relaxed line-clamp-2">{d.tagline}</p>}
      </div>
    </Link>
  );
}
