import { NextRequest, NextResponse } from "next/server";
import { getNearbyDestinations } from "@/lib/supabase/queries/destinations";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radius = parseFloat(searchParams.get("radius") ?? "50");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const destinations = await getNearbyDestinations(lat, lng, radius, 12);
  return NextResponse.json({ destinations, total: destinations.length });
}
