import { Suspense } from "react";
import type { Metadata } from "next";
import { websiteSchema } from "@/lib/seo/schema";
import { getDestinations, getHiddenGems } from "@/lib/supabase/queries/destinations";
import { getTreks } from "@/lib/supabase/queries/treks";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsBanner } from "@/components/home/StatsBanner";
import { DestinationsGrid } from "@/components/home/DestinationsGrid";
import { GemsSection } from "@/components/home/GemsSection";
import { TrekkingSection } from "@/components/home/TrekkingSection";
import { LivingCulture } from "@/components/home/LivingCulture";
import {
  PlannerTeaser,
  SafetyBanner,
  HomeCTA,
} from "@/components/home/PlannerTeaser";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Hidden Nepal — Discover Nepal's Best-Kept Secrets",
  description: "AI-powered travel companion for Nepal. Hidden gems, trekking routes, itinerary planning.",
};

export default async function HomePage() {
  // Fetch real data in parallel
  const [destResp, gems, treks, totalTreksResp] = await Promise.all([
    getDestinations({}, 1, 6),
    getHiddenGems(6),
    getTreks(undefined, 6),
    getTreks(undefined, 1000),
  ]);
  const destinations = destResp.data;
  const destinationCount = destResp.total ?? destResp.data.length;
  const trekCount = totalTreksResp.length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
      />
      <main className="bg-base-950">
        <HeroSection destinationCount={destinationCount} trekCount={trekCount} />
        <StatsBanner />
        <DestinationsGrid destinations={destinations} />
        <GemsSection gems={gems} />
        <TrekkingSection treks={treks} />
        <PlannerTeaser />
        <LivingCulture />
        <Suspense fallback={null}>
          <SafetyBanner />
        </Suspense>
        <HomeCTA />
      </main>
    </>
  );
}
