import { createAdminClient } from "@/lib/supabase/server";
import { GemModerationClient } from "./GemModerationClient";

async function getGems(filter?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("hidden_gems")
    .select("*, profiles(username, full_name)")
    .order("created_at", { ascending: false });

  if (filter === "pending") query = query.eq("is_verified", false);
  if (filter === "published") query = query.eq("is_published", true);

  const { data } = await query.limit(50);
  return data ?? [];
}

export default async function AdminGemsPage({ searchParams }: { searchParams: { filter?: string } }) {
  const gems = await getGems(searchParams.filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white font-display text-2xl font-semibold">Hidden Gems</h1>
          <p className="text-white/35 text-sm mt-1">Moderate community submissions</p>
        </div>
      </div>
      <GemModerationClient gems={gems} />
    </div>
  );
}
