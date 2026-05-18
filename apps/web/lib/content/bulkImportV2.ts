// lib/content/bulkImportV2.ts
// 2-step curated import: discover + score (cheap) → user selects → import (AI per item)

import { fetchOSMByCategory, type OSMLocation } from "./openstreetmap";
import { getWikipediaArticle, getWikimediaImages, getNepalCategoryMembers, nepalWikiCategoriesFor, getWikipediaFullText, getWikivoyageArticle } from "./wikipedia";
import { searchFlickrPhotos } from "./flickr";
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
  province?: string;
  hideDuplicates?: boolean;
  requireWikipedia?: boolean;
  requirePhoto?: boolean;
}): AsyncGenerator<{ type: string; current?: number; total?: number; message?: string; candidate?: Candidate; error?: string }> {
  const { category, minScore = 30, maxResults = 25, province, hideDuplicates = true, requireWikipedia = false, requirePhoto = false } = options;
  const supabase = createAdminClient();

  yield { type: "start", message: `Searching OpenStreetMap for ${category}…` };

  let osmResults: OSMLocation[];
  try {
    osmResults = await fetchOSMByCategory(category);
  } catch (err: any) {
    yield { type: "fatal", error: `OSM error: ${err.message}` };
    return;
  }

  // ALSO seed from Wikipedia categories (curated, notable)
  const wikiCats = nepalWikiCategoriesFor(category);
  const wikiSeeds: Array<{ name: string; lat?: number; lng?: number; thumbnail?: string; extract?: string }> = [];
  for (const cat of wikiCats) {
    try {
      const members = await getNepalCategoryMembers(cat, 50);
      for (const m of members) wikiSeeds.push({ name: m.title, lat: m.lat, lng: m.lng, thumbnail: m.thumbnail, extract: m.extract });
    } catch {}
  }

  // Merge Wikipedia seeds that aren't already in OSM results (match by name)
  const osmNamesLower = new Set(osmResults.map((o) => o.name.toLowerCase()));
  let wikiAdded = 0;
  for (const w of wikiSeeds) {
    if (osmNamesLower.has(w.name.toLowerCase())) continue;
    if (!w.lat || !w.lng) continue;
    // Skip if outside rough Nepal bbox
    if (w.lat < 26.3 || w.lat > 30.5 || w.lng < 80.0 || w.lng > 88.2) continue;
    osmResults.push({
      id: 900000000 + wikiAdded,
      name: w.name,
      lat: w.lat,
      lng: w.lng,
      tags: { source: "wikipedia_category", wikipedia: `en:${w.name}` },
      category,
      osmType: "node",
    } as any);
    wikiAdded++;
  }
  yield { type: "progress", message: `Found ${osmResults.length} candidates (${wikiAdded} from Wikipedia categories). Scoring…`, total: osmResults.length };

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

      // Multi-source image fetching: Wikipedia → Wikimedia Commons → Flickr
      const wikiTitle = osm.wikipedia ? osm.wikipedia.replace("en:", "") : osm.name;
      let article = null;
      let imageUrl: string | undefined;
      let galleryUrls: string[] = [];

      // 1. Wikipedia article thumbnail
      try {
        article = await getWikipediaArticle(wikiTitle);
        if (article?.thumbnail?.source) imageUrl = article.thumbnail.source;
      } catch {}

      // 2. Wikimedia Commons gallery (high res)
      try {
        const wiki = await getWikimediaImages(osm.name, 6);
        if (!imageUrl && wiki[0]) imageUrl = wiki[0];
        galleryUrls = wiki.filter(u => u !== imageUrl).slice(0, 5);
      } catch {}

      // 3. Flickr fallback if still no images (CC-licensed)
      if (!imageUrl || galleryUrls.length < 2) {
        try {
          const flickr = await searchFlickrPhotos(`${osm.name} Nepal`, 4);
          const flickrUrls = flickr.map((p) => p.url);
          if (!imageUrl && flickrUrls[0]) imageUrl = flickrUrls[0];
          for (const u of flickrUrls) {
            if (u === imageUrl) continue;
            if (galleryUrls.includes(u)) continue;
            if (galleryUrls.length < 5) galleryUrls.push(u);
          }
        } catch {}
      }

      const totalImages = (imageUrl ? 1 : 0) + galleryUrls.length;
      const { score, reasons } = scoreCandidate(osm, !!article, totalImages);

      if (score < minScore) continue;
      if (hideDuplicates && alreadyExists) continue;
      if (requireWikipedia && !article) continue;
      if (requirePhoto && !imageUrl) continue;

      const candidateProvince = inferProvince(osm.lat, osm.lng);
      if (province && province !== "all" && candidateProvince !== province) continue;

      const candidate: Candidate = {
        osmId: osm.id,
        name: osm.name,
        nameNepali: osm.nameNepali,
        lat: osm.lat,
        lng: osm.lng,
        category,
        province: candidateProvince,
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

      // Fetch FULL Wikipedia article + Wikivoyage for richer AI context
      const wikiTitle = c.wikipediaTitle ?? c.name;
      const [wikiFullText, wikivoyageText] = await Promise.all([
        getWikipediaFullText(wikiTitle).catch(() => ""),
        getWikivoyageArticle(c.name).catch(() => ""),
      ]);

      // AI enrich — Sonnet + rich context
      const relevantTags = Object.entries(c.tags)
        .filter(([k]) => !["source", "created_by", "name", "name:en", "name:ne", "wikipedia", "wikidata"].includes(k))
        .map(([k, v]) => `${k}=${v}`)
        .join(", ");

      const prompt = `You are writing for Hidden Nepal — a curated travel platform. Think of the New York Times Travel section or Pico Iyer, not TripAdvisor.

VOICE: Editorial. Knowledgeable. Specific. Restrained.

WORDS/PHRASES TO AVOID (these are AI-tells):
- "Hidden gem", "must-visit", "breathtaking", "stunning", "spectacular"
- "Nestled in", "tucked away", "off the beaten path"
- "Embark on a journey", "immerse yourself", "discover the magic"
- "A unique experience", "unlike anywhere else"
- Sentences that start with "X is a beautiful/famous/popular..."

OPENING LINE EXAMPLES:
✓ "The walk in takes three days through pine forests inhabited by red pandas, which is part of the point."
✓ "Cars are banned in Bandipur, which is what saved it."
✓ "Pashupatinath functions less as a temple than as a city of the dead — the cremation ghats run continuously."
✗ "Rara Lake is a beautiful lake in Karnali Province."

TAGLINE EXAMPLES:
✓ "Nepal's largest lake, at 3,000m in the country's least-visited province"
✓ "A 17th-century Newari town frozen in stone — and entirely car-free"
✗ "Discover the natural beauty of [place]"

HIGHLIGHT EXAMPLES:
✓ "Sunrise from Tundikhel ridge — 15-min walk from the square, Annapurna panorama"
✓ "Khadga Devi Temple — sword sanctuary opened ceremonially every 12 years"
✗ "Enjoy breathtaking views"
✗ "Experience the local culture"

Write rich, accurate content for this destination. Return ONLY valid JSON (no markdown, no preamble):

{
  "tagline": "ONE specific, evocative line (10-15 words). Avoid clichés like 'hidden gem', 'breathtaking', 'must-visit'",
  "description": "350-500 words. Open with a specific detail or scene — not 'X is a beautiful place'. Cover: what makes it culturally/geographically distinctive, what travelers actually experience, practical context (best access, when to go), and any cultural significance. Write like a knowledgeable friend, not a brochure.",
  "highlights": ["5-7 specific things to see/do — concrete, not generic. e.g. 'Sunset viewing platform at 4,200m' not 'enjoy the views'"],
  "bestSeason": ["Spring", "Autumn"],
  "tags": ["6-10 lowercase descriptive tags — e.g. 'sacred lake', 'newari heritage', 'high-altitude trek'"],
  "warnings": ["practical warnings if any — altitude, monsoon access, permits needed"],
  "seoTitle": "60-char SEO title — specific, not 'X - Hidden Nepal'",
  "seoDescription": "150-char SEO description — punchy, distinctive",
  "isHiddenGem": "true if NOT in mainstream travel guides (Lonely Planet, etc.), else false"
}

Destination: ${c.name}${c.nameNepali ? ` (${c.nameNepali})` : ""}
Province: ${c.province} (${c.lat.toFixed(3)}, ${c.lng.toFixed(3)})
Category: ${c.category}
${c.elevation ? `Elevation: ${c.elevation}m` : ""}
${relevantTags ? `OSM tags: ${relevantTags}` : ""}
${c.wikipediaTitle ? `Wikipedia: ${c.wikipediaTitle}` : ""}
${c.wikiSummary ? `Wikipedia summary: ${c.wikiSummary}` : ""}
${wikiFullText ? `\nFULL Wikipedia article:\n${wikiFullText}` : ""}
${wikivoyageText ? `\nWikivoyage travel guide:\n${wikivoyageText}` : ""}

Be accurate. If you don't have enough information about specifics, write generally about the region/category rather than inventing details. Never fabricate names, dates, or events.`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2500,
        temperature: 0.7,
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
