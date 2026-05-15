// app/api/destinations/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getDestinations } from "@/lib/supabase/queries/destinations";
import type { SearchFilters } from "@/types";

export const runtime = "edge";
export const revalidate = 300; // 5 min cache

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const filters: SearchFilters = {
    category: searchParams.get("category") as any ?? undefined,
    province: searchParams.get("province") as any ?? undefined,
    isHiddenGem: searchParams.get("gem") === "true" ? true : undefined,
    query: searchParams.get("q") ?? undefined,
  };

  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = Math.min(parseInt(searchParams.get("limit") ?? "12"), 48);

  try {
    const result = await getDestinations(filters, page, pageSize);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 });
  }
}
