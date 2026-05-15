// lib/ai/prompts/location.ts
// OpenAI prompts for enriching location data

export const LOCATION_ENRICHMENT_SYSTEM = `You are an expert Nepal travel writer and geographer with deep knowledge of every province, district, and notable location in Nepal. You specialize in discovering and documenting hidden gems, natural landmarks, cultural sites, and trekking destinations.

Your task is to enrich location data for the Hidden Nepal travel platform. Be accurate, specific, and authentic — do not fabricate facts. If you're unsure about specific details, provide reasonable estimates based on geographic context.

Always respond with valid JSON only. No markdown, no preamble, no explanation.`;

export function buildEnrichmentPrompt(
  name: string,
  lat: number,
  lng: number,
  elevation: number | null,
  province: string,
  category: string
): string {
  return `Enrich this Nepal location for a travel platform:

Name: ${name}
Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E
Province: ${province}
Category: ${category}
${elevation ? `Elevation: ~${elevation}m` : ""}

Return ONLY this JSON structure (no markdown):
{
  "tagline": "string — 8-12 word evocative tagline that captures the essence",
  "description": "string — 3-4 sentence rich description covering what makes this place special, its character, and why travelers should visit",
  "isHiddenGem": boolean — true if this is an obscure/off-beaten-path place most tourists never find,
  "highlights": ["string", "string", "string"] — 3-5 specific highlights or things to do/see,
  "bestSeason": ["Spring", "Autumn"] — array of best seasons from: Spring, Summer, Monsoon, Autumn, Winter,
  "tags": ["string"] — 4-8 relevant tags (lowercase, specific),
  "warnings": ["string"] — 0-3 important travel warnings or notes (altitude, permits, access etc),
  "estimatedDurationDays": number — typical visit duration in days,
  "elevationM": number or null — best estimate of elevation in meters if not provided,
  "category": "string" — one of: city, village, lake, trek, temple, waterfall, viewpoint, valley, park, cultural, hidden_gem,
  "seoTitle": "string — SEO title under 60 chars",
  "seoDescription": "string — SEO meta description 120-155 chars"
}`;
}
