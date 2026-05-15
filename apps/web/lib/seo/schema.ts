// lib/seo/schema.ts
// JSON-LD structured data generators for SEO

import type { Destination, Trek, Review } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hiddennepal.com";

// ─── Tourist Attraction ───────────────────────────────

export function destinationSchema(destination: Destination) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: destination.name,
    description: destination.description,
    url: `${SITE_URL}/destinations/${destination.slug}`,
    image: destination.galleryUrls?.[0] ?? destination.coverImageUrl,
    geo: {
      "@type": "GeoCoordinates",
      latitude: destination.coordinates.lat,
      longitude: destination.coordinates.lng,
    },
    address: {
      "@type": "PostalAddress",
      addressRegion: destination.province,
      addressCountry: "NP",
    },
    ...(destination.avgRating && destination.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: destination.avgRating,
            reviewCount: destination.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    touristType: "Adventure travelers, Backpackers, Trekkers",
  };
}

// ─── Trekking Route ───────────────────────────────────

export function trekSchema(trek: Trek) {
  return {
    "@context": "https://schema.org",
    "@type": "ExerciseAction",
    name: trek.name,
    description: trek.description,
    url: `${SITE_URL}/treks/${trek.slug}`,
    image: trek.coverImageUrl,
    distance: {
      "@type": "QuantitativeValue",
      value: trek.distanceKm,
      unitCode: "KMT",
    },
    exerciseType: "Hiking",
    location: {
      "@type": "Place",
      name: trek.startPoint,
      address: { "@type": "PostalAddress", addressCountry: "NP" },
    },
  };
}

// ─── Breadcrumb ───────────────────────────────────────

export function breadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── FAQ ──────────────────────────────────────────────

export function faqSchema(
  items: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

// ─── Website ──────────────────────────────────────────

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Hidden Nepal",
    url: SITE_URL,
    description: "The ultimate digital companion for exploring Nepal.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
