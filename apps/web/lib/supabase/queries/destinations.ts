// lib/supabase/queries/destinations.ts

import { createClient } from "@/lib/supabase/server";
import type { Destination, SearchFilters, PaginatedResponse } from "@/types";


function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return obj;
  const result: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = snakeToCamel(obj[key]);
    // Keep snake_case too for backwards compat
    if (key !== camelKey) result[key] = result[camelKey];
  }
  return result;
}

function parseCoords(geo: any): { lat: number; lng: number } | null {
  if (!geo) return null;
  // GeoJSON object format
  if (typeof geo === "object" && geo.coordinates && Array.isArray(geo.coordinates)) {
    return { lng: geo.coordinates[0], lat: geo.coordinates[1] };
  }
  // WKB hex string format from PostGIS (e.g. "0101000020E6100000...")
  if (typeof geo === "string" && geo.length >= 50) {
    try {
      const hex = geo.slice(18); // skip header
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
      }
      const view = new DataView(bytes.buffer);
      return {
        lng: view.getFloat64(0, true),
        lat: view.getFloat64(8, true),
      };
    } catch {
      return null;
    }
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
  if (filters.province) query = query.eq("province", filters.province);
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
    data: (data ?? []).map((d: any) => ({ ...snakeToCamel(d), coordinates: parseCoords(d.coordinates) })) as unknown as Destination[],
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
  const transformed = snakeToCamel(data);
  transformed.coordinates = parseCoords((data as any).coordinates);
  if ((data as any).hidden_gems) {
    transformed.hiddenGems = (data as any).hidden_gems.map((g: any) => ({
      ...snakeToCamel(g),
      coordinates: parseCoords(g.coordinates),
    }));
  }
  return transformed as Destination;
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
    .from("destinations")
    .select("id, slug, name, tagline, description, category, province, cover_image_url, avg_rating, coordinates")
    .eq("is_hidden_gem", true)
    .eq("is_published", true)
    .order("avg_rating", { ascending: false })
    .limit(limit);
  if (error) { console.error("[getHiddenGems]", error); return []; }
  return (data ?? []).map((d: any) => ({
    ...d,
    coordinates: parseCoords(d.coordinates),
    coverImageUrl: d.cover_image_url,
    title: d.name,
    story: d.tagline ?? (d.description?.slice(0, 200) ?? ""),
    region: d.province,
  }));
}

export async function getAllDestinationSlugs(): Promise<string[]> {
  const { createAdminClient } = await import("@/lib/supabase/server");
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("slug")
    .eq("is_published", true);
  if (error) return [];
  return (data ?? []).map((d: any) => d.slug);
}

// For static generation — get all published slugs
