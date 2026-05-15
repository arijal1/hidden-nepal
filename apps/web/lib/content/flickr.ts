// lib/content/flickr.ts
// Flickr API — Creative Commons licensed photos for Nepal locations

const FLICKR_API = "https://www.flickr.com/services/rest/";

// CC license IDs that allow reuse
// 1=BY-NC-SA, 2=BY-NC, 3=BY-NC-ND, 4=BY, 5=BY-SA, 6=BY-ND, 9=CC0
const FREE_LICENSES = "1,2,4,5,9"; // All Creative Commons

export interface FlickrPhoto {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  license: string;
  ownerName: string;
  attribution: string;
  tags: string[];
}

export async function searchFlickrPhotos(
  locationName: string,
  limit = 6
): Promise<FlickrPhoto[]> {
  const apiKey = process.env.FLICKR_API_KEY;

  // Without API key, fall back to Wikimedia Commons
  if (!apiKey) {
    console.warn("[flickr] No API key — using Wikimedia Commons");
    return [];
  }

  const params = new URLSearchParams({
    method: "flickr.photos.search",
    api_key: apiKey,
    text: `${locationName} Nepal`,
    license: FREE_LICENSES,
    sort: "relevance",
    content_type: "1", // photos only
    media: "photos",
    per_page: String(limit * 2), // overfetch to filter
    page: "1",
    extras: "url_l,url_m,owner_name,license,tags,description",
    format: "json",
    nojsoncallback: "1",
    safe_search: "1",
    // Bias toward Nepal coordinates
    bbox: "80.0,26.3,88.2,30.5",
  });

  try {
    const res = await fetch(`${FLICKR_API}?${params}`);
    const data = await res.json();

    const photos = data.photos?.photo ?? [];

    return photos
      .filter((p: any) => p.url_l || p.url_m) // must have usable URL
      .slice(0, limit)
      .map((p: any): FlickrPhoto => ({
        id: p.id,
        title: p.title,
        url: p.url_l ?? p.url_m,
        thumbnailUrl: p.url_m ?? p.url_l,
        width: parseInt(p.width_l ?? p.width_m ?? "800"),
        height: parseInt(p.height_l ?? p.height_m ?? "600"),
        license: getLicenseName(p.license),
        ownerName: p.ownername,
        attribution: `Photo by ${p.ownername} on Flickr (${getLicenseName(p.license)})`,
        tags: (p.tags ?? "").split(" ").filter(Boolean),
      }));
  } catch (err) {
    console.error("[flickr search]", err);
    return [];
  }
}

function getLicenseName(licenseId: string): string {
  const licenses: Record<string, string> = {
    "0": "All Rights Reserved",
    "1": "CC BY-NC-SA 2.0",
    "2": "CC BY-NC 2.0",
    "3": "CC BY-NC-ND 2.0",
    "4": "CC BY 2.0",
    "5": "CC BY-SA 2.0",
    "6": "CC BY-ND 2.0",
    "9": "CC0 1.0",
    "10": "Public Domain",
  };
  return licenses[licenseId] ?? "CC";
}
