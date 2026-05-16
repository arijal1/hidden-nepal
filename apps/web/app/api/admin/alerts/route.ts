import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const Schema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
  severity: z.enum(["info", "warning", "critical"]).default("warning"),
  province: z.string().optional(),
  region: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const data = Schema.parse(await req.json());
    const supabase = createAdminClient();

    const { error } = await supabase.from("safety_alerts").insert({
      title: data.title,
      body: data.body,
      severity: data.severity,
      province: data.province || null,
      region: data.region || null,
      expires_at: data.expiresAt || null,
      is_active: data.isActive,
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}
