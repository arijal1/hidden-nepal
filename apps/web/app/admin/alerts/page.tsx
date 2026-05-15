import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminAlertsPage() {
  const supabase = createAdminClient();
  const { data: alerts } = await supabase
    .from("safety_alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  const severityColor: Record<string, string> = {
    info: "text-sky-300 border-sky-400/25 bg-sky-400/[0.06]",
    warning: "text-gold-400 border-gold-400/25 bg-gold-400/[0.06]",
    critical: "text-gold-500 border-gold-500/30 bg-gold-500/[0.08]",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white font-display text-2xl font-semibold">Safety Alerts</h1>
          <p className="text-white/35 text-sm mt-1">Manage live safety information</p>
        </div>
        <Link href="/admin/alerts/new" className="btn-primary text-sm px-5 py-2.5 rounded-xl">
          + New Alert
        </Link>
      </div>

      <div className="space-y-3">
        {(alerts ?? []).map((alert: any) => (
          <div key={alert.id} className="glass-card p-5 flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityColor[alert.severity]}`}>
                  {alert.severity}
                </span>
                {alert.is_active && <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />}
                {!alert.is_active && <span className="text-white/25 text-xs">Inactive</span>}
              </div>
              <h3 className="text-white/80 font-medium mb-1">{alert.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{alert.body}</p>
              {alert.province && (
                <p className="text-white/25 text-xs font-mono mt-2">📍 {alert.province}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href={`/admin/alerts/${alert.id}/edit`}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white/70"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
        {!alerts?.length && (
          <p className="text-white/25 text-sm text-center py-10">No alerts yet</p>
        )}
      </div>
    </div>
  );
}
