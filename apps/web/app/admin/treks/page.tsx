import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { difficultyConfig } from "@/lib/utils/formatters";
import type { TrekDifficulty } from "@/types";

export default async function AdminTreksPage() {
  const supabase = createAdminClient();
  const { data: treks, count } = await supabase
    .from("treks")
    .select("id, slug, name, difficulty, duration_days, max_elevation_m, is_published, permit_required, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white font-display text-2xl font-semibold">Trek Routes</h1>
          <p className="text-white/35 text-sm mt-1">{count ?? 0} total</p>
        </div>
        <Link href="/admin/treks/new" className="btn-primary text-sm px-5 py-2.5 rounded-xl">
          + Add Trek
        </Link>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.07]">
              {["Name", "Difficulty", "Duration", "Max Elev", "Permit", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-white/30 text-xs font-mono uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {(treks ?? []).map((trek: any) => {
              const cfg = difficultyConfig[trek.difficulty as TrekDifficulty] ?? difficultyConfig.moderate;
              return (
                <tr key={trek.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white/80 font-medium">{trek.name}</p>
                    <p className="text-white/25 text-xs font-mono">{trek.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full border capitalize"
                      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs font-mono">{trek.duration_days}d</td>
                  <td className="px-4 py-3 text-white/50 text-xs font-mono">{trek.max_elevation_m?.toLocaleString()}m</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${trek.permit_required ? "text-gold-400" : "text-white/30"}`}>
                      {trek.permit_required ? "Required" : "None"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      trek.is_published
                        ? "text-brand-400 border-brand-500/25 bg-brand-500/[0.07]"
                        : "text-white/30 border-white/10"
                    }`}>
                      {trek.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link href={`/treks/${trek.slug}`} target="_blank" className="text-white/25 text-xs hover:text-white/60">View</Link>
                      <Link href={`/admin/treks/${trek.id}/edit`} className="text-brand-400 text-xs hover:text-brand-300">Edit</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
