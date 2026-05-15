// app/api/ai/recommendations/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

export const runtime = "edge";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const Schema = z.object({
  currentDestination: z.string(),
  interests: z.array(z.string()).optional(),
  travelStyle: z.string().optional(),
  limit: z.number().min(1).max(6).default(4),
});

export async function POST(req: NextRequest) {
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 600,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content ?? "[]";
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
