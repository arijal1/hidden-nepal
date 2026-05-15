import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(2),
  nameNepali: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  slug: z.string().min(2),
  province: z.string(),
  category: z.string(),
  isHiddenGem: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  lat: z.string().optional(),
  lng: z.string().optional(),
  elevationM: z.string().optional(),
  bestSeason: z.array(z.string()).default([]),
  coverImageUrl: z.string().optional(),
  tags: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = Schema.parse(body);
    const supabase = createAdminClient();

    const { error } = await supabase.from("destinations").insert({
      name: data.name,
      name_nepali: data.nameNepali || null,
      tagline: data.tagline || null,
      description: data.description || null,
      slug: data.slug,
      province: data.province,
      category: data.category,
      is_hidden_gem: data.isHiddenGem,
      is_featured: data.isFeatured,
      is_published: data.isPublished,
      coordinates: data.lat && data.lng
        ? `SRID=4326;POINT(${parseFloat(data.lng)} ${parseFloat(data.lat)})`
        : null,
      elevation_m: data.elevationM ? parseInt(data.elevationM) : null,
      best_season: data.bestSeason,
      cover_image_url: data.coverImageUrl || null,
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      seo_title: data.seoTitle || null,
      seo_description: data.seoDescription || null,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A destination with this slug already exists" }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: err.errors }, { status: 400 });
    }
    console.error("[admin/destinations POST]", err);
    return NextResponse.json({ error: "Failed to create destination" }, { status: 500 });
  }
}
