// lib/content/wikipedia.ts
// Wikipedia & Wikimedia Commons API integration

export interface WikipediaArticle {
  title: string;
  extract: string;
  fullUrl: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  categories: string[];
  images: string[];
}

export interface WikipediaSearchResult {
  title: string;
  snippet: string;
  pageId: number;
}

const WIKI_API = "https://en.wikipedia.org/w/api.php";
const WIKIMEDIA_API = "https://commons.wikimedia.org/w/api.php";

// ─── Search Wikipedia ─────────────────────────────────

export async function searchWikipedia(
  query: string,
  limit = 5
): Promise<WikipediaSearchResult[]> {
  const params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: `${query} Nepal`,
    srlimit: String(limit),
    format: "json",
    origin: "*",
  });

  const res = await fetch(`${WIKI_API}?${params}`);
  const data = await res.json();

  return (data.query?.search ?? []).map((r: any) => ({
    title: r.title,
    snippet: r.snippet.replace(/<[^>]*>/g, ""), // strip HTML
    pageId: r.pageid,
  }));
}

// ─── Get full article ─────────────────────────────────

export async function getWikipediaArticle(
  title: string
): Promise<WikipediaArticle | null> {
  const params = new URLSearchParams({
    action: "query",
    titles: title,
    prop: "extracts|pageimages|coordinates|categories|images",
    exintro: "true",        // only intro section
    explaintext: "true",    // plain text, no HTML
    exsentences: "8",       // first 8 sentences
    piprop: "thumbnail",
    pithumbsize: "800",
    clshow: "!hidden",
    imlimit: "10",
    format: "json",
    origin: "*",
  });

  const res = await fetch(`${WIKI_API}?${params}`);
  const data = await res.json();

  const pages = data.query?.pages;
  if (!pages) return null;

  const page = Object.values(pages)[0] as any;
  if (page.missing) return null;

  return {
    title: page.title,
    extract: cleanExtract(page.extract ?? ""),
    fullUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
    thumbnail: page.thumbnail
      ? {
          source: page.thumbnail.source,
          width: page.thumbnail.width,
          height: page.thumbnail.height,
        }
      : undefined,
    coordinates: page.coordinates?.[0]
      ? {
          lat: page.coordinates[0].lat,
          lng: page.coordinates[0].lon,
        }
      : undefined,
    categories: (page.categories ?? []).map((c: any) =>
      c.title.replace("Category:", "")
    ),
    images: (page.images ?? [])
      .map((i: any) => i.title)
      .filter((t: string) => /\.(jpg|jpeg|png|webp)/i.test(t)),
  };
}

// ─── Get Wikimedia Commons image URL ──────────────────

export async function getWikimediaImageUrl(
  filename: string
): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    titles: filename,
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "1200",
    format: "json",
    origin: "*",
  });

  try {
    const res = await fetch(`${WIKIMEDIA_API}?${params}`);
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0] as any;
    return page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

// ─── Get multiple CC images for a location ────────────

export async function getWikimediaImages(
  locationName: string,
  limit = 5
): Promise<string[]> {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrnamespace: "6", // File namespace
    gsrsearch: `${locationName} Nepal`,
    gsrlimit: String(limit * 2), // fetch more, filter below
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "1200",
    format: "json",
    origin: "*",
  });

  try {
    const res = await fetch(`${WIKIMEDIA_API}?${params}`);
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return [];

    const urls: string[] = [];
    for (const page of Object.values(pages) as any[]) {
      const info = page.imageinfo?.[0];
      if (!info) continue;

      // Only include freely licensed images
      const license = info.extmetadata?.LicenseShortName?.value ?? "";
      const isCC = license.startsWith("CC") || license.includes("Public domain");
      if (!isCC) continue;

      const url = info.thumburl ?? info.url;
      if (url && /\.(jpg|jpeg|png|webp)/i.test(url)) {
        urls.push(url);
        if (urls.length >= limit) break;
      }
    }
    return urls;
  } catch {
    return [];
  }
}

// ─── Get Wikidata entity ──────────────────────────────

export interface WikidataLocation {
  wikidataId: string;
  elevationM?: number;
  areaKm2?: number;
  population?: number;
  inception?: string;
  isUNESCO: boolean;
  isNationalPark: boolean;
  officialWebsite?: string;
  facebookPage?: string;
}

export async function getWikidataForLocation(
  wikipediaTitle: string
): Promise<WikidataLocation | null> {
  // First get the Wikidata entity ID from Wikipedia title
  const titleParams = new URLSearchParams({
    action: "query",
    titles: wikipediaTitle,
    prop: "pageprops",
    ppprop: "wikibase_item",
    format: "json",
    origin: "*",
  });

  const titleRes = await fetch(`${WIKI_API}?${titleParams}`);
  const titleData = await titleRes.json();
  const pages = titleData.query?.pages;
  if (!pages) return null;

  const page = Object.values(pages)[0] as any;
  const wikidataId = page.pageprops?.wikibase_item;
  if (!wikidataId) return null;

  // Fetch Wikidata entity
  const wdParams = new URLSearchParams({
    action: "wbgetentities",
    ids: wikidataId,
    props: "claims",
    format: "json",
    origin: "*",
  });

  const wdRes = await fetch(`https://www.wikidata.org/w/api.php?${wdParams}`);
  const wdData = await wdRes.json();
  const entity = wdData.entities?.[wikidataId];
  if (!entity) return null;

  const claims = entity.claims ?? {};

  const getNumericClaim = (property: string): number | undefined => {
    const claim = claims[property]?.[0];
    const amount = claim?.mainsnak?.datavalue?.value?.amount;
    return amount ? Math.abs(parseFloat(amount)) : undefined;
  };

  const getStringClaim = (property: string): string | undefined => {
    return claims[property]?.[0]?.mainsnak?.datavalue?.value;
  };

  // P18 = image, P625 = coordinate, P2044 = elevation, P2046 = area
  // P571 = inception, P856 = official website
  const isUNESCO = !!(claims.P1435 || claims.P17 || claims.P18); // rough check
  const isNationalPark = !!(claims.P31?.some((c: any) =>
    c.mainsnak?.datavalue?.value?.id === "Q46169" // national park
  ));

  return {
    wikidataId,
    elevationM: getNumericClaim("P2044"),
    areaKm2: getNumericClaim("P2046"),
    population: getNumericClaim("P1082"),
    officialWebsite: getStringClaim("P856"),
    isUNESCO,
    isNationalPark,
  };
}

// ─── Helpers ──────────────────────────────────────────

function cleanExtract(text: string): string {
  return text
    .replace(/\n{3,}/g, "\n\n")   // collapse excess newlines
    .replace(/\(listen\)/g, "")
    .replace(/\[.*?\]/g, "")       // remove [citation] markers
    .replace(/={2,}.*?={2,}/g, "") // remove section headers
    .trim()
    .slice(0, 1500);               // cap at 1500 chars
}
