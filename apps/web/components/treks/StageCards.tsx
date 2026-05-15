"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TrekStage } from "@/types";
import { formatDuration } from "@/lib/utils/formatters";

export function StageCards({ stages }: { stages: TrekStage[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-2 mt-4">
      {stages.map((stage) => (
        <div
          key={stage.id}
          className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden cursor-pointer hover:border-white/15 transition-colors"
          onClick={() => setExpanded(expanded === stage.stageNumber ? null : stage.stageNumber)}
        >
          <div className="flex items-center gap-4 p-4">
            <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center text-brand-400 text-xs font-mono font-bold shrink-0">
              {stage.stageNumber}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm font-medium">{stage.name}</p>
              <p className="text-white/30 text-xs font-mono mt-0.5">
                {stage.startPoint} → {stage.endPoint}
              </p>
            </div>
            <div className="text-right shrink-0 space-y-0.5">
              {stage.durationHours && (
                <p className="text-white/50 text-xs font-mono">{formatDuration(stage.durationHours)}</p>
              )}
              {stage.distanceKm && (
                <p className="text-white/30 text-xs font-mono">{stage.distanceKm}km</p>
              )}
            </div>
            <motion.span
              animate={{ rotate: expanded === stage.stageNumber ? 180 : 0 }}
              className="text-white/20 text-sm shrink-0"
            >↓</motion.span>
          </div>

          <AnimatePresence initial={false}>
            {expanded === stage.stageNumber && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-0 space-y-3">
                  <div className="h-px bg-white/[0.06]" />
                  {stage.description && (
                    <p className="text-white/50 text-sm leading-relaxed">{stage.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs font-mono">
                    {stage.elevationGainM && (
                      <span className="text-brand-400">↑ +{stage.elevationGainM}m gain</span>
                    )}
                    {stage.maxElevationM && (
                      <span className="text-white/40">Max: {stage.maxElevationM.toLocaleString()}m</span>
                    )}
                    {stage.accommodation && (
                      <span className="text-white/40">🏨 {stage.accommodation}</span>
                    )}
                  </div>
                  {stage.mealsAvailable?.length > 0 && (
                    <p className="text-white/30 text-xs">
                      Meals: {stage.mealsAvailable.join(", ")}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
