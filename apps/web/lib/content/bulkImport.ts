// lib/content/bulkImport.ts
// Orchestrates: OSM → Wikipedia → Wikidata → Weather → AI → Supabase

import { fetchOSMByCategory } from "./openstreetmap";
import { searchWikipedia, getWikipediaArticle, getWikimediaImages } from "./wikipedia";
import { getClimateData, calculateBestSeasons } from "./weather";
import { searchFlickrPhotos } from "./flickr";
import { inferProvince } from "@/lib/mapbox/geocoding";
import { slugify } from "@/lib/utils/formatters";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface BulkImportItem {
  name: string;
  nameNepali?: string;
  slug: string;
  lat: number;
  lng: number;
  category: string;
  province: string;
  elevationM?: number;
  tagline?: string;
  description?: string;
  highlights: string[];
  bestSeason: string[];
  tags: string[];
  warnings: string[];
  isHiddenGem: boolean;
  coverImageUrl?: string;
  galleryUrls: string[];
  seoTitle?: string;
  seoDescription?: string;
  wikiUrl?: string;
  osmId?: number;
  source: string;
}

export interface BulkImportProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  currentItem: string;
  errors: string[];
}

export type ProgressCallback = (progress: BulkImportProgress) => void;

// ─── Main bulk import function ────────────────────────

export async function runBulkImport(
  category: string,
  limit: number,
  onProgress: ProgressCallback,
  options: {
    enrichWithAI?: boolean;
    fetchWikipedia?: boolean;
    fetchPhotos?: boolean;
    publishAll?: boolean;
  } = {}
): Promise<BulkImportItem[]> {
  const {
    enrichWithAI = true,
    fetchWikipedia = true,
    fetchPhotos = true,
    publishAll = false,
  } = options;

  const progress: BulkImportProgress = {
    total: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    currentItem: "Fetching from OpenStreetMap…",
    errors: [],
  };

  onProgress(progress);

  // Step 1: Fetch raw locations from OSM
  let osmLocations;
  try {
    osmLocations = await fetchOSMByCategory(category as any, limit);
  } catch (err: any) {
    progress.errors.push(`OSM fetch failed: ${err.message}`);
    onProgress(progress);
    return [];
  }

  progress.total = osmLocations.length;
  progress.currentItem = `Found ${osmLocations.length} locations. Enriching…`;
  onProgress(progress);

  const results: BulkImportItem[] = [];

  // Step 2: Enrich each location
  for (const osm of osmLocations) {
    progress.currentItem = osm.name;
    onProgress(progress);

    try {
      const item = await enrichLocation(osm, {
        enrichWithAI,
        fetchWikipedia,
        fetchPhotos,
      });

      if (item) {
        results.push(item);
        progress.succeeded++;
      } else {
        progress.skipped++;
      }
    } catch (err: any) {
      progress.failed++;
      progress.errors.push(`${osm.name}: ${err.message}`);
    }

    progress.processed++;
    onProgress(progress);

    // Rate limit: 200ms between requests
    await sleep(200);
  }

  return results;
}

// ─── Enrich a single OSM location ─────────────────────

async function enrichLocation(
  osm: any,
  options: {
    enrichWithAI: boolean;
    fetchWikipedia: boolean;
    fetchPhotos: boolean;
  }
): Promise<BulkImportItem | null> {
  // Skip if no valid name or coordinates
  if (!osm.name || !osm.lat || !osm.lng) return null;

  const province = inferProvince(osm.lat, osm.lng);
  let description = "";
  let wikiUrl = "";
  let images: string[] = [];
  let highlights: string[] = [];
  let bestSeason: string[] = [];
  let tags: string[] = extractOSMTags(osm.tags);

  // Step A: Wikipedia enrichment
  if (options.fetchWikipedia) {
    try {
      // Use Wikipedia article linked in OSM if available
      const wikiTitle = osm.wikipedia
        ? osm.wikipedia.replace("en:", "")
        : osm.name;

      const article = await getWikipediaArticle(wikiTitle);

      if (article?.extract) {
        description = article.extract.slice(0, 800);
        wikiUrl = article.fullUrl;

        // Get CC images from Wikimedia
        if (options.fetchPhotos && article.images.length > 0) {
          const wikiImages = await getWikimediaImages(osm.name, 3);
          images = [...images, ...wikiImages];
        }
      }
    } catch {
      // Wikipedia not available for this location — continue
    }
  }

  // Step B: Get seasonal data
  try {
    const climate = await getClimateData(osm.lat, osm.lng);
    if (climate) {
      const analysis = calculateBestSeasons(climate);
      bestSeason = analysis.bestSeason;
    }
  } catch {
    bestSeason = ["Spring", "Autumn"]; // Nepal default
  }

  // Step C: Get Flickr photos
  if (options.fetchPhotos && images.length < 2) {
    try {
      const flickrPhotos = await searchFlickrPhotos(osm.name, 3);
      images = [...images, ...flickrPhotos.map((p) => p.url)];
    } catch {
      // No photos available
    }
  }

  // Step D: AI enrichment
  let aiData: any = {};
  if (options.enrichWithAI) {
    try {
      aiData = await aiEnrichLocation(
        osm.name,
        osm.lat,
        osm.lng,
        osm.category,
        province,
        description,
        osm.elevation
      );
    } catch {
      // AI enrichment failed — use what we have
    }
  }

  const slug = slugify(osm.name);

  return {
    name: osm.name,
    nameNepali: osm.nameNepali,
    slug,
    lat: osm.lat,
    lng: osm.lng,
    category: aiData.category ?? osm.category,
    province,
    elevationM: osm.elevation ?? aiData.elevationM ?? null,
    tagline: aiData.tagline,
    description: aiData.description ?? description,
    highlights: aiData.highlights ?? highlights,
    bestSeason: aiData.bestSeason ?? bestSeason,
    tags: [...new Set([...tags, ...(aiData.tags ?? [])])],
    warnings: aiData.warnings ?? [],
    isHiddenGem: aiData.isHiddenGem ?? isLikelyHiddenGem(osm),
    coverImageUrl: images[0] ?? undefined,
    galleryUrls: images.slice(1, 5),
    seoTitle: aiData.seoTitle,
    seoDescription: aiData.seoDescription,
    wikiUrl: wikiUrl || undefined,
    osmId: osm.id,
    source: "osm_bulk_import",
  };
}

// ─── AI enrichment for a single location ──────────────

async function aiEnrichLocation(
  name: string,
  lat: number,
  lng: number,
  category: string,
  province: string,
  existingDescription: string,
  elevation?: number
): Promise<any> {
  const prompt = `Enrich this Nepal location for a travel platform. Be concise and accurate.

Location: ${name}
Province: ${province}
Category: ${category}
Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E
${elevation ? `Elevation: ${elevation}m` : ""}
${existingDescription ? `Existing info: ${existingDescription.slice(0, 300)}` : ""}

Return ONLY valid JSON (no markdown):
{
  "tagline": "8-10 word evocative tagline",
  "description": "2-3 sentence description covering what makes this place special",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "bestSeason": ["Spring", "Autumn"],
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "warnings": [],
  "isHiddenGem": false,
  "category": "${category}",
  "elevationM": ${elevation ?? null},
  "seoTitle": "SEO title under 60 chars",
  "seoDescription": "meta description 120-155 chars"
}`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 500,
    temperature: 0.6,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (response.content[0] as any)?.text ?? "{}";
  return JSON.parse(text);
}

// ─── Helpers ──────────────────────────────────────────

function extractOSMTags(tags: Record<string, string>): string[] {
  const result: string[] = [];
  if (tags.natural) result.push(tags.natural);
  if (tags.tourism) result.push(tags.tourism);
  if (tags.historic) result.push(tags.historic);
  if (tags.religion) result.push(tags.religion);
  if (tags.amenity) result.push(tags.amenity);
  if (tags.place) result.push(tags.place);
  return result.filter(Boolean).map((t) => t.toLowerCase());
}

function isLikelyHiddenGem(osm: any): boolean {
  // Locations with no Wikipedia entry and high elevation
  // are likely undiscovered
  const hasWikipedia = !!osm.wikipedia;
  const isHighAltitude = (osm.elevation ?? 0) > 3500;
  const isRemoteCategory =
    osm.category === "lake" ||
    osm.category === "waterfall" ||
    osm.category === "viewpoint";

  return !hasWikipedia && (isHighAltitude || isRemoteCategory);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
