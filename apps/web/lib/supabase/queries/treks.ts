// lib/supabase/queries/treks.ts

import { createClient } from "@/lib/supabase/server";
import type { Trek, TrekDifficulty } from "@/types";

function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return obj;
  const result: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = snakeToCamel(obj[key]);
    if (key !== camelKey) result[key] = result[camelKey];
  }
  return result;
}



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
  return (data ?? []).map(snakeToCamel) as unknown as Trek[];
}

export async function getAllTrekSlugs(): Promise<string[]> {
  const { createAdminClient } = await import("@/lib/supabase/server");
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("treks")
    .select("slug")
    .eq("is_published", true);
  if (error) return [];
  return (data ?? []).map((t: any) => t.slug);
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
  return snakeToCamel(data) as any;
}
