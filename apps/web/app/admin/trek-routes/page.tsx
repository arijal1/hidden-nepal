import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { TREK_ROUTES } from "@/lib/content/trek-routes";
import { TrekRouteEditor } from "@/components/admin/TrekRouteEditor";

export const dynamic = "force-dynamic";

export default async function TrekRoutesAdminPage() {
  const supabase = createAdminClient();
  const { data: treks } = await supabase
    .from("treks")
    .select("id, name, slug, route_waypoints, difficulty, duration_days")
    .order("name");

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-display-md text-white mb-2">Trek Routes</h1>
        <p className="text-white/40 text-sm">Manage route waypoints. DB values override hardcoded ones.</p>
      </div>

      <div className="space-y-3">
        {(treks ?? []).map((trek: any) => {
          const hasDb = Array.isArray(trek.route_waypoints) && trek.route_waypoints.length > 0;
          const hasHardcoded = !!TREK_ROUTES[trek.slug];
          const dbCount = hasDb ? trek.route_waypoints.length : 0;
          const hardcodedCount = TREK_ROUTES[trek.slug]?.waypoints.length ?? 0;
          const currentWaypoints = hasDb ? trek.route_waypoints : (TREK_ROUTES[trek.slug]?.waypoints ?? []);

          return (
            <details key={trek.id} className="bg-base-900 border border-white/[0.08] rounded-xl overflow-hidden">
              <summary className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02]">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{trek.name}</p>
                  <p className="text-white/40 text-xs font-mono mt-0.5">{trek.slug}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {hasDb ? (
                    <span className="text-emerald-400 border border-emerald-400/30 px-2 py-1 rounded">DB · {dbCount} pts</span>
                  ) : hasHardcoded ? (
                    <span className="text-blue-400 border border-blue-400/30 px-2 py-1 rounded">Hardcoded · {hardcodedCount} pts</span>
                  ) : (
                    <span className="text-white/30 border border-white/15 px-2 py-1 rounded">No route</span>
                  )}
                </div>
              </summary>
              <div className="p-4 border-t border-white/[0.06]">
                <TrekRouteEditor trekId={trek.id} slug={trek.slug} initialWaypoints={currentWaypoints} />
                <Link href={`/treks/${trek.slug}`} target="_blank" className="text-brand-400 text-xs hover:underline mt-3 inline-block">View on site →</Link>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
