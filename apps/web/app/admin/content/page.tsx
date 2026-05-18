import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

type ContentRow = {
  id: string;
  name: string;
  slug: string;
  type: "destination" | "adventure" | "trek";
  province?: string;
  category?: string;
  isPublished: boolean;
  imageUrl?: string;
};

async function getAllContent(): Promise<ContentRow[]> {
  const supabase = createAdminClient();
  const [destResp, advResp, trekResp] = await Promise.all([
    supabase.from("destinations").select("id, name, slug, province, category, is_published, cover_image_url"),
    supabase.from("adventures").select("id, name, slug, province, type, is_published, cover_image_url"),
    supabase.from("treks").select("id, name, slug, difficulty, is_published, cover_image_url"),
  ]);
  const rows: ContentRow[] = [];
  (destResp.data ?? []).forEach((d: any) => rows.push({
    id: d.id, name: d.name, slug: d.slug, type: "destination",
    province: d.province, category: d.category, isPublished: d.is_published, imageUrl: d.cover_image_url,
  }));
  (advResp.data ?? []).forEach((a: any) => rows.push({
    id: a.id, name: a.name, slug: a.slug, type: "adventure",
    province: a.province, category: a.type, isPublished: a.is_published, imageUrl: a.cover_image_url,
  }));
  (trekResp.data ?? []).forEach((t: any) => rows.push({
    id: t.id, name: t.name, slug: t.slug, type: "trek",
    category: t.difficulty, isPublished: t.is_published, imageUrl: t.cover_image_url,
  }));
  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows;
}

const TYPE_COLORS: Record<string, string> = {
  destination: "bg-blue-400/15 text-blue-400 border-blue-400/30",
  adventure: "bg-brand-500/15 text-brand-400 border-brand-500/30",
  trek: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30",
};

export default async function ContentAdminPage({ searchParams }: { searchParams: Promise<{ type?: string; q?: string }> }) {
  const sp = await searchParams;
  const all = await getAllContent();

  let filtered = all;
  if (sp.type && sp.type !== "all") filtered = filtered.filter(r => r.type === sp.type);
  if (sp.q) {
    const q = sp.q.toLowerCase();
    filtered = filtered.filter(r => r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q));
  }

  const counts = {
    all: all.length,
    destination: all.filter(r => r.type === "destination").length,
    adventure: all.filter(r => r.type === "adventure").length,
    trek: all.filter(r => r.type === "trek").length,
  };

  const editPath = (r: ContentRow) => {
    if (r.type === "destination") return `/admin/destinations/${r.id}/edit`;
    if (r.type === "adventure") return `/admin/adventures/${r.id}/edit`;
    if (r.type === "trek") return `/admin/treks/${r.id}/edit`;
    return "#";
  };

  const viewPath = (r: ContentRow) => {
    if (r.type === "destination") return `/destinations/${r.slug}`;
    if (r.type === "adventure") return `/adventures/${r.slug}`;
    if (r.type === "trek") return `/treks/${r.slug}`;
    return "#";
  };

  const apiResource = (t: string) => t === "destination" ? "destinations" : t === "adventure" ? "adventures" : "treks";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-display-md text-white mb-2">All Content</h1>
        <p className="text-white/40 text-sm">Manage destinations, adventures, and treks in one place.</p>
      </div>

      {/* Filter pills + search */}
      <div className="bg-base-900 border border-white/[0.08] rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-2 items-center mb-3">
          {[
            { value: "all", label: `All (${counts.all})` },
            { value: "destination", label: `Destinations (${counts.destination})` },
            { value: "adventure", label: `Adventures (${counts.adventure})` },
            { value: "trek", label: `Treks (${counts.trek})` },
          ].map(p => {
            const active = (sp.type ?? "all") === p.value;
            const qParam = sp.q ? `&q=${encodeURIComponent(sp.q)}` : "";
            return (
              <Link
                key={p.value}
                href={p.value === "all" ? `/admin/content${sp.q ? `?q=${encodeURIComponent(sp.q)}` : ""}` : `/admin/content?type=${p.value}${qParam}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${active ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-white/15 text-white/60 hover:border-white/40"}`}
              >
                {p.label}
              </Link>
            );
          })}
        </div>
        <form className="flex gap-2 items-center">
          <input
            name="q"
            type="text"
            defaultValue={sp.q}
            placeholder="Search by name or slug…"
            className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-brand-500 outline-none"
          />
          {sp.type && <input type="hidden" name="type" value={sp.type} />}
          <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded text-sm">Search</button>
          {(sp.q || sp.type) && (
            <Link href="/admin/content" className="text-white/50 hover:text-white text-sm px-3">Clear</Link>
          )}
        </form>
      </div>

      <p className="text-white/40 text-xs mb-3">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>

      <div className="bg-base-900 border border-white/[0.08] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-white/40 text-xs font-mono uppercase tracking-widest border-b border-white/[0.08]">
            <tr>
              <th className="text-left py-3 px-4 w-20">Type</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Location</th>
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-center py-3 px-4">Status</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={`${r.type}-${r.id}`} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="py-3 px-4">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${TYPE_COLORS[r.type]}`}>{r.type}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {r.imageUrl && <img src={r.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />}
                    <div>
                      <p className="text-white font-medium">{r.name}</p>
                      <p className="text-white/30 text-xs font-mono">{r.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-white/60 text-xs">{r.province ?? "—"}</td>
                <td className="py-3 px-4 text-white/60 text-xs">{r.category ?? "—"}</td>
                <td className="text-center py-3 px-4">
                  {r.isPublished
                    ? <span className="text-emerald-400 text-xs">Published</span>
                    : <span className="text-white/30 text-xs">Draft</span>}
                </td>
                <td className="text-right py-3 px-4">
                  <div className="flex gap-2 justify-end items-center">
                    <Link href={viewPath(r)} target="_blank" className="text-white/40 text-xs hover:text-white/80">View</Link>
                    <Link href={editPath(r)} className="text-brand-400 text-xs hover:text-brand-300">Edit</Link>
                    <DeleteButton id={r.id} name={r.name} resource={apiResource(r.type)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
