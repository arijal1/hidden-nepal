import { createAdminClient } from "@/lib/supabase/server";
import { EnrichButton } from "@/components/admin/EnrichButton";

export const dynamic = "force-dynamic";

function status(present: boolean) {
  return present ? "✓" : "✗";
}

function statusClass(present: boolean) {
  return present ? "text-emerald-400" : "text-red-400";
}

export default async function DataQualityPage() {
  const supabase = createAdminClient();
  const { data: destinations } = await supabase
    .from("destinations")
    .select("id, name, slug, description, highlights, warnings, best_season, elevation_m, cover_image_url, tagline")
    .eq("is_published", true)
    .order("name");

  const list = destinations ?? [];

  // Compute completeness %
  function score(d: any) {
    let s = 0;
    if (d.description && d.description.length >= 50) s++;
    if (d.tagline && d.tagline.length >= 10) s++;
    if (d.highlights?.length > 0) s++;
    if (d.warnings?.length > 0) s++;
    if (d.best_season?.length > 0) s++;
    if (d.cover_image_url) s++;
    return Math.round((s / 6) * 100);
  }

  // Sort: lowest score first
  const sorted = [...list].sort((a, b) => score(a) - score(b));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-display-md text-white mb-2">Data Quality</h1>
        <p className="text-white/40 text-sm">Find and fix destinations missing key fields. AI fills using Wikipedia + Wikivoyage context.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-white/40 text-xs font-mono uppercase tracking-widest border-b border-white/[0.08]">
            <tr>
              <th className="text-left py-3 px-3">Name</th>
              <th className="text-center py-3 px-2">Complete</th>
              <th className="text-center py-3 px-2">Tagline</th>
              <th className="text-center py-3 px-2">Desc</th>
              <th className="text-center py-3 px-2">Highlights</th>
              <th className="text-center py-3 px-2">Warnings</th>
              <th className="text-center py-3 px-2">Season</th>
              <th className="text-center py-3 px-2">Image</th>
              <th className="text-right py-3 px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d: any) => {
              const completeness = score(d);
              const scoreColor = completeness >= 80 ? "text-emerald-400" : completeness >= 50 ? "text-yellow-400" : "text-red-400";
              return (
                <tr key={d.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="py-3 px-3">
                    <p className="text-white font-medium">{d.name}</p>
                    <p className="text-white/30 text-xs font-mono">{d.slug}</p>
                  </td>
                  <td className={`text-center font-mono font-semibold ${scoreColor}`}>{completeness}%</td>
                  <td className={`text-center ${statusClass(!!d.tagline && d.tagline.length >= 10)}`}>{status(!!d.tagline && d.tagline.length >= 10)}</td>
                  <td className={`text-center ${statusClass(!!d.description && d.description.length >= 50)}`}>{status(!!d.description && d.description.length >= 50)}</td>
                  <td className={`text-center ${statusClass(d.highlights?.length > 0)}`}>{status(d.highlights?.length > 0)}</td>
                  <td className={`text-center ${statusClass(d.warnings?.length > 0)}`}>{status(d.warnings?.length > 0)}</td>
                  <td className={`text-center ${statusClass(d.best_season?.length > 0)}`}>{status(d.best_season?.length > 0)}</td>
                  <td className={`text-center ${statusClass(!!d.cover_image_url)}`}>{status(!!d.cover_image_url)}</td>
                  <td className="text-right py-3 px-3">
                    {completeness < 100 && <EnrichButton id={d.id} name={d.name} />}
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
