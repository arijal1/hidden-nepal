import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";
import { alertConfig } from "@/lib/utils/formatters";
import type { AlertSeverity } from "@/types";

export const metadata: Metadata = {
  title: "Safety Alerts — Nepal Travel",
  description: "Live safety alerts, road conditions, weather advisories, and travel warnings for Nepal.",
};

export const revalidate = 900; // 15 min

async function getAlerts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("safety_alerts")
    .select("*")
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt.now()")
    .order("severity", { ascending: false })
    .order("created_at", { ascending: false });
  return data ?? [];
}

const GENERAL_TIPS = [
  { icon: "🏥", title: "Altitude Sickness", desc: "Above 3,000m — ascend slowly, max 300–500m per day. Diamox helps. Descend immediately if symptoms worsen." },
  { icon: "☎️", title: "Emergency Numbers", desc: "Nepal Police: 100 · Tourist Police: 01-4247041 · Ambulance: 102 · Himalayan Rescue: 01-4440066" },
  { icon: "🌧️", title: "Monsoon Season", desc: "June–September brings heavy rain, landslides, and leeches on trails. Many high passes close. Check conditions before travel." },
  { icon: "🥾", title: "Trek Insurance", desc: "Always have travel insurance covering helicopter evacuation. Rescue can cost $5,000–$20,000 USD without coverage." },
  { icon: "💧", title: "Water Safety", desc: "Never drink tap water. Use water purification tablets or a filter. Boil water above 4,000m for longer." },
  { icon: "📵", title: "Connectivity", desc: "Mobile signal drops above 4,000m on most routes. Download offline maps before your trek. Inform someone of your itinerary." },
];

export default async function SafetyPage() {
  const alerts = await getAlerts();
  const critical = alerts.filter((a) => a.severity === "critical");
  const warnings = alerts.filter((a) => a.severity === "warning");
  const info = alerts.filter((a) => a.severity === "info");

  return (
    <div className="min-h-screen bg-base-950 pb-24">
      {/* Header */}
      <section className="pt-12 pb-10 px-5 border-b border-white/[0.06]">
        <div className="container max-w-[1200px] mx-auto">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
              <span className="text-white/30 text-xs font-mono tracking-widest uppercase">Live Updates</span>
            </div>
            <h1 className="text-display-lg text-white mb-3">
              Nepal Safety &amp; Alerts
            </h1>
            <p className="text-white/40 text-base font-light max-w-lg">
              Real-time road conditions, weather advisories, and travel warnings. Updated by our Nepal-based team.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div className="container max-w-[1200px] mx-auto px-5 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Alerts column */}
          <div className="lg:col-span-2 space-y-10">
            {alerts.length === 0 ? (
              <AnimatedSection>
                <div className="text-center py-16 border border-dashed border-white/[0.08] rounded-2xl">
                  <p className="text-3xl mb-4">✓</p>
                  <p className="text-white/60 font-display text-xl mb-2">All clear</p>
                  <p className="text-white/30 text-sm">No active alerts at this time. Nepal is open for travel.</p>
                </div>
              </AnimatedSection>
            ) : (
              <>
                {critical.length > 0 && (
                  <AlertGroup title="Critical Alerts" alerts={critical} severity="critical" />
                )}
                {warnings.length > 0 && (
                  <AlertGroup title="Warnings" alerts={warnings} severity="warning" />
                )}
                {info.length > 0 && (
                  <AlertGroup title="Information" alerts={info} severity="info" />
                )}
              </>
            )}

            {/* General safety tips */}
            <AnimatedSection>
              <h2 className="text-white/70 font-display text-xl mb-5">General Safety Tips</h2>
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GENERAL_TIPS.map((tip, i) => (
                  <StaggerItem key={i}>
                    <div className="glass-card p-5">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">{tip.icon}</span>
                        <div>
                          <p className="text-white/80 text-sm font-semibold mb-1">{tip.title}</p>
                          <p className="text-white/40 text-xs leading-relaxed">{tip.desc}</p>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </AnimatedSection>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <AnimatedSection>
              {/* Emergency contacts */}
              <div className="glass-card p-6">
                <h3 className="section-label mb-4">Emergency Contacts</h3>
                <div className="space-y-3">
                  {[
                    { name: "Nepal Police", number: "100" },
                    { name: "Tourist Police", number: "01-4247041" },
                    { name: "Ambulance", number: "102" },
                    { name: "Fire Brigade", number: "101" },
                    { name: "Himalayan Rescue", number: "01-4440066" },
                    { name: "CAAN (Civil Aviation)", number: "01-4262388" },
                  ].map((c) => (
                    <div key={c.name} className="flex justify-between items-center">
                      <span className="text-white/50 text-xs">{c.name}</span>
                      <a href={`tel:${c.number}`} className="text-brand-400 text-sm font-mono hover:text-brand-300 transition-colors">
                        {c.number}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              {/* Seasonal status */}
              <div className="glass-card p-6">
                <h3 className="section-label mb-4">Current Season</h3>
                <div className="space-y-2">
                  {[
                    { route: "EBC Trek", status: "Open", color: "text-brand-400" },
                    { route: "Annapurna Circuit", status: "Open", color: "text-brand-400" },
                    { route: "Manaslu Circuit", status: "Open", color: "text-brand-400" },
                    { route: "Thorong La Pass", status: "Check conditions", color: "text-gold-400" },
                    { route: "Dolpa (Phoksundo)", status: "Open", color: "text-brand-400" },
                    { route: "Rara Lake road", status: "Seasonal", color: "text-gold-400" },
                  ].map((r) => (
                    <div key={r.route} className="flex justify-between items-center py-1.5 border-b border-white/[0.04] last:border-0">
                      <span className="text-white/45 text-xs">{r.route}</span>
                      <span className={`text-xs font-semibold ${r.color}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="glass-card p-6">
                <h3 className="section-label mb-3">Report an Issue</h3>
                <p className="text-white/35 text-xs leading-relaxed mb-4">
                  Know about a road closure, safety hazard, or condition not listed here?
                </p>
                <a href="mailto:safety@hiddennepal.com" className="btn-ghost w-full text-center block text-sm py-2.5 rounded-xl">
                  Report to our team
                </a>
              </div>
            </AnimatedSection>
          </aside>
        </div>
      </div>
    </div>
  );
}

function AlertGroup({ title, alerts, severity }: { title: string; alerts: any[]; severity: AlertSeverity }) {
  const cfg = alertConfig[severity];
  return (
    <AnimatedSection>
      <h2 className="text-white/60 text-xs font-mono uppercase tracking-widest mb-4">{title}</h2>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="rounded-2xl border p-5"
            style={{ background: cfg.bg, borderColor: cfg.border }}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg shrink-0 mt-0.5">{cfg.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h3 className="font-semibold text-sm" style={{ color: cfg.color }}>
                    {alert.title}
                  </h3>
                  {alert.province && (
                    <span className="text-xs font-mono text-white/30 border border-white/[0.08] rounded-full px-2 py-0.5">
                      {alert.province}
                    </span>
                  )}
                </div>
                <p className="text-white/55 text-sm leading-relaxed">{alert.body}</p>
                <p className="text-white/20 text-xs font-mono mt-2">
                  {new Date(alert.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                  {alert.expires_at && ` · Expires ${new Date(alert.expires_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
}
