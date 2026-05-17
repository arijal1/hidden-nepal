// lib/content/bulkImportV2.ts
// 2-step curated import: discover + score (cheap) → user selects → import (AI per item)

import { fetchOSMByCategory, type OSMLocation } from "./openstreetmap";
import { getWikipediaArticle, getWikimediaImages } from "./wikipedia";
import { createAdminClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/formatters";
import { inferProvince } from "@/lib/mapbox/geocoding";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Candidate type ──────────────────────────────────
export interface Candidate {
  osmId: number;
  name: string;
  nameNepali?: string;
  lat: number;
  lng: number;
  category: string;
  province: string;
  elevation?: number;
  tags: Record<string, string>;
  wikipediaTitle?: string;
  wikiSummary?: string;
  imageUrl?: string;
  galleryUrls: string[];
  score: number;
  reasons: string[];
  alreadyExists: boolean;
}

// ─── Scoring algorithm ───────────────────────────────
function scoreCandidate(
  osm: OSMLocation,
  hasWikipedia: boolean,
  imageCount: number
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Notability signals
  if (hasWikipedia) { score += 30; reasons.push("Has Wikipedia article"); }
  if (osm.wikidata) { score += 15; reasons.push("Has Wikidata entity"); }

  // OSM quality tags
  if (osm.tags["tourism"]) { score += 20; reasons.push(`Tourism: ${osm.tags["tourism"]}`); }
  if (osm.tags["historic"]) { score += 20; reasons.push(`Historic: ${osm.tags["historic"]}`); }
  if (osm.tags["heritage"]) { score += 15; reasons.push("Heritage site"); }
  if (osm.tags["religion"]) { score += 10; reasons.push(`Religious: ${osm.tags["religion"]}`); }
  if (osm.tags["natural"] === "peak") { score += 10; reasons.push("Named peak"); }

  // Multilingual names (notability indicator)
  if (osm.nameNepali) { score += 10; reasons.push("Bilingual name (Nepali)"); }
  if (osm.tags["name:en"] && osm.tags["name:ne"]) { score += 5; reasons.push("English + Nepali"); }

  // Photos
  if (imageCount > 0) { score += 10; reasons.push(`${imageCount} photos available`); }
  if (imageCount >= 3) { score += 5; reasons.push("Rich photo gallery"); }

  // Elevation data (especially valuable for mountain destinations)
  if (osm.elevation) { score += 5; reasons.push(`Elevation: ${osm.elevation}m`); }

  // Metadata richness
  const tagCount = Object.keys(osm.tags).length;
  if (tagCount >= 8) { score += 5; reasons.push(`Rich metadata (${tagCount} tags)`); }

  // Has website (official presence)
  if (osm.website) { score += 5; reasons.push("Has official website"); }

  return { score: Math.min(score, 100), reasons };
}

// ─── DISCOVER: fetch + score, no AI, no save ─────────
export async function* discoverCandidates(options: {
  category: string;
  minScore?: number;
  maxResults?: number;
}): AsyncGenerator<{ type: string; current?: number; total?: number; message?: string; candidate?: Candidate; error?: string }> {
  const { category, minScore = 30, maxResults = 25 } = options;
  const supabase = createAdminClient();

  yield { type: "start", message: `Searching OpenStreetMap for ${category}…` };

  let osmResults: OSMLocation[];
  try {
    osmResults = await fetchOSMByCategory(category);
  } catch (err: any) {
    yield { type: "fatal", error: `OSM error: ${err.message}` };
    return;
  }

  yield { type: "progress", message: `Found ${osmResults.length} candidates. Scoring…`, total: osmResults.length };

  // Get existing slugs to skip duplicates
  const { data: existing } = await supabase
    .from("destinations")
    .select("slug, name");
  const existingSlugs = new Set((existing ?? []).map((d: any) => d.slug));
  const existingNames = new Set((existing ?? []).map((d: any) => d.name.toLowerCase()));

  const candidates: Candidate[] = [];

  for (let i = 0; i < osmResults.length; i++) {
    const osm = osmResults[i];
    if (i % 5 === 0) {
      yield { type: "progress", current: i, total: osmResults.length, message: `Scoring ${i}/${osmResults.length}…` };
    }

    try {
      const slug = slugify(osm.name);
      const alreadyExists = existingSlugs.has(slug) || existingNames.has(osm.name.toLowerCase());

      // Check Wikipedia (cheap)
      const wikiTitle = osm.wikipedia ? osm.wikipedia.replace("en:", "") : osm.name;
      let article = null;
      let imageUrl: string | undefined;
      let galleryUrls: string[] = [];
      try {
        article = await getWikipediaArticle(wikiTitle);
        if (article?.thumbnail?.source) imageUrl = article.thumbnail.source;
      } catch {}

      // Try Wikimedia images
      try {
        const wiki = await getWikimediaImages(osm.name, 4);
        if (!imageUrl && wiki[0]) imageUrl = wiki[0];
        galleryUrls = wiki.filter(u => u !== imageUrl).slice(0, 4);
      } catch {}

      const totalImages = (imageUrl ? 1 : 0) + galleryUrls.length;
      const { score, reasons } = scoreCandidate(osm, !!article, totalImages);

      if (score < minScore && !alreadyExists) continue;

      const province = inferProvince(osm.lat, osm.lng);

      const candidate: Candidate = {
        osmId: osm.id,
        name: osm.name,
        nameNepali: osm.nameNepali,
        lat: osm.lat,
        lng: osm.lng,
        category,
        province,
        elevation: osm.elevation,
        tags: osm.tags,
        wikipediaTitle: article?.title,
        wikiSummary: article?.extract?.slice(0, 300),
        imageUrl,
        galleryUrls,
        score,
        reasons,
        alreadyExists,
      };

      candidates.push(candidate);
    } catch (err: any) {
      // Skip failures silently
    }
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);
  const top = candidates.slice(0, maxResults);

  for (const c of top) {
    yield { type: "candidate", candidate: c };
  }

  yield {
    type: "done",
    message: `Found ${top.length} quality candidates (${candidates.length - top.length} more filtered).`,
  };
}

// ─── IMPORT: AI enrich + save selected candidates ────
export async function* importSelected(options: {
  candidates: Candidate[];
  publish: boolean;
}): AsyncGenerator<{ type: string; current?: number; total?: number; message?: string; name?: string; slug?: string; error?: string }> {
  const { candidates, publish } = options;
  const supabase = createAdminClient();

  yield { type: "start", total: candidates.length, message: `Importing ${candidates.length} destinations…` };

  let added = 0;
  let failed = 0;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    yield { type: "progress", current: i, total: candidates.length, name: c.name, message: `(${i + 1}/${candidates.length}) ${c.name}` };

    try {
      const slug = slugify(c.name);

      // AI enrich
      const prompt = `Write rich content for this Nepal destination. Return ONLY valid JSON, no markdown:

{
  "tagline": "compelling 1-line hook",
  "description": "200-400 word description covering what makes it special, cultural context, what to see/do",
  "highlights": ["5-7 specific highlights"],
  "bestSeason": ["Spring", "Autumn"],
  "tags": ["6-10 lowercase tags"],
  "warnings": ["practical warnings if any"],
  "seoTitle": "60-char SEO title",
  "seoDescription": "150-char SEO description",
  "isHiddenGem": false
}

Location: ${c.name}${c.nameNepali ? ` (${c.nameNepali})` : ""}
Province: ${c.province}
Category: ${c.category}
${c.elevation ? `Elevation: ${c.elevation}m` : ""}
${c.wikiSummary ? `Wikipedia: ${c.wikiSummary}` : ""}`;

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1500,
        temperature: 0.5,
        messages: [{ role: "user", content: prompt }],
      });

      const raw = (response.content[0] as any)?.text ?? "{}";
      let jsonText = raw.trim().replace(/^```json\s*/gm, "").replace(/```\s*$/gm, "");
      const firstBrace = jsonText.indexOf("{");
      const lastBrace = jsonText.lastIndexOf("}");
      if (firstBrace !== -1) jsonText = jsonText.slice(firstBrace, lastBrace + 1);
      const aiData = JSON.parse(jsonText);

      // Save to DB
      const { error } = await supabase.from("destinations").insert({
        name: c.name,
        name_nepali: c.nameNepali ?? null,
        slug,
        tagline: aiData.tagline,
        description: aiData.description,
        province: c.province,
        category: c.category,
        is_hidden_gem: aiData.isHiddenGem ?? false,
        is_published: publish,
        coordinates: `SRID=4326;POINT(${c.lng} ${c.lat})`,
        elevation_m: c.elevation ?? null,
        best_season: aiData.bestSeason ?? [],
        highlights: aiData.highlights ?? [],
        warnings: aiData.warnings ?? [],
        tags: aiData.tags ?? [],
        cover_image_url: c.imageUrl ?? null,
        gallery_urls: c.galleryUrls,
        seo_title: aiData.seoTitle,
        seo_description: aiData.seoDescription,
        osm_id: c.osmId,
        source: "bulk_import_v2",
      });

      if (error) {
        failed++;
        yield { type: "fail", name: c.name, error: error.message };
        continue;
      }

      added++;
      yield { type: "success", name: c.name, slug };
    } catch (err: any) {
      failed++;
      yield { type: "fail", name: c.name, error: err.message ?? String(err) };
    }
  }

  yield { type: "done", message: `${added} imported, ${failed} failed.` };
}
