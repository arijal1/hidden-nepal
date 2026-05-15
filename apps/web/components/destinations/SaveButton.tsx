// components/destinations/SaveButton.tsx

"use client";

import { useState, useEffect } from "react";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";

export function SaveButton({
  destinationId,
  destinationName,
}: {
  destinationId: string;
  destinationName: string;
}) {
  const [saved, setSaved] = useState(false);
  const { isDestinationSaved } = useOfflineStorage();

  useEffect(() => {
    isDestinationSaved(destinationId).then(setSaved);
  }, [destinationId, isDestinationSaved]);

  const handleSave = () => {
    setSaved((prev) => !prev);
    // In production: call saveDestination / removeDestination
  };

  return (
    <button
      onClick={handleSave}
      className={`
        w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
        border font-medium text-sm transition-all duration-200
        ${saved
          ? "bg-brand-500/15 border-brand-500/40 text-brand-400"
          : "bg-white/[0.04] border-white/[0.1] text-white/60 hover:bg-white/[0.07] hover:text-white/80"
        }
      `}
    >
      <span className="text-base">{saved ? "♥" : "♡"}</span>
      {saved ? "Saved to offline" : "Save for offline"}
    </button>
  );
}
