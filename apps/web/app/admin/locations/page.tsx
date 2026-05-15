import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { LocationFinderWrapper } from "./LocationFinderWrapper";

export const metadata: Metadata = { title: "Location Import Tool — Admin" };

async function getStats() {
  const supabase = createAdminClient();
  const [{ count: total }, { count: published }, { count: gems }] = await Promise.all([
    supabase.from("destinations").select("*", { count: "exact", head: true }),
    supabase.from("destinations").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("destinations").select("*", { count: "exact", head: true }).eq("is_hidden_gem", true),
  ]);
  return { total, published, gems };
}

async function getRecentImports() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("destinations")
    .select("id, name, slug, category, province, is_published, created_at")
    .order("created_at", { ascending: false })
    .limit(8);
  return data ?? [];
}

export default async function LocationImportPage() {
  const [stats, recent] = await Promise.all([getStats(), getRecentImports()]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white font-display text-2xl font-semibold">Location Import Tool</h1>
        <p className="text-white/35 text-sm mt-1">
          Search any Nepal location → AI auto-generates all content → one click adds it to the site
        </p>
      </div>

      {/* How it works */}
      <div className="glass-card p-5 mb-8">
        <p className="text-white/40 text-xs font-mono uppercase tracking-wider mb-4">How it works</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step:"01", icon:"🔍", title:"Search", desc:"Type any Nepal place name — lake, village, viewpoint, trail" },
            { step:"02", icon:"📍", title:"Geocode", desc:"Mapbox finds exact coordinates, elevation, and administrative context" },
            { step:"03", icon:"✦", title:"AI Enrich", desc:"GPT-4o generates description, tags, highlights, best season, SEO data" },
            { step:"04", icon:"◈", title:"Import", desc:"Review the generated data, add a cover image, publish or save as draft" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <span className="text-white/15 font-display text-3xl font-medium shrink-0">{item.step}</span>
              <div>
                <p className="text-white/70 text-sm font-semibold">{item.icon} {item.title}</p>
                <p className="text-white/35 text-xs mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Import tool */}
        <div className="xl:col-span-2">
          <LocationFinderWrapper />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Stats */}
          <div className="glass-card p-5">
            <p className="section-label mb-4">Database Stats</p>
            <div className="space-y-3">
              <StatRow label="Total destinations" value={stats.total ?? 0} />
              <StatRow label="Published (live)" value={stats.published ?? 0} color="text-brand-400" />
              <StatRow label="Hidden gems" value={stats.gems ?? 0} color="text-gold-400" />
            </div>
          </div>

          {/* Recent imports */}
          <div className="glass-card p-5">
            <p className="section-label mb-4">Recently Added</p>
            {recent.length === 0 ? (
              <p className="text-white/25 text-sm">No destinations yet</p>
            ) : (
              <div className="space-y-2">
                {recent.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-white/[0.04] last:border-0">
                    <div className="min-w-0">
                      <p className="text-white/70 text-sm truncate">{d.name}</p>
                      <p className="text-white/25 text-xs font-mono">{d.province} · {d.category}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${d.is_published ? "bg-brand-400" : "bg-white/20"}`} />
                      <a href={`/destinations/${d.slug}`} target="_blank"
                        className="text-white/25 text-xs hover:text-brand-400 transition-colors">↗</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="glass-card p-5">
            <p className="section-label mb-3">Tips</p>
            <div className="space-y-2">
              {[
                "Be specific — 'Rara Lake Mugu' finds better results than 'lake'",
                "Hidden gems work best — obscure places get the richest AI descriptions",
                "Add a cover image URL from Unsplash before importing",
                "Save as draft first, review the page, then publish",
                "Run bulk imports for an entire province at once",
              ].map((tip, i) => (
                <p key={i} className="text-white/30 text-xs flex gap-2">
                  <span className="text-brand-400 shrink-0">·</span> {tip}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color = "text-white/70" }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-white/35 text-xs">{label}</span>
      <span className={`font-mono font-semibold ${color}`}>{value}</span>
    </div>
  );
}
