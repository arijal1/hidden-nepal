// Multi-source location verification — cross-checks Nominatim + Wikipedia + Wikidata
// Returns a trust score and the most accurate consolidated data

import { getWikipediaArticle, getWikipediaFullText, getWikidataForLocation } from "./wikipedia";

// Nepal bounding box
const NEPAL_BBOX = { minLat: 26.3, maxLat: 30.5, minLng: 80.0, maxLng: 88.2 };

export interface NominatimResult {
  lat: number;
  lng: number;
  display_name: string;
  type: string;
  category: string;
  importance: number;
  osm_id: number;
  osm_type: string;
  address?: any;
  extratags?: Record<string, string>;
}

export interface VerifiedLocation {
  name: string;
  nameNepali?: string;
  coordinates: { lat: number; lng: number };
  elevation?: number;
  province?: string;
  category?: string;
  sources: {
    nominatim?: { lat: number; lng: number; type: string; importance: number; osmId: number };
    wikipedia?: { title: string; url: string; coordinates?: { lat: number; lng: number }; thumbnail?: string; extract?: string };
    wikidata?: { id: string; coordinates?: { lat: number; lng: number }; elevation?: number };
  };
  trustScore: number;
  trustReasons: string[];
  warnings: string[];
  inNepal: boolean;
}

async function searchNominatim(query: string): Promise<NominatimResult[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", `${query}, Nepal`);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("countrycodes", "np");
  url.searchParams.set("limit", "5");
  url.searchParams.set("extratags", "1");
  url.searchParams.set("addressdetails", "1");

  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "HiddenNepal/1.0 (https://hiddennepal.anuprijal.com)" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data ?? []).map((d: any) => ({
      lat: Number(d.lat),
      lng: Number(d.lon),
      display_name: d.display_name,
      type: d.type,
      category: d.category,
      importance: d.importance,
      osm_id: d.osm_id,
      osm_type: d.osm_type,
      address: d.address,
      extratags: d.extratags ?? {},
    }));
  } catch {
    return [];
  }
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

function inNepalBbox(lat: number, lng: number): boolean {
  return lat >= NEPAL_BBOX.minLat && lat <= NEPAL_BBOX.maxLat && lng >= NEPAL_BBOX.minLng && lng <= NEPAL_BBOX.maxLng;
}

function inferProvinceFromCoords(lat: number, lng: number): string {
  // Rough province inference
  if (lng < 81.5) return "Sudurpashchim";
  if (lng < 82.5) return "Karnali";
  if (lng < 83.5) return "Lumbini";
  if (lng < 85.0) return "Gandaki";
  if (lng < 86.0) return "Bagmati";
  if (lng < 87.0) return "Madhesh";
  return "Koshi";
}

export async function verifyLocation(query: string): Promise<VerifiedLocation | null> {
  if (!query || query.trim().length < 2) return null;

  // Parallel search
  const [nominatimResults, wikiArticle] = await Promise.all([
    searchNominatim(query),
    getWikipediaArticle(query).catch(() => null),
  ]);

  // Best Nominatim hit (highest importance, within Nepal)
  const validNominatim = nominatimResults.filter((n) => inNepalBbox(n.lat, n.lng));
  const bestNominatim = validNominatim.sort((a, b) => b.importance - a.importance)[0];

  // Wikidata if Wikipedia article has one
  let wikidataData: any = null;
  if (wikiArticle?.title) {
    wikidataData = await getWikidataForLocation(wikiArticle.title).catch(() => null);
  }

  // Determine final coordinates with priority: Nominatim > Wikipedia > Wikidata
  let finalCoords: { lat: number; lng: number } | null = null;
  if (bestNominatim) finalCoords = { lat: bestNominatim.lat, lng: bestNominatim.lng };
  else if (wikiArticle?.coordinates) finalCoords = wikiArticle.coordinates;
  else if (wikidataData?.coordinates) finalCoords = wikidataData.coordinates;

  if (!finalCoords) return null;
  if (!inNepalBbox(finalCoords.lat, finalCoords.lng)) {
    return {
      name: bestNominatim?.display_name?.split(",")[0] ?? wikiArticle?.title ?? query,
      coordinates: finalCoords,
      sources: {},
      trustScore: 0,
      trustReasons: [],
      warnings: ["Location appears to be OUTSIDE Nepal — rejected"],
      inNepal: false,
    };
  }

  // Trust scoring
  let score = 0;
  const reasons: string[] = [];
  const warnings: string[] = [];

  if (bestNominatim) { score += 30; reasons.push("✓ Found in OpenStreetMap"); }
  if (wikiArticle) { score += 30; reasons.push("✓ Has Wikipedia article"); }
  if (wikidataData) { score += 15; reasons.push("✓ Has Wikidata entity"); }

  // Cross-check coordinates between sources
  if (bestNominatim && wikiArticle?.coordinates) {
    const distance = haversineKm(
      { lat: bestNominatim.lat, lng: bestNominatim.lng },
      wikiArticle.coordinates
    );
    if (distance < 1) { score += 20; reasons.push(`✓ OSM + Wikipedia coords match (${distance.toFixed(2)}km apart)`); }
    else if (distance < 5) { score += 10; reasons.push(`✓ Coords roughly agree (${distance.toFixed(1)}km apart)`); }
    else {
      score -= 10;
      warnings.push(`⚠ OSM and Wikipedia coords differ by ${distance.toFixed(1)}km`);
    }
  }

  // Bilingual name
  const nameNp = bestNominatim?.extratags?.["name:ne"];
  if (nameNp) { score += 5; reasons.push("✓ Has Nepali name"); }

  // Elevation cross-check
  let elevation: number | undefined;
  if (bestNominatim?.extratags?.["ele"]) {
    elevation = parseFloat(bestNominatim.extratags["ele"]);
    score += 5;
    reasons.push(`✓ Elevation: ${elevation}m`);
  } else if (wikidataData?.elevation) {
    elevation = wikidataData.elevation;
    score += 5;
    reasons.push(`✓ Elevation: ${elevation}m (Wikidata)`);
  }

  // Rich metadata (many OSM tags)
  if (bestNominatim?.extratags && Object.keys(bestNominatim.extratags).length >= 5) {
    score += 5;
    reasons.push("✓ Rich OSM metadata");
  }

  // Wikipedia thumbnail
  if (wikiArticle?.thumbnail?.source) {
    score += 5;
    reasons.push("✓ Wikipedia has photo");
  }

  const name = wikiArticle?.title ?? bestNominatim?.display_name?.split(",")[0] ?? query;
  const province = inferProvinceFromCoords(finalCoords.lat, finalCoords.lng);

  return {
    name,
    nameNepali: nameNp,
    coordinates: finalCoords,
    elevation,
    province,
    category: bestNominatim?.type,
    sources: {
      nominatim: bestNominatim ? {
        lat: bestNominatim.lat,
        lng: bestNominatim.lng,
        type: bestNominatim.type,
        importance: bestNominatim.importance,
        osmId: bestNominatim.osm_id,
      } : undefined,
      wikipedia: wikiArticle ? {
        title: wikiArticle.title,
        url: wikiArticle.fullUrl,
        coordinates: wikiArticle.coordinates,
        thumbnail: wikiArticle.thumbnail?.source,
        extract: wikiArticle.extract,
      } : undefined,
      wikidata: wikidataData ? {
        id: wikidataData.id ?? "",
        coordinates: wikidataData.coordinates,
        elevation: wikidataData.elevation,
      } : undefined,
    },
    trustScore: Math.min(100, Math.max(0, score)),
    trustReasons: reasons,
    warnings,
    inNepal: true,
  };
}
