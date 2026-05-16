import { createAdminClient } from "@/lib/supabase/server";

const LIMITS: Record<string, number> = {
  itinerary: 10,
  recommendations: 50,
};

export async function checkRateLimit(userId: string, endpoint: string) {
  const limit = LIMITS[endpoint] ?? 100;
  const supabase = createAdminClient();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("ai_usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("endpoint", endpoint)
    .gte("used_at", dayAgo);
  if (error) return { allowed: true, used: 0, limit };
  return { allowed: (count ?? 0) < limit, used: count ?? 0, limit };
}

export async function logUsage(userId: string, endpoint: string) {
  const supabase = createAdminClient();
  await supabase.from("ai_usage").insert({ user_id: userId, endpoint });
}
