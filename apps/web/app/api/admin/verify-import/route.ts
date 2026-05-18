import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyLocation } from "@/lib/content/verifyLocation";
import { getWikipediaFullText, getWikivoyageArticle, getWikimediaImages } from "@/lib/content/wikipedia";
import { slugify } from "@/lib/utils/formatters";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { action, query, verifiedData, publish, category } = body;

  if (action === "verify") {
    if (!query) return Response.json({ error: "Missing query" }, { status: 400 });
    const result = await verifyLocation(query);
    if (!result) return Response.json({ error: "No results found across any source" }, { status: 404 });
    return Response.json({ success: true, location: result });
  }

  if (action === "import") {
    if (!verifiedData) return Response.json({ error: "Missing verifiedData" }, { status: 400 });

    const supabase = createAdminClient();
    const slug = slugify(verifiedData.name);

    // Check duplicate
    const { data: existing } = await supabase.from("destinations").select("id").eq("slug", slug).maybeSingle();
    if (existing) return Response.json({ error: "Already imported (slug exists)" }, { status: 409 });

    // Fetch richer context for AI
    const wikiTitle = verifiedData.sources?.wikipedia?.title ?? verifiedData.name;
    const [wikiFull, wikivoyage, gallery] = await Promise.all([
      getWikipediaFullText(wikiTitle).catch(() => ""),
      getWikivoyageArticle(verifiedData.name).catch(() => ""),
      getWikimediaImages(verifiedData.name, 6).catch(() => []),
    ]);

    // AI enrich
    const prompt = `You are writing for Hidden Nepal — editorial, knowledgeable, specific. Return ONLY valid JSON:

{
  "tagline": "10-15 word evocative line",
  "description": "300-450 words. Concrete opening detail. Cover history, what travelers see, practical context.",
  "highlights": ["5-7 specific things to do/see"],
  "bestSeason": ["Spring", "Autumn"],
  "tags": ["6-10 lowercase tags"],
  "warnings": ["practical warnings if any"],
  "seoTitle": "60-char title",
  "seoDescription": "150-char meta",
  "isHiddenGem": false,
  "category": "lake|temple|village|city|viewpoint|peak|waterfall|heritage|nationalpark"
}

AVOID: "hidden gem", "must-visit", "breathtaking", "nestled". Be specific.

Location: ${verifiedData.name}${verifiedData.nameNepali ? ` (${verifiedData.nameNepali})` : ""}
Province: ${verifiedData.province}
${verifiedData.elevation ? `Elevation: ${verifiedData.elevation}m` : ""}
Verified across: ${Object.keys(verifiedData.sources ?? {}).join(", ")}
${wikiFull ? `\n\nWikipedia article:\n${wikiFull}` : ""}
${wikivoyage ? `\n\nWikivoyage:\n${wikivoyage}` : ""}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      temperature: 0.6,
      messages: [{ role: "user", content: prompt }],
    });

    let raw = (response.content[0] as any)?.text ?? "{}";
    raw = raw.trim().replace(/^```json\s*/gm, "").replace(/```\s*$/gm, "");
    const fb = raw.indexOf("{");
    const lb = raw.lastIndexOf("}");
    if (fb !== -1) raw = raw.slice(fb, lb + 1);
    const ai = JSON.parse(raw);

    const coverImage = verifiedData.sources?.wikipedia?.thumbnail ?? gallery[0] ?? null;
    const galleryUrls = gallery.filter((u: string) => u !== coverImage).slice(0, 5);

    const { error } = await supabase.from("destinations").insert({
      name: verifiedData.name,
      name_nepali: verifiedData.nameNepali ?? null,
      slug,
      tagline: ai.tagline,
      description: ai.description,
      province: verifiedData.province,
      category: category ?? ai.category ?? "viewpoint",
      is_hidden_gem: ai.isHiddenGem ?? false,
      is_published: publish ?? false,
      coordinates: `SRID=4326;POINT(${verifiedData.coordinates.lng} ${verifiedData.coordinates.lat})`,
      elevation_m: verifiedData.elevation ?? null,
      best_season: ai.bestSeason ?? [],
      highlights: ai.highlights ?? [],
      warnings: ai.warnings ?? [],
      tags: ai.tags ?? [],
      cover_image_url: coverImage,
      gallery_urls: galleryUrls,
      seo_title: ai.seoTitle,
      seo_description: ai.seoDescription,
      source: "verified_import",
    });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true, slug, trustScore: verifiedData.trustScore });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
