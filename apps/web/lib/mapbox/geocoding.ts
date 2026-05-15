// lib/mapbox/geocoding.ts
// Mapbox Geocoding API wrapper

export interface GeocodingResult {
  id: string;
  name: string;
  fullName: string;
  lat: number;
  lng: number;
  placeType: string[];
  bbox?: [number, number, number, number];
  context: {
    district?: string;
    region?: string;
    country?: string;
  };
}

// Nepal bounding box — restricts results to Nepal only
const NEPAL_BBOX = "80.0586,26.3478,88.2015,30.4227";

export async function geocodeLocation(query: string): Promise<GeocodingResult[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) throw new Error("Mapbox token not configured");

  const encoded = encodeURIComponent(query);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?` +
    `access_token=${token}` +
    `&bbox=${NEPAL_BBOX}` +
    `&country=NP` +
    `&limit=5` +
    `&language=en` +
    `&types=poi,place,locality,neighborhood,region,address`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);

  const data = await res.json();

  return (data.features ?? []).map((f: any): GeocodingResult => {
    const context = f.context ?? [];
    const district = context.find((c: any) => c.id.startsWith("district"))?.text;
    const region = context.find((c: any) => c.id.startsWith("region"))?.text;
    const country = context.find((c: any) => c.id.startsWith("country"))?.text;

    return {
      id: f.id,
      name: f.text,
      fullName: f.place_name,
      lat: f.center[1],
      lng: f.center[0],
      placeType: f.place_type,
      bbox: f.bbox,
      context: { district, region, country },
    };
  });
}

// Get elevation from Mapbox Terrain API
export async function getElevation(lat: number, lng: number): Promise<number | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;

  try {
    const url = `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${lng},${lat}.json?layers=contour&limit=50&access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const elevations = (data.features ?? [])
      .map((f: any) => f.properties?.ele)
      .filter((e: any) => typeof e === "number");

    return elevations.length > 0 ? Math.max(...elevations) : null;
  } catch {
    return null;
  }
}

// Map Mapbox place_type to our destination category
export function inferCategory(placeTypes: string[], name: string): string {
  const nameLower = name.toLowerCase();

  if (nameLower.includes("lake") || nameLower.includes("tal") || nameLower.includes("pokhari")) return "lake";
  if (nameLower.includes("trek") || nameLower.includes("trail") || nameLower.includes("base camp")) return "trek";
  if (nameLower.includes("temple") || nameLower.includes("mandir") || nameLower.includes("stupa") || nameLower.includes("monastery")) return "temple";
  if (nameLower.includes("waterfall") || nameLower.includes("falls")) return "waterfall";
  if (nameLower.includes("hill") || nameLower.includes("view") || nameLower.includes("danda") || nameLower.includes("ridge")) return "viewpoint";
  if (nameLower.includes("valley") || nameLower.includes("khola")) return "valley";
  if (nameLower.includes("park") || nameLower.includes("reserve") || nameLower.includes("wildlife")) return "park";
  if (nameLower.includes("village") || nameLower.includes("gaun")) return "village";

  if (placeTypes.includes("place")) return "city";
  if (placeTypes.includes("poi")) return "cultural";

  return "cultural";
}

// Infer Nepal province from coordinates
export function inferProvince(lat: number, lng: number): string {
  // Rough province bounding boxes
  if (lng > 86.5) return "Koshi";
  if (lat < 27.2 && lng > 85.5) return "Madhesh";
  if (lng > 84.5 && lng <= 86.5) return "Bagmati";
  if (lng > 82.5 && lng <= 84.5) return "Gandaki";
  if (lat < 27.5 && lng > 81.5 && lng <= 83.5) return "Lumbini";
  if (lat > 28.5 && lng <= 83.5) return "Karnali";
  return "Sudurpashchim";
}
