import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("destinations")
      .update({
        name: data.name,
        name_nepali: data.nameNepali || null,
        tagline: data.tagline || null,
        description: data.description || null,
        province: data.province,
        category: data.category,
        is_hidden_gem: data.isHiddenGem,
        is_featured: data.isFeatured,
        is_published: data.isPublished,
        elevation_m: data.elevationM ? parseInt(data.elevationM) : null,
        best_season: data.bestSeason,
        cover_image_url: data.coverImageUrl || null,
        tags: data.tags ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        seo_title: data.seoTitle || null,
        seo_description: data.seoDescription || null,
      })
      .eq("id", params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/destinations PATCH]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
