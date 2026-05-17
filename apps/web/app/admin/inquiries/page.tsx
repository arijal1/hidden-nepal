import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  new: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  contacted: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  quoted: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  converted: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  closed: "text-white/40 border-white/15 bg-white/[0.04]",
  spam: "text-red-400 border-red-400/30 bg-red-400/10",
};

export default async function InquiriesAdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const supabase = createAdminClient();

  let q = supabase
    .from("inquiries")
    .select("*, adventure:adventures(name, slug), destination:destinations(name, slug)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (params.status) q = q.eq("status", params.status);

  const { data: inquiries } = await q;
  const list = inquiries ?? [];

  const { data: stats } = await supabase
    .from("inquiries")
    .select("status", { count: "exact" });

  const counts: Record<string, number> = {};
  (stats ?? []).forEach((r: any) => {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  });
  const total = stats?.length ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-display-md text-white mb-2">Inquiries</h1>
        <p className="text-white/40 text-sm">Leads from adventure & destination pages</p>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <StatusPill href="/admin/inquiries" label="All" count={total} active={!params.status} />
        {["new", "contacted", "quoted", "converted", "closed", "spam"].map((s) => (
          <StatusPill key={s} href={`/admin/inquiries?status=${s}`} label={s} count={counts[s] ?? 0} active={params.status === s} />
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-white/40 text-center py-16">No inquiries yet.</p>
      ) : (
        <div className="space-y-3">
          {list.map((i: any) => (
            <div key={i.id} className="bg-base-900 border border-white/[0.08] rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-medium">{i.name}</p>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${STATUS_COLORS[i.status]}`}>{i.status}</span>
                  </div>
                  <p className="text-white/55 text-sm">
                    <a href={`mailto:${i.email}`} className="hover:text-white">{i.email}</a>
                    {i.phone && <> · <a href={`tel:${i.phone}`} className="hover:text-white">{i.phone}</a></>}
                    {i.country && <> · {i.country}</>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-xs font-mono">{new Date(i.created_at).toLocaleString()}</p>
                  {i.adventure && <p className="text-brand-400 text-sm mt-1">{i.adventure.name}</p>}
                  {i.destination && <p className="text-brand-400 text-sm mt-1">{i.destination.name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                {i.preferred_date && <Stat label="Date" value={new Date(i.preferred_date).toLocaleDateString()} />}
                {i.flexible_dates && <Stat label="Flexible?" value="Yes" />}
                {i.group_size && <Stat label="Group" value={String(i.group_size)} />}
                {i.budget_usd && <Stat label="Budget" value={`$${i.budget_usd}`} />}
              </div>

              {i.message && (
                <div className="bg-white/[0.03] rounded-lg p-3 text-white/70 text-sm mb-3">{i.message}</div>
              )}

              <div className="flex gap-2 flex-wrap">
                <a href={`mailto:${i.email}?subject=Re: Your ${i.adventure?.name ?? "inquiry"} inquiry`} className="text-xs px-3 py-1.5 border border-white/15 rounded text-white/80 hover:bg-white/[0.05]">Reply</a>
                {i.phone && <a href={`tel:${i.phone}`} className="text-xs px-3 py-1.5 border border-white/15 rounded text-white/80 hover:bg-white/[0.05]">Call</a>}
                {i.whatsapp && <a href={`https://wa.me/${i.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" className="text-xs px-3 py-1.5 border border-emerald-400/30 rounded text-emerald-400 hover:bg-emerald-400/10">WhatsApp</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ href, label, count, active }: any) {
  return (
    <a href={href} className={`px-3 py-1.5 rounded-full text-sm border transition-all ${active ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-white/15 text-white/60 hover:border-white/40"}`}>
      <span className="capitalize">{label}</span> <span className="text-white/40 text-xs">{count}</span>
    </a>
  );
}

function Stat({ label, value }: any) {
  return (
    <div>
      <p className="text-white/35 text-[10px] font-mono uppercase tracking-wider">{label}</p>
      <p className="text-white/80">{value}</p>
    </div>
  );
}
