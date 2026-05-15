import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const Schema = z.object({
  title: z.string().optional(),
  days: z.number(),
  budgetUsd: z.number(),
  travelStyle: z.string(),
  interests: z.array(z.string()),
  trekkingLevel: z.string(),
  generatedPlan: z.any(),
  isPublic: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  try {
    const body = await req.json();
    const data = Schema.parse(body);
    const supabase = await createClient();

    const { data: saved, error } = await supabase
      .from("itineraries")
      .insert({
        user_id: userId || null,
        title: data.title || `${data.days}-Day ${data.travelStyle} Trip`,
        days: data.days,
        budget_usd: data.budgetUsd,
        travel_style: data.travelStyle,
        interests: data.interests,
        trekking_level: data.trekkingLevel,
        generated_plan: data.generatedPlan,
        is_public: data.isPublic,
      })
      .select("share_token")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, shareToken: saved.share_token });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
