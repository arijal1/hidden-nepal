import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export type AdventureType = "rafting" | "paragliding" | "bungee" | "mtb" | "heli" | "wildlife" | "climbing" | "kayaking" | "zipline" | "canyoning";

export interface Adventure {
  id: string;
  name: string;
  slug: string;
  type: AdventureType;
  locationName?: string;
  province?: string;
  coordinates?: { lat: number; lng: number };
  priceFrom?: number;
  priceTo?: number;
  currency: string;
  priceNote?: string;
  durationHours?: number;
  durationLabel?: string;
  difficulty?: "easy" | "moderate" | "challenging" | "extreme";
  bestSeason: string[];
  minAge?: number;
  groupSizeMin?: number;
  groupSizeMax?: number;
  operatorName?: string;
  operatorPhone?: string;
  operatorEmail?: string;
  affiliateUrl?: string;
  tagline?: string;
  description?: string;
  whatsIncluded: string[];
  whatsExcluded: string[];
  highlights: string[];
  whatToBring: string[];
  warnings: string[];
  coverImageUrl?: string;
  galleryUrls: string[];
  videoUrl?: string;
  isFeatured: boolean;
  isSignature: boolean;
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj === null || typeof obj !== "object") return obj;
  return Object.keys(obj).reduce((acc: any, k) => {
    const camelKey = k.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
    acc[camelKey] = snakeToCamel(obj[k]);
    return acc;
  }, {});
}

function parseCoords(geo: any): { lat: number; lng: number } | null {
  if (!geo) return null;
  if (typeof geo === "object" && geo.coordinates) {
    return { lng: geo.coordinates[0], lat: geo.coordinates[1] };
  }
  if (typeof geo === "string" && geo.length >= 50) {
    try {
      const hex = geo.slice(18);
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
      const view = new DataView(bytes.buffer);
      return { lng: view.getFloat64(0, true), lat: view.getFloat64(8, true) };
    } catch { return null; }
  }
  return null;
}

function normalize(row: any): Adventure {
  const camel = snakeToCamel(row);
  return { ...camel, coordinates: parseCoords(row.coordinates) ?? undefined };
}

export async function getAdventures(opts: {
  type?: string;
  province?: string;
  featured?: boolean;
  limit?: number;
} = {}): Promise<Adventure[]> {
  const supabase = await createClient();
  let q = supabase.from("adventures").select("*").eq("is_published", true);
  if (opts.type) q = q.eq("type", opts.type);
  if (opts.province) q = q.eq("province", opts.province);
  if (opts.featured) q = q.eq("is_featured", true);
  q = q.order("is_signature", { ascending: false }).order("name");
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error || !data) return [];
  return data.map(normalize);
}

export async function getAdventure(slug: string): Promise<Adventure | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("adventures")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error || !data) return null;
  return normalize(data);
}

export async function getFeaturedAdventures(limit = 6): Promise<Adventure[]> {
  return getAdventures({ featured: true, limit });
}

export async function getSignatureAdventures(): Promise<Adventure[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("adventures")
    .select("*")
    .eq("is_published", true)
    .eq("is_signature", true)
    .order("name");
  if (error || !data) return [];
  return data.map(normalize);
}

export interface CreateInquiryInput {
  adventureId?: string;
  destinationId?: string;
  inquiryType: "adventure" | "destination" | "itinerary" | "general" | "custom";
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  country?: string;
  preferredDate?: string;
  flexibleDates?: boolean;
  groupSize?: number;
  budgetUsd?: number;
  durationDays?: number;
  message?: string;
  source?: string;
  userAgent?: string;
  utmSource?: string;
  utmCampaign?: string;
}

export async function createInquiry(input: CreateInquiryInput) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("inquiries")
    .insert({
      adventure_id: input.adventureId ?? null,
      destination_id: input.destinationId ?? null,
      inquiry_type: input.inquiryType,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      whatsapp: input.whatsapp ?? null,
      country: input.country ?? null,
      preferred_date: input.preferredDate ?? null,
      flexible_dates: input.flexibleDates ?? false,
      group_size: input.groupSize ?? 1,
      budget_usd: input.budgetUsd ?? null,
      duration_days: input.durationDays ?? null,
      message: input.message ?? null,
      source: input.source ?? "web",
      user_agent: input.userAgent ?? null,
      utm_source: input.utmSource ?? null,
      utm_campaign: input.utmCampaign ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Bump inquiry count on adventure
  if (input.adventureId) {
    await admin.rpc("increment_inquiry_count", { adv_id: input.adventureId }).catch(() => {});
  }

  return data;
}

export async function getInquiries(opts: { status?: string; limit?: number } = {}) {
  const admin = createAdminClient();
  let q = admin
    .from("inquiries")
    .select("*, adventure:adventures(name, slug), destination:destinations(name, slug)")
    .order("created_at", { ascending: false });
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error || !data) return [];
  return data;
}
