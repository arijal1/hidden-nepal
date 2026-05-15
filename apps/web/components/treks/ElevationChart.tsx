"use client";

// components/treks/ElevationChart.tsx
import { useRef, useEffect } from "react";
import type { ElevationPoint } from "@/types";

interface ElevationChartProps {
  profile: ElevationPoint[];
}

export function ElevationChart({ profile }: ElevationChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !profile.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const pad = { top: 20, right: 20, bottom: 40, left: 55 };
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;

    const maxDist = Math.max(...profile.map(p => p.distanceKm));
    const minElev = Math.min(...profile.map(p => p.elevationM)) * 0.95;
    const maxElev = Math.max(...profile.map(p => p.elevationM)) * 1.02;

    const xScale = (d: number) => pad.left + (d / maxDist) * chartW;
    const yScale = (e: number) => pad.top + chartH - ((e - minElev) / (maxElev - minElev)) * chartH;

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    grad.addColorStop(0, "rgba(45,106,79,0.35)");
    grad.addColorStop(1, "rgba(45,106,79,0.02)");

    // Draw area
    ctx.beginPath();
    ctx.moveTo(xScale(profile[0].distanceKm), yScale(profile[0].elevationM));
    profile.forEach(p => ctx.lineTo(xScale(p.distanceKm), yScale(p.elevationM)));
    ctx.lineTo(xScale(profile[profile.length - 1].distanceKm), pad.top + chartH);
    ctx.lineTo(xScale(profile[0].distanceKm), pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(xScale(profile[0].distanceKm), yScale(profile[0].elevationM));
    profile.forEach(p => ctx.lineTo(xScale(p.distanceKm), yScale(p.elevationM)));
    ctx.strokeStyle = "#52b788";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.font = "10px 'DM Mono', monospace";
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.textAlign = "right";

    // Y axis labels
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const e = minElev + ((maxElev - minElev) * i) / yTicks;
      const y = yScale(e);
      ctx.fillText(`${Math.round(e / 100) * 100}m`, pad.left - 6, y + 3);
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
    }

    // Labeled points
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.textAlign = "center";
    profile.filter(p => p.label).forEach(p => {
      const x = xScale(p.distanceKm);
      const y = yScale(p.elevationM);
      // Dot
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#f4a261";
      ctx.fill();
      // Label
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "9px 'DM Mono', monospace";
      ctx.fillText(p.label!, x, y - 10);
    });
  }, [profile]);

  return (
    <div className="mt-4 glass-card p-4 rounded-2xl">
      <canvas ref={canvasRef} className="w-full" style={{ height: 200 }} />
    </div>
  );
}
