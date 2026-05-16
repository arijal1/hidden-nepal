// app/api/ai/recommendations/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const Schema = z.object({
  currentDestination: z.string(),
  interests: z.array(z.string()).optional(),
  travelStyle: z.string().optional(),
  limit: z.number().min(1).max(6).default(4),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Sign in required" }), { status: 401 });
  }

  try {
    const body = await req.json();
    const { currentDestination, interests, travelStyle, limit } = Schema.parse(body);

    const prompt = `You are a Nepal travel expert. Given that a traveler is viewing "${currentDestination}", 
suggest ${limit} other Nepal destinations they'd love.
${interests?.length ? `Their interests: ${interests.join(", ")}` : ""}
${travelStyle ? `Travel style: ${travelStyle}` : ""}

Respond ONLY as a JSON array:
[
  {
    "slug": "destination-slug",
    "name": "Destination Name",
    "reason": "1 sentence why this pairs well with the current destination",
    "similarity": "similar | complementary | nearby"
  }
]

Use only real Nepal destinations from: Rara Lake, Phoksundo Lake, Tilicho Lake, Upper Mustang, 
Langtang Valley, Annapurna Base Camp, EBC, Manaslu, Khopra Ridge, Panch Pokhari, Pokhara, Kathmandu, 
Nagarkot, Bandipur, Chitwan, Bardia, Ilam, Kanchenjunga, Gosaikunda, Helambu.`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (response.content[0] as any)?.text ?? "[]";
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
      // Handle both {recommendations: [...]} and [...] formats
      if (Array.isArray(parsed)) {
        return NextResponse.json({ recommendations: parsed });
      }
      if (typeof parsed === "object" && parsed !== null) {
        const arr = Object.values(parsed)[0];
        return NextResponse.json({ recommendations: Array.isArray(arr) ? arr : [] });
      }
    } catch {
      return NextResponse.json({ recommendations: [] });
    }

    return NextResponse.json({ recommendations: parsed });
  } catch (error) {
    return NextResponse.json({ recommendations: [] }, { status: 500 });
  }
}
