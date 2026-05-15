// app/api/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { SearchResult } from "@/types";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const type = searchParams.get("type"); // destinations | treks | gems | all
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 20);

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [], total: 0 });
  }

  const supabase = createAdminClient();
  const results: SearchResult[] = [];

  try {
    // ── Destinations ──────────────────────────────────
    if (!type || type === "all" || type === "destinations") {
      const { data: destinations } = await supabase
        .from("destinations")
        .select("id, slug, name, tagline, category, cover_image_url, is_hidden_gem")
        .eq("is_published", true)
        .textSearch("fts", query, { type: "websearch", config: "english" })
        .limit(type === "destinations" ? limit : Math.ceil(limit / 3));

      if (destinations) {
        results.push(
          ...destinations.map((d) => ({
            id: d.id,
            type: "destination" as const,
            slug: d.slug,
            name: d.name,
            tagline: d.tagline,
            coverImageUrl: d.cover_image_url,
            category: d.category,
          }))
        );
      }
    }

    // ── Treks ─────────────────────────────────────────
    if (!type || type === "all" || type === "treks") {
      const { data: treks } = await supabase
        .from("treks")
        .select("id, slug, name, difficulty, cover_image_url")
        .eq("is_published", true)
        .textSearch("fts", query, { type: "websearch", config: "english" })
        .limit(type === "treks" ? limit : Math.ceil(limit / 3));

      if (treks) {
        results.push(
          ...treks.map((t) => ({
            id: t.id,
            type: "trek" as const,
            slug: t.slug,
            name: t.name,
            coverImageUrl: t.cover_image_url,
            difficulty: t.difficulty,
          }))
        );
      }
    }

    // ── Hidden Gems ───────────────────────────────────
    if (!type || type === "all" || type === "gems") {
      const { data: gems } = await supabase
        .from("hidden_gems")
        .select(`
          id,
          title,
          cover_image_url,
          destinations(slug)
        `)
        .eq("is_published", true)
        .eq("is_verified", true)
        .ilike("title", `%${query}%`)
        .limit(type === "gems" ? limit : Math.ceil(limit / 3));

      if (gems) {
        results.push(
          ...gems.map((g: any) => ({
            id: g.id,
            type: "hidden_gem" as const,
            slug: g.destinations?.slug ?? "hidden-gems",
            name: g.title,
            coverImageUrl: g.cover_image_url,
          }))
        );
      }
    }

    return NextResponse.json({
      results: results.slice(0, limit),
      total: results.length,
      query,
    });
  } catch (error) {
    console.error("[search API]", error);
    return NextResponse.json(
      { error: "Search failed", results: [], total: 0 },
      { status: 500 }
    );
  }
}
