// app/api/locations/enrich/route.ts
// Uses OpenAI to auto-generate description, tags, highlights for a location

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import {
  getElevation,
  inferCategory,
  inferProvince,
} from "@/lib/mapbox/geocoding";
import {
  LOCATION_ENRICHMENT_SYSTEM,
  buildEnrichmentPrompt,
} from "@/lib/ai/prompts/location";

export const runtime = "nodejs";
export const maxDuration = 30;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const InputSchema = z.object({
  name: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  placeTypes: z.array(z.string()).default([]),
  province: z.string().optional(),
  elevation: z.number().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = InputSchema.parse(body);

    // Infer province and category if not provided
    const province = input.province ?? inferProvince(input.lat, input.lng);
    const category = inferCategory(input.placeTypes, input.name);

    // Get elevation if not provided
    let elevation = input.elevation ?? null;
    if (!elevation) {
      elevation = await getElevation(input.lat, input.lng);
    }

    // Generate enriched data with OpenAI
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 800,
      temperature: 0.7,
      system: LOCATION_ENRICHMENT_SYSTEM,
      messages: [{ role: "user",
          content: buildEnrichmentPrompt(
            input.name,
            input.lat,
            input.lng,
            elevation,
            province,
            category
          ),
        },
      ],
    });

    const raw = (response.content[0] as any)?.text ?? "{}";

    let enriched: Record<string, unknown>;
    try {
      enriched = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      enriched: {
        ...enriched,
        province,
        category: enriched.category ?? category,
        elevationM: enriched.elevationM ?? elevation,
        coordinates: { lat: input.lat, lng: input.lng },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[enrich]", error);
    return NextResponse.json(
      { error: "Enrichment failed" },
      { status: 500 }
    );
  }
}
