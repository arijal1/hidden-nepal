// lib/content/trekImport.ts
// Orchestrates trek import: Curated list → Claude enrichment → Wikipedia images → Supabase

import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/server";
import { getWikipediaArticle, getWikimediaImages } from "./wikipedia";
import { CURATED_TREKS, type CuratedTrek } from "./treks-list";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface TrekImportProgress {
  type: "start" | "progress" | "success" | "skip" | "fail" | "done" | "fatal";
  current?: number;
  total?: number;
  trek?: string;
  message?: string;
  error?: string;
  slug?: string;
}

export async function* importCuratedTreks(options: {
  dryRun?: boolean;
  publishImmediately?: boolean;
  fetchPhotos?: boolean;
  filterCategory?: "famous" | "hidden_gem" | "remote" | "all";
}): AsyncGenerator<TrekImportProgress> {
  const { dryRun = false, publishImmediately = true, fetchPhotos = true, filterCategory = "all" } = options;
  const supabase = createAdminClient();

  const treks =
    filterCategory === "all"
      ? CURATED_TREKS
      : CURATED_TREKS.filter((t) => t.category === filterCategory);

  yield {
    type: "start",
    total: treks.length,
    message: `Enriching ${treks.length} treks with Claude AI…`,
  };

  let added = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < treks.length; i++) {
    const trek = treks[i];
    yield {
      type: "progress",
      current: i,
      total: treks.length,
      trek: trek.name,
      message: `(${i}/${treks.length}) ${trek.name}`,
    };

    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from("treks")
        .select("id")
        .eq("slug", trek.slug)
        .maybeSingle();

      if (existing) {
        skipped++;
        yield { type: "skip", trek: trek.name, message: "Already exists" };
        continue;
      }

      // Get Wikipedia image
      let coverImage: string | undefined;
      const galleryImages: string[] = [];
      if (fetchPhotos) {
        try {
          if (trek.wikipediaTitle) {
            const article = await getWikipediaArticle(trek.wikipediaTitle);
            if (article?.thumbnail?.source) {
              coverImage = article.thumbnail.source;
            }
          }
          const wikiImages = await getWikimediaImages(trek.name, 4);
          if (!coverImage && wikiImages[0]) coverImage = wikiImages[0];
          galleryImages.push(...wikiImages.slice(coverImage ? 0 : 1));
        } catch {
          // No images available
        }
      }

      // Enrich with Claude
      const enriched = await enrichTrekWithClaude(trek);

      if (dryRun) {
        added++;
        yield { type: "success", trek: trek.name, message: "✓ Dry run preview" };
        continue;
      }

      // Save to Supabase
      const { data: insertedTrek, error: trekError } = await supabase
        .from("treks")
        .insert({
          slug: trek.slug,
          name: trek.name,
          description: enriched.description,
          difficulty: trek.difficulty,
          duration_days: trek.durationDays,
          max_elevation_m: trek.maxElevationM,
          start_point: trek.startPoint,
          end_point: trek.endPoint,
          distance_km: trek.distanceKm,
          permit_required: trek.permitRequired,
          permit_info: enriched.permitInfo,
          permit_cost_usd: trek.permitCostUsd,
          best_season: enriched.bestSeason,
          emergency_contacts: enriched.emergencyContacts,
          elevation_profile: enriched.elevationProfile,
          highlights: enriched.highlights,
          packing_list: enriched.packingList,
          is_published: publishImmediately,
          cover_image_url: coverImage,
          gallery_urls: galleryImages.slice(0, 5),
        })
        .select("id")
        .single();

      if (trekError || !insertedTrek) {
        failed++;
        yield { type: "fail", trek: trek.name, error: trekError?.message ?? "Insert failed" };
        continue;
      }

      // Insert stages
      if (enriched.stages && enriched.stages.length > 0) {
        const stageRows = enriched.stages.map((s: any, idx: number) => ({
          trek_id: insertedTrek.id,
          stage_number: idx + 1,
          name: s.name,
          start_point: s.startPoint,
          end_point: s.endPoint,
          distance_km: s.distanceKm,
          duration_hours: s.durationHours,
          elevation_gain_m: s.elevationGainM,
          elevation_loss_m: s.elevationLossM,
          max_elevation_m: s.maxElevationM,
          description: s.description,
          accommodation: s.accommodation,
          meals_available: s.mealsAvailable ?? [],
        }));
        await supabase.from("trek_stages").insert(stageRows);
      }

      added++;
      yield { type: "success", trek: trek.name, slug: trek.slug, message: `✓ Added with ${enriched.stages?.length ?? 0} stages` };
    } catch (err: any) {
      failed++;
      yield { type: "fail", trek: trek.name, error: err.message ?? String(err) };
    }
  }

  yield {
    type: "done",
    message: `Complete. ${added} added, ${skipped} skipped, ${failed} failed.`,
  };
}

async function enrichTrekWithClaude(trek: CuratedTrek): Promise<any> {
  const prompt = `You are a Nepal trekking expert. Generate detailed, accurate trek information for "${trek.name}".

Trek facts:
- Difficulty: ${trek.difficulty}
- Duration: ${trek.durationDays} days
- Max elevation: ${trek.maxElevationM}m
- Start: ${trek.startPoint}
- End: ${trek.endPoint}
- Distance: ${trek.distanceKm}km
- Region: ${trek.region}
- Summary: ${trek.summary}

Respond with VALID JSON only (no markdown, no preamble) matching this structure:
{
  "description": "Rich 2-3 paragraph description (300-500 words). Cover what makes this trek special, cultural context, terrain, and the experience. Be authentic and specific.",
  "permitInfo": "1-2 sentence explanation of permits needed and where to obtain them",
  "bestSeason": ["Spring", "Autumn"] or whichever months/seasons work best with brief reasoning embedded,
  "highlights": ["6-8 specific highlights — places, experiences, viewpoints"],
  "packingList": ["categorized packing essentials — clothing, gear, documents, medical, electronics — 15-20 items total"],
  "emergencyContacts": [
    {"name": "Tourist Police Nepal", "phone": "+977-1-4247041", "notes": "24/7 emergency line"},
    {"name": "Add real Nepal helicopter rescue or HRA contacts relevant to this trek's region", "phone": "...", "notes": "..."}
  ],
  "elevationProfile": [
    {"day": 1, "location": "Place name", "elevationM": 2800, "distanceKm": 12},
    {"day": 2, "location": "...", "elevationM": 3200, "distanceKm": 8}
    // one entry per day, matches durationDays
  ],
  "stages": [
    {
      "name": "Day 1: Lukla to Phakding",
      "startPoint": "Lukla (2,860m)",
      "endPoint": "Phakding (2,610m)",
      "distanceKm": 8,
      "durationHours": 3.5,
      "elevationGainM": 200,
      "elevationLossM": 450,
      "maxElevationM": 2860,
      "description": "2-3 sentences about this stage — trail conditions, what you'll see, key landmarks",
      "accommodation": "Specific teahouse name or type",
      "mealsAvailable": ["breakfast", "lunch", "dinner"]
    }
    // one stage per day
  ]
}

Be specific. Use real Nepali place names. Mention real teahouses. Include real emergency contacts.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 12000,
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (response.content[0] as any)?.text ?? "";
  // Extract JSON
  let jsonText = text.trim().replace(/^```json\s*/gm, "").replace(/```\s*$/gm, "");
  const firstBrace = jsonText.indexOf("{");
  const lastBrace = jsonText.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON in Claude response");
  jsonText = jsonText.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonText);
}
