// lib/supabase/queries/treks.ts

import { createClient } from "@/lib/supabase/server";
import type { Trek, TrekDifficulty } from "@/types";

export async function getTreks(
  difficulty?: TrekDifficulty,
  limit = 12
): Promise<Trek[]> {
  const supabase = await createClient();

  let query = supabase
    .from("treks")
    .select("*")
    .eq("is_published", true)
    .order("duration_days", { ascending: true })
    .limit(limit);

  if (difficulty) query = query.eq("difficulty", difficulty);

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as unknown as Trek[];
}

export async function getAllTrekSlugs(): Promise<string[]> {
  const { createAdminClient } = await import("@/lib/supabase/server");
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("treks")
    .select(`
      *,
      trek_stages(* ORDER BY stage_number ASC)
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return data as unknown as Trek;
}


export async function getTrekBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("treks")
    .select(`
      *,
      trek_stages(*),
      reviews(
        id, rating, title, body, created_at,
        profiles(id, username, full_name, avatar_url)
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  if (error || !data) return null;
  return data as any;
}
