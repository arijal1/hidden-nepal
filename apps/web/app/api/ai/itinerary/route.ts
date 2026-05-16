// app/api/ai/itinerary/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { ItineraryInput } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Input validation ─────────────────────────────────

const InputSchema = z.object({
  days: z.number().min(1).max(30),
  budgetUsd: z.number().min(100).max(20000),
  travelStyle: z.enum(["budget", "mid_range", "luxury", "backpacker", "adventure"]),
  interests: z.array(z.string()).max(10),
  trekkingLevel: z.enum(["easy", "moderate", "strenuous", "extreme"]),
  startDate: z.string().optional(),
  startCity: z.string().default("Kathmandu"),
  endCity: z.string().optional(),
});

// ─── System Prompt ────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert Nepal travel planner with deep knowledge of:
- All 7 provinces, 77 districts, and hundreds of destinations
- Hidden gems, off-the-beaten-path places most tourists never find
- Trekking routes, permits, seasonal conditions, and safety
- Local culture, festivals, food, and authentic experiences
- Transport options (flights, buses, jeeps, shared vehicles)
- Budget realities at each price point
- Current road conditions and seasonal closures

Your itineraries are:
1. DETAILED — specific places, times, costs, accommodation names
2. AUTHENTIC — include local food, morning routines, cultural moments
3. PRACTICAL — real transport logistics, permits needed, altitude warnings
4. PERSONAL — tailored to the traveler's style and budget
5. HONEST — realistic timing, don't over-pack days

Respond ONLY in valid JSON matching this exact structure:
{
  "title": "string — evocative trip title",
  "summary": "string — 2-3 sentence trip overview",
  "totalBudgetBreakdown": {
    "accommodation": number,
    "food": number,
    "transport": number,
    "activities": number
  },
  "days": [
    {
      "day": number,
      "location": "string",
      "theme": "string — poetic 4-6 word theme",
      "accommodation": {
        "name": "string",
        "type": "string (teahouse/guesthouse/hotel/etc)",
        "estimatedCostUsd": number
      },
      "activities": [
        {
          "time": "string (e.g. 06:00)",
          "title": "string",
          "description": "string — 1-2 sentences with local context",
          "hiddenGem": boolean,
          "coordinates": {"lat": number, "lng": number} or null
        }
      ],
      "meals": [
        {
          "meal": "breakfast" | "lunch" | "dinner",
          "suggestion": "string — specific place or type",
          "localDish": "string — specific Nepali dish to try"
        }
      ],
      "transport": {
        "from": "string",
        "to": "string",
        "method": "string",
        "estimatedCostUsd": number,
        "duration": "string"
      },
      "tips": ["string"],
      "emergencyInfo": {
        "nearestHospital": "string",
        "emergencyContact": "string"
      }
    }
  ],
  "packingList": ["string"],
  "permits": [
    {
      "name": "string",
      "cost": "string",
      "whereToGet": "string"
    }
  ],
  "hiddenGems": [
    {
      "name": "string",
      "why": "string",
      "coordinates": [number, number]
    }
  ]
}`;

// ─── User Prompt Builder ──────────────────────────────

function buildUserPrompt(input: ItineraryInput): string {
  const budget = input.budgetUsd;
  const styleMap = {
    budget: "budget traveler (hostels, dal bhat, local buses)",
    backpacker: "backpacker (mix of budget + comfort, adventure-focused)",
    mid_range: "mid-range traveler (3-star hotels, some splurges, mix of transport)",
    adventure: "adventure traveler (trekking, camping, off-beat places, high altitude)",
    luxury: "luxury traveler (boutique hotels, private transport, premium experiences)",
  };

  const style = styleMap[input.travelStyle] ?? input.travelStyle;
  const interests = input.interests.length > 0
    ? `Key interests: ${input.interests.join(", ")}`
    : "Open to all experiences";

  const trekNote = input.travelStyle === "adventure" || input.trekkingLevel !== "easy"
    ? `\nTrekking fitness: ${input.trekkingLevel} (can handle ${input.trekkingLevel === "extreme" ? "technical high-altitude terrain" : input.trekkingLevel === "strenuous" ? "long mountain days up to 8h" : input.trekkingLevel === "moderate" ? "full trekking days up to 6h" : "easy trails up to 4h"})`
    : "";

  return `Create a ${input.days}-day Nepal itinerary for a ${style}.

Budget: $${budget} USD total (excluding international flights)
Starting city: ${input.startCity ?? "Kathmandu"}
${input.endCity ? `Ending city: ${input.endCity}` : "Return to start city"}
${input.startDate ? `Travel dates: Starting ${input.startDate}` : ""}
${interests}${trekNote}

IMPORTANT INSTRUCTIONS:
- Include at least 2-3 genuine hidden gems most travelers never find
- Be specific about accommodation names where possible
- Include at least one sunrise or sunset moment per region
- Factor in realistic travel time between locations
- Add cultural context for every major activity
- If trekking is included, mention AMS (altitude sickness) prevention
- Total budget breakdown should realistically fit $${budget} USD
- Make this itinerary feel personally crafted, not generic
- Include specific Nepali dishes at each meal stop`;
}

// ─── Route Handler ────────────────────────────────────

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Sign in required" }), { status: 401 });
  }

  try {
    const body = await req.json();
    const input = InputSchema.parse(body);

    // Rate limit check (basic — use Redis/Upstash in production)
    const userId = req.headers.get("x-user-id") ?? "anon";

    const stream = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      temperature: 0.85,
      stream: true,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(input) },
      ],
    });

    // Return streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream as any) {
            if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
              const text = event.delta.text ?? "";
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[AI itinerary]", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary" },
      { status: 500 }
    );
  }
}
