// app/api/locations/import/route.ts
// Full pipeline: geocoded location + enriched data → Supabase destinations table

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/formatters";
import { z } from "zod";

export const runtime = "nodejs";

const Schema = z.object({
  // Core location
  name: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  province: z.string(),

  // AI-enriched fields
  tagline: z.string().nullish(),
  description: z.string().nullish(),
  category: z.string().default("cultural"),
  isHiddenGem: z.boolean().default(false),
  highlights: z.array(z.string()).default([]),
  bestSeason: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  elevationM: z.number().nullish(),
  seoTitle: z.string().nullish(),
  seoDescription: z.string().nullish(),

  // Optional overrides
  coverImageUrl: z.string().nullish(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = Schema.parse(body);
    data.province = data.province.replace(/\s+Province$/i, "").trim();

    const supabase = createAdminClient();

    // Generate unique slug
    let slug = slugify(data.name);
    const { data: existing } = await supabase
      .from("destinations")
      .select("slug")
      .eq("slug", slug)
      .single();

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Look up province_id
    const { data: provinceRow } = await supabase
      .from("provinces")
      .select("id")
      .ilike("name", data.province)
      .single();

    const { data: saved, error } = await supabase
      .from("destinations")
      .insert({
        name: data.name,
        slug,
        tagline: data.tagline ?? null,
        description: data.description ?? null,
        province: data.province,
        province_id: provinceRow?.id ?? null,
        category: data.category,
        is_hidden_gem: data.isHiddenGem,
        is_featured: data.isFeatured,
        is_published: data.isPublished,
        coordinates: `SRID=4326;POINT(${data.lng} ${data.lat})`,
        elevation_m: data.elevationM ?? null,
        best_season: data.bestSeason,
        highlights: data.highlights,
        warnings: data.warnings,
        tags: data.tags,
        cover_image_url: data.coverImageUrl ?? null,
        seo_title: data.seoTitle ?? null,
        seo_description: data.seoDescription ?? null,
      })
      .select("id, slug")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Destination already exists with this slug" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      id: saved.id,
      slug: saved.slug,
      url: `/destinations/${saved.slug}`,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: err.errors },
        { status: 400 }
      );
    }
    console.error("[location import]", err);
    return NextResponse.json(
      { error: "Import failed" },
      { status: 500 }
    );
  }
}
