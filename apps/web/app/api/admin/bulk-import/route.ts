// app/api/admin/bulk-import/route.ts
// POST → start bulk import
// Returns SSE stream with progress updates

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { fetchOSMByCategory, OSM_BULK_CATEGORIES } from "@/lib/content/openstreetmap";
import { getWikipediaArticle, getWikimediaImages } from "@/lib/content/wikipedia";
import { getClimateData, calculateBestSeasons } from "@/lib/content/weather";
import { inferProvince, getElevation } from "@/lib/mapbox/geocoding";
import { slugify } from "@/lib/utils/formatters";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const InputSchema = z.object({
  category: z.string(),
  limit: z.number().min(1).max(200).default(50),
  enrichWithAI: z.boolean().default(true),
  fetchWikipedia: z.boolean().default(true),
  publishAll: z.boolean().default(false),
  dryRun: z.boolean().default(false), // preview without saving
});

export async function POST(req: NextRequest) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  try {
    const body = await req.json();
    const input = InputSchema.parse(body);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        };

        send({ type: "start", message: "Fetching from OpenStreetMap…" });

        try {
          // Step 1: Fetch OSM data
          const osmLocations = await fetchOSMByCategory(
            input.category as any,
            input.limit
          );

          send({
            type: "progress",
            total: osmLocations.length,
            processed: 0,
            message: `Found ${osmLocations.length} locations. Enriching…`,
          });

          const supabase = createAdminClient();
          let processed = 0;
          let succeeded = 0;
          let skipped = 0;
          let failed = 0;

          for (const osm of osmLocations) {
            send({
              type: "item",
              name: osm.name,
              processed,
              total: osmLocations.length,
            });

            try {
              // Check if already exists
              const { data: existing } = await supabase
                .from("destinations")
                .select("id")
                .eq("slug", slugify(osm.name))
                .single();

              if (existing) {
                skipped++;
                processed++;
                continue;
              }

              // Enrich the location
              const enriched = await enrichSingle(osm, input);

              if (input.dryRun) {
                send({ type: "preview", item: enriched });
                succeeded++;
                processed++;
                continue;
              }

              // Save to Supabase
              const { error } = await supabase.from("destinations").insert({
                name: enriched.name,
                name_nepali: enriched.nameNepali ?? null,
                slug: enriched.slug,
                tagline: enriched.tagline ?? null,
                description: enriched.description ?? null,
                province: enriched.province,
                category: enriched.category,
                is_hidden_gem: enriched.isHiddenGem,
                is_published: input.publishAll,
                is_featured: false,
                coordinates: `SRID=4326;POINT(${osm.lng} ${osm.lat})`,
                elevation_m: enriched.elevationM ?? null,
                best_season: enriched.bestSeason,
                highlights: enriched.highlights,
                warnings: enriched.warnings,
                tags: enriched.tags,
                cover_image_url: enriched.coverImageUrl ?? null,
                gallery_urls: enriched.galleryUrls,
                seo_title: enriched.seoTitle ?? null,
                seo_description: enriched.seoDescription ?? null,
              });

              if (error && error.code !== "23505") throw error;
              succeeded++;
            } catch (err: any) {
              failed++;
              send({
                type: "error",
                name: osm.name,
                error: err.message,
              });
            }

            processed++;
            await sleep(150); // rate limit
          }

          send({
            type: "complete",
            total: osmLocations.length,
            succeeded,
            skipped,
            failed,
            message: `Import complete. ${succeeded} added, ${skipped} skipped, ${failed} failed.`,
          });
        } catch (err: any) {
          send({ type: "fatal", error: err.message });
        }

        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}

// ─── Enrich single location ───────────────────────────

async function enrichSingle(osm: any, input: any) {
  const province = inferProvince(osm.lat, osm.lng);
  let description = "";
  let images: string[] = [];
  let bestSeason = ["Spring", "Autumn"];

  // Wikipedia
  if (input.fetchWikipedia) {
    try {
      const wikiTitle = osm.wikipedia?.replace("en:", "") ?? osm.name;
      const article = await getWikipediaArticle(wikiTitle);
      if (article?.extract) {
        description = article.extract.slice(0, 600);
        const wikiImages = await getWikimediaImages(osm.name, 3);
        images = wikiImages;
      }
    } catch {}
  }

  // Seasonal data
  try {
    const climate = await getClimateData(osm.lat, osm.lng);
    if (climate) {
      const analysis = calculateBestSeasons(climate);
      bestSeason = analysis.bestSeason;
    }
  } catch {}

  // AI enrichment
  let aiData: any = {};
  if (input.enrichWithAI) {
    try {
      const res = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 400,
        temperature: 0.6,
        messages: [{
          role: "user",
          content: `Nepal location: "${osm.name}" (${osm.category}, ${province} province, ${osm.lat.toFixed(3)}°N ${osm.lng.toFixed(3)}°E${osm.elevation ? `, ${osm.elevation}m` : ""}).
${description ? `Context: ${description.slice(0, 200)}` : ""}
Return JSON: {tagline,description,highlights:[],bestSeason:[],tags:[],warnings:[],isHiddenGem,seoTitle,seoDescription}`,
        }],
      });
      aiData = JSON.parse((res.content[0] as any)?.text ?? "{}");
    } catch {}
  }

  return {
    name: osm.name,
    nameNepali: osm.nameNepali,
    slug: slugify(osm.name),
    lat: osm.lat,
    lng: osm.lng,
    category: aiData.category ?? osm.category,
    province,
    elevationM: osm.elevation ?? aiData.elevationM ?? null,
    tagline: aiData.tagline,
    description: aiData.description ?? description,
    highlights: aiData.highlights ?? [],
    bestSeason: aiData.bestSeason ?? bestSeason,
    tags: aiData.tags ?? [],
    warnings: aiData.warnings ?? [],
    isHiddenGem: aiData.isHiddenGem ?? (!osm.wikipedia && (osm.elevation ?? 0) > 3000),
    coverImageUrl: images[0],
    galleryUrls: images.slice(1),
    seoTitle: aiData.seoTitle,
    seoDescription: aiData.seoDescription,
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
