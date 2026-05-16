// lib/content/transportGenerator.ts
// Generates realistic transport routes for destinations using Claude

import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface TransportProgress {
  type: "start" | "progress" | "success" | "skip" | "fail" | "done" | "fatal";
  current?: number;
  total?: number;
  destination?: string;
  message?: string;
  error?: string;
  routesAdded?: number;
}

export async function* generateTransportForAll(options: {
  dryRun?: boolean;
  onlyMissing?: boolean;
}): AsyncGenerator<TransportProgress> {
  const { dryRun = false, onlyMissing = true } = options;
  const supabase = createAdminClient();

  // Query published destinations
  let query = supabase
    .from("destinations")
    .select("id, name, slug, province, category, coordinates, elevation_m")
    .eq("is_published", true);

  const { data: destinations, error } = await query;

  if (error || !destinations) {
    yield { type: "fatal", error: error?.message ?? "Failed to load destinations" };
    return;
  }

  // If onlyMissing, filter out destinations that already have transport routes
  let targets = destinations;
  if (onlyMissing) {
    const { data: existingRoutes } = await supabase
      .from("transport_routes")
      .select("destination_id");
    const existingIds = new Set((existingRoutes ?? []).map((r) => r.destination_id));
    targets = destinations.filter((d) => !existingIds.has(d.id));
  }

  yield {
    type: "start",
    total: targets.length,
    message: `Generating transport for ${targets.length} destinations…`,
  };

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < targets.length; i++) {
    const dest = targets[i];
    yield {
      type: "progress",
      current: i,
      total: targets.length,
      destination: dest.name,
      message: `(${i}/${targets.length}) ${dest.name}`,
    };

    try {
      const routes = await generateRoutesWithClaude(dest);

      if (!routes || routes.length === 0) {
        skipped++;
        yield { type: "skip", destination: dest.name, message: "No routes generated" };
        continue;
      }

      if (dryRun) {
        success++;
        yield {
          type: "success",
          destination: dest.name,
          routesAdded: routes.length,
          message: `✓ Would add ${routes.length} routes (dry run)`,
        };
        continue;
      }

      // Save routes to DB
      const rows = routes.map((r: any, idx: number) => ({
        destination_id: dest.id,
        from_location: r.fromLocation,
        transport_type: r.transportType,
        duration_hours: r.durationHours,
        cost_min_npr: r.costMinNpr,
        cost_max_npr: r.costMaxNpr,
        description: r.description,
        road_condition: r.roadCondition,
        notes: r.notes,
        is_recommended: idx === 0,
        sort_order: idx,
      }));

      const { error: insertError } = await supabase.from("transport_routes").insert(rows);

      if (insertError) {
        failed++;
        yield { type: "fail", destination: dest.name, error: insertError.message };
        continue;
      }

      success++;
      yield {
        type: "success",
        destination: dest.name,
        routesAdded: routes.length,
        message: `✓ Added ${routes.length} routes`,
      };
    } catch (err: any) {
      failed++;
      yield { type: "fail", destination: dest.name, error: err.message ?? String(err) };
    }
  }

  yield {
    type: "done",
    message: `Complete. ${success} succeeded, ${skipped} skipped, ${failed} failed.`,
  };
}

async function generateRoutesWithClaude(dest: any): Promise<any[]> {
  const prompt = `You are a Nepal travel logistics expert. Generate realistic transport routes to "${dest.name}" (${dest.category} in ${dest.province} Province${dest.elevation_m ? `, ${dest.elevation_m}m elevation` : ""}).

Generate 2-4 transport options from major Nepal hubs (Kathmandu, Pokhara, or the nearest big city). Use REAL routes — actual roads, real bus operators, realistic costs in Nepali Rupees (NPR), realistic travel times.

Respond with VALID JSON only (no markdown, no preamble):
[
  {
    "fromLocation": "Kathmandu",
    "transportType": "flight" | "bus" | "jeep" | "trek" | "walk" | "boat" | "cable_car",
    "durationHours": 1.5,
    "costMinNpr": 8000,
    "costMaxNpr": 12000,
    "description": "1-2 sentences explaining the route — airport name, road taken, what to expect",
    "roadCondition": "excellent" | "good" | "fair" | "poor" | "seasonal_only",
    "notes": "Practical tips — best time of day, where to book, things to know"
  }
]

RULES:
- Cost in NEPALI RUPEES (not USD). Domestic flight ~$80-150 = 10000-20000 NPR. Local bus 500-2000 NPR. Jeep 1500-5000 NPR.
- Be realistic about durations including stops/breaks.
- For trekking destinations, include the trekking stage from the nearest road head.
- First route should be the most recommended (fastest or most comfortable).
- Use real Nepali place names.
- If destination requires combining transport (flight + jeep + trek), list as separate routes OR combine in description.
- For remote locations (Dolpo, Mustang), mention permits needed in notes.`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2000,
    temperature: 0.4,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (response.content[0] as any)?.text ?? "";
  let jsonText = text.trim().replace(/^```json\s*/gm, "").replace(/```\s*$/gm, "");
  const firstBracket = jsonText.indexOf("[");
  const lastBracket = jsonText.lastIndexOf("]");
  if (firstBracket === -1 || lastBracket === -1) throw new Error("No JSON array in response");
  jsonText = jsonText.slice(firstBracket, lastBracket + 1);
  const routes = JSON.parse(jsonText);
  return Array.isArray(routes) ? routes : [];
}
