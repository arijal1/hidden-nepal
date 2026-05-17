import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

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
      .eq("id", (await params).id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/destinations PATCH]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("destinations").delete().eq("id", id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
