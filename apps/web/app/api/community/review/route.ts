import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const Schema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(20).max(5000),
  visitedAt: z.string().optional(),
  season: z.string().optional(),
  destinationSlug: z.string().optional(),
  trekSlug: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = Schema.parse(body);
    const supabase = await createClient();

    // Resolve destination/trek ID from slug
    let destinationId: string | null = null;
    let trekId: string | null = null;

    if (data.destinationSlug) {
      const { data: dest } = await supabase
        .from("destinations")
        .select("id")
        .eq("slug", data.destinationSlug)
        .single();
      destinationId = dest?.id ?? null;
    }

    if (data.trekSlug) {
      const { data: trek } = await supabase
        .from("treks")
        .select("id")
        .eq("slug", data.trekSlug)
        .single();
      trekId = trek?.id ?? null;
    }

    if (!destinationId && !trekId) {
      return NextResponse.json({ error: "Must specify a destination or trek" }, { status: 400 });
    }

    const { error } = await supabase.from("reviews").insert({
      user_id: userId,
      destination_id: destinationId,
      trek_id: trekId,
      rating: data.rating,
      title: data.title || null,
      body: data.body,
      visited_at: data.visitedAt || null,
      season_visited: data.season || null,
      is_published: false, // pending moderation
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
