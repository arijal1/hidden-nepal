// components/destinations/HowToReach.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TransportRoute } from "@/types";
import {
  transportIcons,
  transportLabels,
  formatDuration,
  formatNPR,
} from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/formatters";

const roadConditionBadge: Record<string, { label: string; color: string }> = {
  excellent: { label: "Excellent", color: "text-brand-400" },
  good: { label: "Good", color: "text-brand-400" },
  fair: { label: "Fair", color: "text-gold-400" },
  poor: { label: "Poor", color: "text-gold-500" },
  seasonal_only: { label: "Seasonal", color: "text-gold-500" },
};

export function HowToReach({ routes }: { routes: TransportRoute[] }) {
  const [expanded, setExpanded] = useState<string | null>(
    routes.find((r) => r.isRecommended)?.id ?? routes[0]?.id ?? null
  );

  if (!routes || routes.length === 0) {
    return (
      <p className="text-white/30 text-sm py-8 text-center">
        Transport information coming soon.
      </p>
    );
  }

  const recommended = routes.filter((r) => r.isRecommended);
  const other = routes.filter((r) => !r.isRecommended);
  const sorted = [...recommended, ...other];

  return (
    <div className="space-y-3">
      {sorted.map((route) => (
        <RouteCard
          key={route.id}
          route={route}
          isExpanded={expanded === route.id}
          onToggle={() =>
            setExpanded((prev) => (prev === route.id ? null : route.id))
          }
        />
      ))}

      {/* Emergency Note */}
      <div className="mt-6 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <p className="text-white/30 text-xs font-mono tracking-wider uppercase mb-1">
          📞 Emergency
        </p>
        <p className="text-white/50 text-sm">
          Nepal Police: <strong className="text-white/70">100</strong> ·
          Tourist Police: <strong className="text-white/70">+977-1-4247041</strong> ·
          Ambulance: <strong className="text-white/70">102</strong>
        </p>
      </div>
    </div>
  );
}

function RouteCard({
  route,
  isExpanded,
  onToggle,
}: {
  route: TransportRoute;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const icon = transportIcons[route.transportType] ?? "🚗";
  const label = transportLabels[route.transportType] ?? route.transportType;
  const condition = route.roadCondition
    ? roadConditionBadge[route.roadCondition]
    : null;

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer",
        isExpanded
          ? "border-brand-500/30 bg-brand-500/[0.04]"
          : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]"
      )}
      onClick={onToggle}
    >
      {/* Header row */}
      <div className="flex items-center gap-4 p-5">
        {/* Transport icon */}
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/80 text-sm font-medium">{label}</span>
            {route.isRecommended && (
              <span className="text-[10px] font-mono text-brand-400 border border-brand-500/30 rounded-full px-2 py-0.5 tracking-wider uppercase">
                Recommended
              </span>
            )}
          </div>
          <p className="text-white/40 text-xs font-mono mt-0.5 tracking-wide">
            From {route.fromLocation}
          </p>
        </div>

        {/* Duration + cost */}
        <div className="text-right shrink-0">
          {route.durationHours && (
            <p className="text-white/70 text-sm font-mono">
              {formatDuration(route.durationHours)}
            </p>
          )}
          {route.costMinNpr && route.costMaxNpr && (
            <p className="text-white/30 text-xs mt-0.5">
              {formatNPR(route.costMinNpr)} – {formatNPR(route.costMaxNpr)}
            </p>
          )}
        </div>

        {/* Expand arrow */}
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-white/25 text-sm shrink-0"
        >
          ↓
        </motion.span>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 space-y-4">
              <div className="h-px bg-white/[0.06]" />

              {/* Description */}
              <p className="text-white/55 text-sm leading-relaxed">
                {route.description}
              </p>

              {/* Road condition */}
              {condition && (
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-xs font-mono tracking-wider uppercase">
                    Road condition:
                  </span>
                  <span className={`text-xs font-semibold ${condition.color}`}>
                    {condition.label}
                  </span>
                </div>
              )}

              {/* Notes */}
              {route.notes && (
                <div className="p-3 rounded-xl bg-gold-500/[0.06] border border-gold-500/15">
                  <p className="text-gold-400/80 text-xs leading-relaxed">
                    💡 {route.notes}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
