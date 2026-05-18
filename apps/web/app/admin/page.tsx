import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getOverview() {
  const supabase = createAdminClient();
  const [destResp, trekResp, advResp, opsResp, inqResp, newInqResp, recentInq] = await Promise.all([
    supabase.from("destinations").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("treks").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("adventures").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("operators").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("inquiries").select("*, adventure:adventures(name, slug)").order("created_at", { ascending: false }).limit(5),
  ]);

  return {
    destinations: destResp.count ?? 0,
    treks: trekResp.count ?? 0,
    adventures: advResp.count ?? 0,
    operators: opsResp.count ?? 0,
    inquiriesTotal: inqResp.count ?? 0,
    inquiriesNew: newInqResp.count ?? 0,
    recentInquiries: recentInq.data ?? [],
  };
}

const QUICK_ACTIONS = [
  { label: "Content", items: [
    { name: "Destinations", href: "/admin/destinations", desc: "Browse, edit, delete" },
    { name: "Treks", href: "/admin/destinations", desc: "Manage trek listings" },
    { name: "Adventures", href: "/adventures", desc: "View adventures (admin DB only)" },
    { name: "Hidden Gems", href: "/admin/gems", desc: "Community submissions" },
  ]},
  { label: "Imports", items: [
    { name: "Bulk Import V2", href: "/admin/bulk-import-v2", desc: "Curated OSM + Wikipedia" },
    { name: "Location Import", href: "/admin/locations", desc: "Add single location" },
    { name: "Trek Import", href: "/admin/trek-import", desc: "Import curated treks" },
  ]},
  { label: "Quality & Routes", items: [
    { name: "Data Quality", href: "/admin/data-quality", desc: "Find & AI-fill gaps" },
    { name: "Trek Routes", href: "/admin/trek-routes", desc: "Edit waypoints" },
    { name: "Transport", href: "/admin/transport-generator", desc: "Generate routes" },
  ]},
  { label: "Revenue", items: [
    { name: "Inquiries", href: "/admin/inquiries", desc: "Leads from forms" },
    { name: "Operators", href: "/admin/operators", desc: "Partner directory" },
  ]},
  { label: "Moderation", items: [
    { name: "Reviews", href: "/admin/reviews", desc: "Approve/reject" },
    { name: "Safety Alerts", href: "/admin/alerts", desc: "Live travel warnings" },
  ]},
];

export default async function AdminLandingPage() {
  const o = await getOverview();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-display-md text-white mb-2">Admin</h1>
        <p className="text-white/40 text-sm">Hidden Nepal control center</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        <StatTile label="Destinations" value={o.destinations} href="/admin/destinations" />
        <StatTile label="Treks" value={o.treks} href="/admin/trek-routes" />
        <StatTile label="Adventures" value={o.adventures} href="/adventures" />
        <StatTile label="Operators" value={o.operators} href="/admin/operators" />
        <StatTile label="Inquiries" value={o.inquiriesTotal} href="/admin/inquiries" />
        <StatTile label="New leads" value={o.inquiriesNew} href="/admin/inquiries?status=new" highlight={o.inquiriesNew > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent inquiries */}
        <div className="lg:col-span-1 bg-base-900 border border-white/[0.08] rounded-xl p-5">
          <h2 className="text-white/80 text-sm font-mono uppercase tracking-widest mb-4">Recent Inquiries</h2>
          {o.recentInquiries.length === 0 ? (
            <p className="text-white/40 text-sm">No inquiries yet.</p>
          ) : (
            <div className="space-y-3">
              {o.recentInquiries.map((i: any) => (
                <Link key={i.id} href="/admin/inquiries" className="block p-3 rounded-lg hover:bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-white text-sm font-medium truncate">{i.name}</p>
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${i.status === "new" ? "bg-blue-400/15 text-blue-400" : "bg-white/5 text-white/40"}`}>{i.status}</span>
                  </div>
                  <p className="text-white/40 text-xs truncate">{i.adventure?.name ?? i.inquiry_type}</p>
                  <p className="text-white/30 text-[10px] font-mono mt-1">{new Date(i.created_at).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
          <Link href="/admin/inquiries" className="text-brand-400 text-xs mt-4 inline-block hover:underline">View all →</Link>
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 space-y-5">
          {QUICK_ACTIONS.map((section) => (
            <div key={section.label}>
              <h3 className="text-white/40 text-xs font-mono uppercase tracking-widest mb-3">{section.label}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {section.items.map((item) => (
                  <Link key={item.name} href={item.href} className="block p-3 rounded-lg bg-base-900 border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.02] transition-all">
                    <p className="text-white text-sm font-medium">{item.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, href, highlight }: { label: string; value: number; href: string; highlight?: boolean }) {
  return (
    <Link href={href} className={`block bg-base-900 border rounded-xl p-4 hover:border-white/20 transition-all ${highlight ? "border-brand-500/40 bg-brand-500/[0.04]" : "border-white/[0.08]"}`}>
      <p className="text-white/35 text-[10px] font-mono uppercase tracking-widest">{label}</p>
      <p className={`font-display text-3xl mt-1 ${highlight ? "text-brand-400" : "text-white"}`}>{value}</p>
    </Link>
  );
}
