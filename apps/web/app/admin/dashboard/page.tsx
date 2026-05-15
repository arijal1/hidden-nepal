import { createAdminClient } from "@/lib/supabase/server";

async function getStats() {
  const supabase = createAdminClient();
  const [
    { count: destinations },
    { count: treks },
    { count: gems },
    { count: reviews },
    { count: itineraries },
    { count: pendingGems },
  ] = await Promise.all([
    supabase.from("destinations").select("*", { count: "exact", head: true }),
    supabase.from("treks").select("*", { count: "exact", head: true }),
    supabase.from("hidden_gems").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("itineraries").select("*", { count: "exact", head: true }),
    supabase.from("hidden_gems").select("*", { count: "exact", head: true }).eq("is_verified", false),
  ]);

  return { destinations, treks, gems, reviews, itineraries, pendingGems };
}

async function getRecentActivity() {
  const supabase = createAdminClient();
  const { data: recentGems } = await supabase
    .from("hidden_gems")
    .select("id, title, region, created_at, is_verified")
    .order("created_at", { ascending: false })
    .limit(5);
  const { data: recentReviews } = await supabase
    .from("reviews")
    .select("id, title, rating, created_at, is_published")
    .order("created_at", { ascending: false })
    .limit(5);
  return { recentGems: recentGems ?? [], recentReviews: recentReviews ?? [] };
}

export default async function AdminDashboard() {
  const [stats, activity] = await Promise.all([getStats(), getRecentActivity()]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-white font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-white/35 text-sm mt-1">Hidden Nepal CMS</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {[
          { label: "Destinations", value: stats.destinations, icon: "📍", href: "/admin/destinations" },
          { label: "Treks", value: stats.treks, icon: "🥾", href: "/admin/treks" },
          { label: "Gems (live)", value: stats.gems, icon: "✦", href: "/admin/gems" },
          { label: "Reviews", value: stats.reviews, icon: "★", href: "/admin/reviews" },
          { label: "Itineraries", value: stats.itineraries, icon: "📋", href: "/admin/itineraries" },
          { label: "Pending gems", value: stats.pendingGems, icon: "⏳", href: "/admin/gems?filter=pending", urgent: (stats.pendingGems ?? 0) > 0 },
        ].map((stat) => (
          <a key={stat.label} href={stat.href}
            className={`glass-card p-5 hover:-translate-y-0.5 hover:border-white/15 transition-all duration-200 ${stat.urgent ? "border-gold-500/30" : ""}`}
          >
            <p className="text-2xl mb-2">{stat.icon}</p>
            <p className={`text-2xl font-display font-medium ${stat.urgent ? "text-gold-400" : "text-white"}`}>{stat.value ?? 0}</p>
            <p className="text-white/35 text-xs mt-0.5">{stat.label}</p>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending gems */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/70 text-sm font-medium">Recent Gem Submissions</h3>
            <a href="/admin/gems" className="text-brand-400 text-xs hover:text-brand-300">View all →</a>
          </div>
          {activity.recentGems.length === 0 ? (
            <p className="text-white/25 text-sm">No recent submissions</p>
          ) : (
            <div className="space-y-3">
              {activity.recentGems.map((gem: any) => (
                <div key={gem.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white/70 text-sm">{gem.title}</p>
                    <p className="text-white/30 text-xs font-mono">{gem.region}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    gem.is_verified
                      ? "text-brand-400 border-brand-500/25 bg-brand-500/[0.08]"
                      : "text-gold-400 border-gold-500/25 bg-gold-500/[0.08]"
                  }`}>
                    {gem.is_verified ? "Verified" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent reviews */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/70 text-sm font-medium">Recent Reviews</h3>
            <a href="/admin/reviews" className="text-brand-400 text-xs hover:text-brand-300">View all →</a>
          </div>
          {activity.recentReviews.length === 0 ? (
            <p className="text-white/25 text-sm">No recent reviews</p>
          ) : (
            <div className="space-y-3">
              {activity.recentReviews.map((review: any) => (
                <div key={review.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white/70 text-sm">{review.title ?? "Untitled review"}</p>
                    <p className="text-gold-400 text-xs">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    review.is_published
                      ? "text-brand-400 border-brand-500/25"
                      : "text-white/30 border-white/10"
                  }`}>
                    {review.is_published ? "Live" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
        <p className="text-white/35 text-xs font-mono uppercase tracking-wider mb-4">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Add Destination", href: "/admin/destinations/new" },
            { label: "Add Trek", href: "/admin/treks/new" },
            { label: "Add Safety Alert", href: "/admin/alerts/new" },
            { label: "Review Pending Gems", href: "/admin/gems?filter=pending" },
          ].map((a) => (
            <a key={a.label} href={a.href} className="btn-ghost text-xs px-4 py-2 rounded-lg">
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
