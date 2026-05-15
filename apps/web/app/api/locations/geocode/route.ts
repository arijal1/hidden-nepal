// app/api/locations/geocode/route.ts
// Search Nepal locations via Mapbox Geocoding API

import { NextRequest, NextResponse } from "next/server";
import { geocodeLocation } from "@/lib/mapbox/geocoding";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await geocodeLocation(query);
    return NextResponse.json({ results, query });
  } catch (error) {
    console.error("[geocode]", error);
    return NextResponse.json(
      { error: "Geocoding failed", results: [] },
      { status: 500 }
    );
  }
}
