import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/server";
import { getWikipediaArticle, getWikipediaFullText, getWikivoyageArticle } from "@/lib/content/wikipedia";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: dest, error } = await supabase.from("destinations").select("*").eq("id", id).single();
  if (error || !dest) return Response.json({ error: "Not found" }, { status: 404 });

  // Determine missing fields
  const needs = {
    description: !dest.description || dest.description.length < 50,
    highlights: !dest.highlights || dest.highlights.length === 0,
    warnings: !dest.warnings || dest.warnings.length === 0,
    bestSeason: !dest.best_season || dest.best_season.length === 0,
    tagline: !dest.tagline || dest.tagline.length < 10,
  };

  const missingList = Object.entries(needs).filter(([, v]) => v).map(([k]) => k);
  if (missingList.length === 0) {
    return Response.json({ success: true, message: "Nothing missing", filled: [] });
  }

  // Pull Wikipedia context
  const wikiTitle = dest.name;
  const [wikiFull, wikivoyage, wikiArticle] = await Promise.all([
    getWikipediaFullText(wikiTitle).catch(() => ""),
    getWikivoyageArticle(wikiTitle).catch(() => ""),
    getWikipediaArticle(wikiTitle).catch(() => null),
  ]);

  const prompt = `You are writing for Hidden Nepal — editorial, knowledgeable, specific (not brochure language).

Fill these MISSING fields for this destination. Return ONLY valid JSON with EXACTLY these keys: ${missingList.join(", ")}.

JSON shape:
{
  ${missingList.includes("tagline") ? '"tagline": "10-15 word evocative line, no clichés",' : ''}
  ${missingList.includes("description") ? '"description": "300-450 words, specific details, not generic. Open with a concrete detail, not \\"X is a beautiful place\\".",' : ''}
  ${missingList.includes("highlights") ? '"highlights": ["5-7 specific things to see/do — concrete, not generic"],' : ''}
  ${missingList.includes("warnings") ? '"warnings": ["practical warnings: altitude, monsoon access, permits"],' : ''}
  ${missingList.includes("bestSeason") ? '"bestSeason": ["months/seasons when best to visit"]' : ''}
}

AVOID: "hidden gem", "must-visit", "breathtaking", "nestled in", "tucked away", sentences starting with "X is a beautiful/famous place".

Destination: ${dest.name}${dest.name_nepali ? ` (${dest.name_nepali})` : ""}
Province: ${dest.province}
Category: ${dest.category}
${dest.elevation_m ? `Elevation: ${dest.elevation_m}m` : ""}
${dest.tagline ? `Existing tagline: ${dest.tagline}` : ""}
${dest.description ? `Existing description excerpt: ${dest.description.slice(0, 500)}` : ""}
${wikiArticle?.extract ? `\nWikipedia intro: ${wikiArticle.extract}` : ""}
${wikiFull ? `\nFULL Wikipedia article:\n${wikiFull}` : ""}
${wikivoyage ? `\nWikivoyage guide:\n${wikivoyage}` : ""}

Be accurate. If specific information isn't available, write generally about the region/category. Never fabricate names, dates, or events.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      temperature: 0.6,
      messages: [{ role: "user", content: prompt }],
    });

    let raw = (response.content[0] as any)?.text ?? "{}";
    raw = raw.trim().replace(/^```json\s*/gm, "").replace(/```\s*$/gm, "");
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace !== -1) raw = raw.slice(firstBrace, lastBrace + 1);
    const ai = JSON.parse(raw);

    // Build update
    const updates: any = {};
    if (needs.description && ai.description) updates.description = ai.description;
    if (needs.tagline && ai.tagline) updates.tagline = ai.tagline;
    if (needs.highlights && Array.isArray(ai.highlights)) updates.highlights = ai.highlights;
    if (needs.warnings && Array.isArray(ai.warnings)) updates.warnings = ai.warnings;
    if (needs.bestSeason && Array.isArray(ai.bestSeason)) updates.best_season = ai.bestSeason;

    if (Object.keys(updates).length === 0) {
      return Response.json({ success: false, error: "AI returned no usable data" }, { status: 422 });
    }

    const { error: upErr } = await supabase.from("destinations").update(updates).eq("id", id);
    if (upErr) return Response.json({ error: upErr.message }, { status: 500 });

    return Response.json({ success: true, filled: Object.keys(updates) });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "AI error" }, { status: 500 });
  }
}
