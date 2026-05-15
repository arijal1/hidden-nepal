import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";

async function getDestinations(page = 1, filter?: string) {
  const supabase = createAdminClient();
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("destinations")
    .select("id, slug, name, category, province, is_published, is_featured, is_hidden_gem, avg_rating, review_count, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (filter === "published") query = query.eq("is_published", true);
  if (filter === "unpublished") query = query.eq("is_published", false);
  if (filter === "gems") query = query.eq("is_hidden_gem", true);

  return query;
}

export default async function AdminDestinationsPage({
  searchParams,
}: {
  searchParams: { page?: string; filter?: string };
}) {
  const page = parseInt(searchParams.page ?? "1");
  const { data, count } = await getDestinations(page, searchParams.filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white font-display text-2xl font-semibold">Destinations</h1>
          <p className="text-white/35 text-sm mt-1">{count ?? 0} total</p>
        </div>
        <Link href="/admin/destinations/new" className="btn-primary text-sm px-5 py-2.5 rounded-xl">
          + Add Destination
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { value: undefined, label: "All" },
          { value: "published", label: "Published" },
          { value: "unpublished", label: "Drafts" },
          { value: "gems", label: "Hidden Gems" },
        ].map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/admin/destinations?filter=${f.value}` : "/admin/destinations"}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              searchParams.filter === f.value || (!searchParams.filter && !f.value)
                ? "border-brand-500/40 bg-brand-500/10 text-brand-400"
                : "border-white/[0.08] text-white/40 hover:text-white/70"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.07]">
              {["Name", "Category", "Province", "Rating", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-white/30 text-xs font-mono uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {(data ?? []).map((dest: any) => (
              <tr key={dest.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-white/80 font-medium">{dest.name}</p>
                    <p className="text-white/25 text-xs font-mono">{dest.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-white/50 text-xs capitalize">{dest.category?.replace("_", " ")}</span>
                  {dest.is_hidden_gem && <span className="ml-2 gem-badge text-[8px]">Gem</span>}
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">{dest.province}</td>
                <td className="px-4 py-3 text-gold-400 text-xs font-mono">
                  ★ {dest.avg_rating} ({dest.review_count})
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    dest.is_published
                      ? "text-brand-400 border-brand-500/25 bg-brand-500/[0.07]"
                      : "text-white/30 border-white/10"
                  }`}>
                    {dest.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/destinations/${dest.slug}`} target="_blank" className="text-white/25 text-xs hover:text-white/60">View</Link>
                    <Link href={`/admin/destinations/${dest.id}/edit`} className="text-brand-400 text-xs hover:text-brand-300">Edit</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(count ?? 0) > 20 && (
        <div className="flex gap-3 mt-6 justify-center">
          {page > 1 && (
            <Link href={`/admin/destinations?page=${page - 1}`} className="btn-ghost px-4 py-2 rounded-lg text-sm">← Prev</Link>
          )}
          <span className="text-white/30 text-sm self-center">Page {page} of {Math.ceil((count ?? 0) / 20)}</span>
          {page < Math.ceil((count ?? 0) / 20) && (
            <Link href={`/admin/destinations?page=${page + 1}`} className="btn-primary px-4 py-2 rounded-lg text-sm">Next →</Link>
          )}
        </div>
      )}
    </div>
  );
}
