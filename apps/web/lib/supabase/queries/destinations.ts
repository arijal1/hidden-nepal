// lib/supabase/queries/destinations.ts

import { createClient } from "@/lib/supabase/server";
import type { Destination, SearchFilters, PaginatedResponse } from "@/types";

function parseCoords(geo: any): { lat: number; lng: number } | null {
  if (!geo) return null;
  if (geo.coordinates && Array.isArray(geo.coordinates)) {
    return { lng: geo.coordinates[0], lat: geo.coordinates[1] };
  }
  return null;
}


export async function getDestinations(
  filters: SearchFilters = {},
  page = 1,
  pageSize = 12
): Promise<PaginatedResponse<Destination>> {
  const supabase = await createClient();
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("destinations")
    .select(`
      *,
      provinces(name),
      transport_routes(*)
    `, { count: "exact" })
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("avg_rating", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.province) query = query.eq("province_id", filters.province);
  if (filters.isHiddenGem) query = query.eq("is_hidden_gem", true);
  if (filters.query) {
    query = query.textSearch("fts", filters.query, {
      type: "websearch",
      config: "english",
    });
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[getDestinations]", error);
    return { data: [], total: 0, page, pageSize, hasMore: false };
  }

  return {
    data: (data ?? []) as unknown as Destination[],
    total: count ?? 0,
    page,
    pageSize,
    hasMore: offset + pageSize < (count ?? 0),
  };
}

export async function getDestinationBySlug(
  slug: string
): Promise<Destination | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("destinations")
    .select(`
      *,
      provinces(name, slug),
      transport_routes(*),
      reviews(
        id, rating, title, body, visited_at, media_urls, created_at,
        profiles(id, username, full_name, avatar_url)
      ),
      hidden_gems(id, title, story, cover_image_url, coordinates, upvotes)
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return data as unknown as Destination;
}

export async function getNearbyDestinations(
  lat: number,
  lng: number,
  radiusKm = 50,
  limit = 6
): Promise<Destination[]> {
  const supabase = await createClient();

  // PostGIS ST_DWithin for spatial query
  const { data, error } = await supabase.rpc("nearby_destinations", {
    lat,
    lng,
    radius_km: radiusKm,
    result_limit: limit,
  });

  if (error) {
    console.error("[getNearbyDestinations]", error);
    return [];
  }

  return (data ?? []) as Destination[];
}

export async function getFeaturedDestinations(limit = 6): Promise<Destination[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("destinations")
    .select("id, slug, name, tagline, category, cover_image_url, avg_rating, is_hidden_gem, province_id, coordinates")
    .eq("is_featured", true)
    .eq("is_published", true)
    .order("avg_rating", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []).map((d: any) => ({
  ...d,
  coordinates: parseCoords(d.coordinates),
})) as unknown as Destination[];
}

export async function getHiddenGems(limit = 9) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hidden_gems")
    .select(`
      *,
      destinations(slug, name, province_id)
    `)
    .eq("is_published", true)
    .eq("is_verified", true)
    .order("upvotes", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}

export async function getAllDestinationSlugs(): Promise<string[]> {
  const { createAdminClient } = await import("@/lib/supabase/server");
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("destinations")
    .select("id, slug, name, tagline, category, cover_image_url, avg_rating")
    .eq("is_published", true)
    .textSearch("fts", query, { type: "websearch", config: "english" })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}

// For static generation — get all published slugs
