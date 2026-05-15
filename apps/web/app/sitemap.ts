// app/sitemap.ts

import type { MetadataRoute } from "next";
import { getAllDestinationSlugs } from "@/lib/supabase/queries/destinations";
import { getAllTrekSlugs } from "@/lib/supabase/queries/treks";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hiddennepal.com";

export const revalidate = 86400; // 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [destinationSlugs, trekSlugs] = await Promise.all([
    getAllDestinationSlugs(),
    getAllTrekSlugs(),
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/destinations`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/treks`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/hidden-gems`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/plan`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Destination pages — high priority for SEO
  const destinationPages: MetadataRoute.Sitemap = destinationSlugs.map(
    (slug) => ({
      url: `${SITE_URL}/destinations/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })
  );

  // Trek pages
  const trekPages: MetadataRoute.Sitemap = trekSlugs.map((slug) => ({
    url: `${SITE_URL}/treks/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...destinationPages, ...trekPages];
}
