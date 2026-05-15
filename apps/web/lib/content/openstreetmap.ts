// lib/content/openstreetmap.ts
// OpenStreetMap Overpass API — fetch Nepal POIs in bulk

export interface OSMLocation {
  id: number;
  name: string;
  nameNepali?: string;
  lat: number;
  lng: number;
  tags: Record<string, string>;
  category: string;
  osmType: "node" | "way" | "relation";
  website?: string;
  elevation?: number;
  wikipedia?: string;
  wikidata?: string;
}

const OVERPASS_API = "https://overpass-api.de/api/interpreter";

// Nepal bounding box
const NEPAL_BBOX = "26.3,80.0,30.5,88.2";

// ─── Category queries ─────────────────────────────────

const CATEGORY_QUERIES: Record<string, string> = {
  lake: `
    (
      node["natural"="water"]["water"="lake"](${NEPAL_BBOX});
      way["natural"="water"]["water"="lake"](${NEPAL_BBOX});
      relation["natural"="water"]["water"="lake"](${NEPAL_BBOX});
    );
  `,
  temple: `
    (
      node["amenity"="place_of_worship"]["religion"="hindu"](${NEPAL_BBOX});
      node["amenity"="place_of_worship"]["religion"="buddhist"](${NEPAL_BBOX});
      node["historic"="temple"](${NEPAL_BBOX});
      way["amenity"="place_of_worship"](${NEPAL_BBOX});
    );
  `,
  peak: `
    (
      node["natural"="peak"](${NEPAL_BBOX});
      node["natural"="volcano"](${NEPAL_BBOX});
    );
  `,
  waterfall: `
    (
      node["waterway"="waterfall"](${NEPAL_BBOX});
      way["waterway"="waterfall"](${NEPAL_BBOX});
    );
  `,
  nationalpark: `
    (
      relation["boundary"="national_park"](${NEPAL_BBOX});
      relation["leisure"="nature_reserve"](${NEPAL_BBOX});
      way["boundary"="national_park"](${NEPAL_BBOX});
    );
  `,
  village: `
    (
      node["place"="village"](${NEPAL_BBOX});
      node["place"="hamlet"](${NEPAL_BBOX});
    );
  `,
  viewpoint: `
    (
      node["tourism"="viewpoint"](${NEPAL_BBOX});
      node["tourism"="attraction"]["natural"="peak"](${NEPAL_BBOX});
    );
  `,
  heritage: `
    (
      node["historic"="monument"](${NEPAL_BBOX});
      node["historic"="archaeological_site"](${NEPAL_BBOX});
      node["heritage"](${NEPAL_BBOX});
      way["historic"="ruins"](${NEPAL_BBOX});
    );
  `,
};

// ─── Fetch by category ────────────────────────────────

export async function fetchOSMByCategory(
  category: keyof typeof CATEGORY_QUERIES,
  limit = 100
): Promise<OSMLocation[]> {
  const innerQuery = CATEGORY_QUERIES[category];
  if (!innerQuery) throw new Error(`Unknown category: ${category}`);

  const query = `
    [out:json][timeout:60];
    ${innerQuery}
    out center ${limit};
  `;

  return executeOverpassQuery(query, category);
}

// ─── Fetch locations near coordinates ─────────────────

export async function fetchOSMNearLocation(
  lat: number,
  lng: number,
  radiusMeters = 50000,
  categories: string[] = ["tourism", "natural", "historic"]
): Promise<OSMLocation[]> {
  const filters = categories
    .map(
      (cat) => `
      node["${cat}"](around:${radiusMeters},${lat},${lng});
      way["${cat}"](around:${radiusMeters},${lat},${lng});
    `
    )
    .join("\n");

  const query = `
    [out:json][timeout:30];
    (
      ${filters}
    );
    out center 50;
  `;

  return executeOverpassQuery(query, "mixed");
}

// ─── Fetch entire province ────────────────────────────

export async function fetchOSMByProvince(
  provinceId: string,
  category: string = "all"
): Promise<OSMLocation[]> {
  // Nepal province relation IDs in OSM
  const PROVINCE_OSM_IDS: Record<string, string> = {
    Koshi: "11162418",
    Madhesh: "11162419",
    Bagmati: "11162420",
    Gandaki: "11162421",
    Lumbini: "11162422",
    Karnali: "11162423",
    Sudurpashchim: "11162424",
  };

  const relationId = PROVINCE_OSM_IDS[provinceId];
  if (!relationId) throw new Error(`Unknown province: ${provinceId}`);

  const categoryFilter =
    category === "all"
      ? `
        node["natural"="water"]["water"="lake"](area.province);
        node["natural"="peak"](area.province);
        node["tourism"="viewpoint"](area.province);
        node["waterway"="waterfall"](area.province);
        node["amenity"="place_of_worship"](area.province);
      `
      : `node["${category}"](area.province);`;

  const query = `
    [out:json][timeout:90];
    area(${parseInt(relationId) + 3600000000})->.province;
    (
      ${categoryFilter}
    );
    out center 200;
  `;

  return executeOverpassQuery(query, category);
}

// ─── Execute Overpass query ───────────────────────────

async function executeOverpassQuery(
  query: string,
  defaultCategory: string
): Promise<OSMLocation[]> {
  const res = await fetch(OVERPASS_API, {
    method: "POST",
    body: query,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!res.ok) throw new Error(`Overpass API error: ${res.status}`);

  const data = await res.json();
  const elements: any[] = data.elements ?? [];

  return elements
    .filter((el) => el.tags?.name) // only named places
    .map((el): OSMLocation => {
      const lat = el.lat ?? el.center?.lat ?? 0;
      const lng = el.lon ?? el.center?.lon ?? 0;

      return {
        id: el.id,
        name: el.tags.name,
        nameNepali: el.tags["name:ne"] ?? el.tags["name:nep"] ?? undefined,
        lat,
        lng,
        tags: el.tags,
        category: inferOSMCategory(el.tags, defaultCategory),
        osmType: el.type,
        website: el.tags.website ?? el.tags["contact:website"] ?? undefined,
        elevation: el.tags.ele ? parseInt(el.tags.ele) : undefined,
        wikipedia: el.tags.wikipedia ?? undefined,
        wikidata: el.tags.wikidata ?? undefined,
      };
    })
    .filter((loc) => loc.lat !== 0 && loc.lng !== 0); // valid coordinates only
}

// ─── Infer category from OSM tags ─────────────────────

function inferOSMCategory(
  tags: Record<string, string>,
  defaultCategory: string
): string {
  if (tags.natural === "water" || tags.water === "lake") return "lake";
  if (tags.natural === "peak") return "viewpoint";
  if (tags.waterway === "waterfall") return "waterfall";
  if (tags.amenity === "place_of_worship") return "temple";
  if (tags.historic === "temple") return "temple";
  if (tags.boundary === "national_park") return "park";
  if (tags.leisure === "nature_reserve") return "park";
  if (tags.tourism === "viewpoint") return "viewpoint";
  if (tags.tourism === "attraction") return "cultural";
  if (tags.historic === "monument") return "cultural";
  if (tags.place === "village" || tags.place === "hamlet") return "village";
  if (tags.place === "city" || tags.place === "town") return "city";
  if (tags.place === "valley") return "valley";
  return defaultCategory;
}

// ─── Available categories for bulk import ─────────────

export const OSM_BULK_CATEGORIES = [
  { key: "lake", label: "Lakes & Water Bodies", icon: "💧", estimated: 180 },
  { key: "peak", label: "Mountain Peaks & Summits", icon: "🏔️", estimated: 320 },
  { key: "temple", label: "Temples & Monasteries", icon: "🛕", estimated: 850 },
  { key: "waterfall", label: "Waterfalls", icon: "💦", estimated: 90 },
  { key: "nationalpark", label: "National Parks & Reserves", icon: "🌿", estimated: 20 },
  { key: "village", label: "Notable Villages", icon: "🏡", estimated: 400 },
  { key: "viewpoint", label: "Viewpoints", icon: "👁", estimated: 150 },
  { key: "heritage", label: "Heritage & Historic Sites", icon: "🏛️", estimated: 120 },
] as const;
