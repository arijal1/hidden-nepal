// lib/seo/metadata.ts

import type { Metadata } from "next";
import type { Destination, Trek } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hiddennepal.com";
const SITE_NAME = "Hidden Nepal";

// ─── Destination Page Metadata ────────────────────────

export function getDestinationMetadata(destination: Destination): Metadata {
  const title = destination.seoTitle ?? `${destination.name} — ${SITE_NAME}`;
  const description =
    destination.seoDescription ??
    `Discover ${destination.name} in ${destination.province}, Nepal. ${destination.tagline}. Travel tips, how to reach, best time to visit, and hidden gems.`;

  return {
    title,
    description,
    keywords: [
      destination.name,
      `${destination.name} Nepal`,
      `how to reach ${destination.name}`,
      `${destination.name} travel guide`,
      `${destination.province} Nepal`,
      ...(destination.tags ?? []),
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/destinations/${destination.slug}`,
      images: [
        {
          url: destination.coverImageUrl,
          width: 1200,
          height: 630,
          alt: `${destination.name}, Nepal`,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [destination.coverImageUrl],
    },
    alternates: {
      canonical: `${SITE_URL}/destinations/${destination.slug}`,
    },
  };
}

// ─── Trek Page Metadata ───────────────────────────────

export function getTrekMetadata(trek: Trek): Metadata {
  const title = `${trek.name} Trek Guide — Nepal | ${SITE_NAME}`;
  const description = `Complete guide to the ${trek.name} trek in Nepal. ${trek.durationDays}-day ${trek.difficulty} trek reaching ${trek.maxElevationM}m. Permits, itinerary, tips, and more.`;

  return {
    title,
    description,
    keywords: [
      trek.name,
      `${trek.name} trek`,
      `${trek.name} Nepal`,
      `Nepal trekking`,
      `${trek.difficulty} trek Nepal`,
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/treks/${trek.slug}`,
      images: [{ url: trek.coverImageUrl, width: 1200, height: 630 }],
      type: "article",
    },
    alternates: {
      canonical: `${SITE_URL}/treks/${trek.slug}`,
    },
  };
}
