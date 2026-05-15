import type { Metadata } from "next";
import { NearbyClient } from "@/components/map/NearbyClient";

export const metadata: Metadata = {
  title: "Destinations Near Me — Nepal",
  description: "Find Nepal destinations near your current location using GPS.",
};

export default function NearbyPage() {
  return (
    <div className="min-h-screen bg-base-950 pb-24">
      <section className="pt-12 pb-8 px-5 border-b border-white/[0.06]">
        <div className="container max-w-[1200px] mx-auto">
          <p className="section-label mb-3">◈ Near Me</p>
          <h1 className="text-display-lg text-white mb-3">
            Destinations near you
          </h1>
          <p className="text-white/40 text-sm max-w-md">
            We'll use your GPS location to find Nepal destinations, treks, and hidden gems within your reach.
          </p>
        </div>
      </section>
      <div className="container max-w-[1200px] mx-auto px-5 py-10">
        <NearbyClient />
      </div>
    </div>
  );
}
