import { createAdminClient } from "@/lib/supabase/server";
import { ReviewModerationClient } from "./ReviewModerationClient";

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const supabase = createAdminClient();
  let query = supabase
    .from("reviews")
    .select(`
      id, rating, title, body, is_published, is_flagged, created_at,
      profiles(username, full_name),
      destinations(name, slug)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (searchParams.filter === "pending") query = query.eq("is_published", false);
  if (searchParams.filter === "flagged") query = query.eq("is_flagged", true);

  const { data: reviews } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white font-display text-2xl font-semibold">Reviews</h1>
          <p className="text-white/35 text-sm mt-1">Moderate community reviews</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: undefined, label: "All" },
          { value: "pending", label: "Pending" },
          { value: "flagged", label: "Flagged" },
        ].map((f) => (
          <a key={f.label}
            href={f.value ? `/admin/reviews?filter=${f.value}` : "/admin/reviews"}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              searchParams.filter === f.value || (!searchParams.filter && !f.value)
                ? "border-brand-500/40 bg-brand-500/10 text-brand-400"
                : "border-white/[0.08] text-white/40 hover:text-white/70"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <ReviewModerationClient reviews={reviews ?? []} />
    </div>
  );
}
