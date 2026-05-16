// components/destinations/SaveButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";

export function SaveButton({
  destination,
}: {
  destination: any;
}) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const { isDestinationSaved, saveDestination, removeDestination } = useOfflineStorage();

  useEffect(() => {
    isDestinationSaved(destination.id).then(setSaved);
  }, [destination.id, isDestinationSaved]);

  const handleSave = async () => {
    setBusy(true);
    try {
      if (saved) {
        const ok = await removeDestination(destination.id);
        if (ok) {
          setSaved(false);
          // removed
        } else // remove failed
      } else {
        const ok = await saveDestination(destination);
        if (ok) {
          setSaved(true);
          // saved
        } else // save failed
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={busy}
      className={`
        w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
        border font-medium text-sm transition-all duration-200 disabled:opacity-50
        ${saved
          ? "bg-brand-500/15 border-brand-500/40 text-brand-400"
          : "bg-white/[0.04] border-white/[0.1] text-white/60 hover:bg-white/[0.07] hover:text-white/80"
        }
      `}
    >
      <span className="text-base">{saved ? "♥" : "♡"}</span>
      {saved ? "Saved for offline" : "Save for offline"}
    </button>
  );
}
