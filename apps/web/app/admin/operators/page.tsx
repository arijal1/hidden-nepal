import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SPECIALTY_COLORS: Record<string, string> = {
  rafting: "#2a5d8f",
  paragliding: "#e9a829",
  bungee: "#c84630",
  mtb: "#4a7c4e",
  heli: "#4a6fa5",
  wildlife: "#7d745f",
  kayaking: "#2a5d8f",
  zipline: "#d97a3a",
  canyoning: "#4a7c4e",
  climbing: "#9a8f80",
};

export default async function OperatorsAdminPage() {
  const supabase = createAdminClient();

  // Operators with their adventure count
  const { data: operators } = await supabase
    .from("operators")
    .select("*, adventures(id, name)")
    .order("name");

  // Aggregate inquiry counts per operator
  const { data: inquiryCounts } = await supabase
    .from("inquiries")
    .select("adventure_id, adventures(operator_id)")
    .not("adventure_id", "is", null);

  const opInquiryCount: Record<string, number> = {};
  (inquiryCounts ?? []).forEach((row: any) => {
    const opId = row.adventures?.operator_id;
    if (opId) opInquiryCount[opId] = (opInquiryCount[opId] ?? 0) + 1;
  });

  const total = (operators ?? []).length;
  const verified = (operators ?? []).filter((o: any) => o.is_verified).length;
  const featured = (operators ?? []).filter((o: any) => o.is_featured).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-display-md text-white mb-2">Operators</h1>
        <p className="text-white/40 text-sm">Local providers running adventures. Inquiries route here.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total" value={total} />
        <StatCard label="Verified" value={verified} accent="emerald" />
        <StatCard label="Featured" value={featured} accent="brand" />
      </div>

      {/* Operators grid */}
      <div className="space-y-3">
        {(operators ?? []).map((op: any) => {
          const adventureCount = op.adventures?.length ?? 0;
          const inquiryCount = opInquiryCount[op.id] ?? 0;
          return (
            <div key={op.id} className="bg-base-900 border border-white/[0.08] rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-white font-medium text-lg">{op.name}</p>
                    {op.is_verified && <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-emerald-400/30 text-emerald-400 bg-emerald-400/10">Verified</span>}
                    {op.is_featured && <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-brand-500/30 text-brand-400 bg-brand-500/10">Featured</span>}
                    {!op.is_active && <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-red-400/30 text-red-400 bg-red-400/10">Inactive</span>}
                    {op.established_year && <span className="text-white/40 text-xs">est. {op.established_year}</span>}
                  </div>
                  {op.description && <p className="text-white/55 text-sm leading-relaxed mt-1 line-clamp-2">{op.description}</p>}
                </div>
                <div className="text-right text-xs space-y-1">
                  <p className="text-white/40">Commission: <span className="text-white">{op.commission_rate}%</span></p>
                  <p className="text-white/40">Adventures: <span className="text-white">{adventureCount}</span></p>
                  <p className="text-white/40">Inquiries: <span className="text-white">{inquiryCount}</span></p>
                </div>
              </div>

              {/* Specialties */}
              {op.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {op.specialties.map((s: string) => (
                    <span key={s} className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full" style={{ background: (SPECIALTY_COLORS[s] ?? "#888") + "20", color: SPECIALTY_COLORS[s] ?? "#aaa" }}>
                      {s}
                    </span>
                  ))}
                  {op.regions?.length > 0 && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/[0.05] text-white/50">
                      {op.regions.join(", ")}
                    </span>
                  )}
                </div>
              )}

              {/* Contact + actions */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.06]">
                {op.email && <a href={`mailto:${op.email}`} className="text-xs px-3 py-1.5 border border-white/15 rounded text-white/80 hover:bg-white/[0.05]">📧 {op.email}</a>}
                {op.phone && <a href={`tel:${op.phone}`} className="text-xs px-3 py-1.5 border border-white/15 rounded text-white/80 hover:bg-white/[0.05]">📞 {op.phone}</a>}
                {op.whatsapp && <a href={`https://wa.me/${op.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" className="text-xs px-3 py-1.5 border border-emerald-400/30 rounded text-emerald-400 hover:bg-emerald-400/10">WhatsApp</a>}
                {op.website && <a href={op.website} target="_blank" className="text-xs px-3 py-1.5 border border-brand-500/30 rounded text-brand-400 hover:bg-brand-500/10">Website ↗</a>}
              </div>

              {/* Adventures */}
              {op.adventures?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.04]">
                  <p className="text-white/35 text-[10px] font-mono uppercase tracking-widest mb-2">Runs these adventures:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {op.adventures.map((a: any) => (
                      <Link key={a.id} href={`/adventures/${a.id}`} className="text-xs text-white/65 hover:text-white border border-white/10 hover:border-white/30 rounded px-2 py-0.5">
                        {a.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  const colors: Record<string, string> = {
    emerald: "text-emerald-400 border-emerald-400/30",
    brand: "text-brand-400 border-brand-500/30",
  };
  return (
    <div className="bg-base-900 border border-white/[0.08] rounded-xl p-4">
      <p className="text-white/35 text-[10px] font-mono uppercase tracking-widest">{label}</p>
      <p className={`font-display text-3xl mt-1 ${accent ? colors[accent].split(' ')[0] : "text-white"}`}>{value}</p>
    </div>
  );
}
