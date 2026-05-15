// lib/utils/formatters.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TrekDifficulty, TransportType, AlertSeverity } from "@/types";

// ─── Tailwind class merge ─────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency ─────────────────────────────────────────

export function formatNPR(amount: number): string {
  return new Intl.NumberFormat("ne-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Elevation ────────────────────────────────────────

export function formatElevation(meters: number): string {
  return `${meters.toLocaleString()}m`;
}

export function metersToFeet(meters: number): number {
  return Math.round(meters * 3.28084);
}

// ─── Duration ─────────────────────────────────────────

export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours === Math.floor(hours)) return `${hours}h`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

// ─── Difficulty ───────────────────────────────────────

export const difficultyConfig: Record<
  TrekDifficulty,
  { label: string; color: string; bg: string; border: string }
> = {
  easy: {
    label: "Easy",
    color: "#52b788",
    bg: "rgba(82,183,136,0.1)",
    border: "rgba(82,183,136,0.25)",
  },
  moderate: {
    label: "Moderate",
    color: "#f4a261",
    bg: "rgba(244,162,97,0.1)",
    border: "rgba(244,162,97,0.25)",
  },
  strenuous: {
    label: "Strenuous",
    color: "#e76f51",
    bg: "rgba(231,111,81,0.1)",
    border: "rgba(231,111,81,0.25)",
  },
  extreme: {
    label: "Extreme",
    color: "#c1121f",
    bg: "rgba(193,18,31,0.1)",
    border: "rgba(193,18,31,0.25)",
  },
};

// ─── Transport Icons ──────────────────────────────────

export const transportIcons: Record<TransportType, string> = {
  flight: "✈️",
  bus: "🚌",
  jeep: "🚙",
  trek: "🥾",
  walk: "🚶",
  boat: "⛵",
  cable_car: "🚡",
};

export const transportLabels: Record<TransportType, string> = {
  flight: "Flight",
  bus: "Bus",
  jeep: "Jeep/4WD",
  trek: "Trekking",
  walk: "Walking",
  boat: "Boat",
  cable_car: "Cable Car",
};

// ─── Alert Severity ───────────────────────────────────

export const alertConfig: Record<
  AlertSeverity,
  { color: string; bg: string; border: string; icon: string }
> = {
  info: {
    color: "#90e0ef",
    bg: "rgba(144,224,239,0.08)",
    border: "rgba(144,224,239,0.2)",
    icon: "ℹ",
  },
  warning: {
    color: "#f4a261",
    bg: "rgba(244,162,97,0.08)",
    border: "rgba(244,162,97,0.2)",
    icon: "⚠",
  },
  critical: {
    color: "#e76f51",
    bg: "rgba(231,111,81,0.1)",
    border: "rgba(231,111,81,0.3)",
    icon: "🚨",
  },
};

// ─── Date / Season ────────────────────────────────────

export const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function getCurrentSeason(): string {
  const month = new Date().getMonth(); // 0-indexed
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer/Monsoon";
  if (month >= 8 && month <= 10) return "Autumn";
  return "Winter";
}

export function isBestSeason(bestSeasons: string[]): boolean {
  const current = getCurrentSeason();
  return bestSeasons.some((s) =>
    s.toLowerCase().includes(current.toLowerCase())
  );
}

// ─── Distance ─────────────────────────────────────────

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Truncate ─────────────────────────────────────────

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "…";
}

// ─── Slugify ──────────────────────────────────────────

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
