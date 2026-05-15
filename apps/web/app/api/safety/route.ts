// app/api/safety/route.ts

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const revalidate = 900; // 15 min cache

export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("safety_alerts")
    .select("*")
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt.now()")
    .order("severity", { ascending: false }) // critical first
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ alerts: [] }, { status: 500 });
  }

  return NextResponse.json(
    { alerts: data ?? [], count: data?.length ?? 0 },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    }
  );
}
