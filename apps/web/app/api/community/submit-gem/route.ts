// app/api/community/submit-gem/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const Schema = z.object({
  title: z.string().min(3).max(120),
  story: z.string().min(20).max(2000),
  region: z.string().min(2).max(100),
  province: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = Schema.parse(body);

    const supabase = createAdminClient();

    const coordinates =
      data.lat && data.lng
        ? `POINT(${parseFloat(data.lng)} ${parseFloat(data.lat)})`
        : null;

    const { error } = await supabase.from("hidden_gems").insert({
      title: data.title,
      story: data.story,
      region: data.region,
      province: data.province || null,
      coordinates: coordinates
        ? { type: "Point", coordinates: [parseFloat(data.lng!), parseFloat(data.lat!)] }
        : null,
      is_verified: false,
      is_published: false,
    });

    if (error) throw error;

    // In production: send notification email to admin
    // await sendAdminNotification({ type: "new_gem_submission", title: data.title });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: err.errors }, { status: 400 });
    }
    console.error("[submit-gem]", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
