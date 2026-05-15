"use client";

import { useRouter } from "next/navigation";
import { LocationFinder } from "@/components/map/LocationFinder";

export function LocationFinderWrapper() {
  const router = useRouter();

  return (
    <LocationFinder
      onImported={(slug) => {
        // Refresh the page to update stats and recent imports
        router.refresh();
      }}
    />
  );
}
