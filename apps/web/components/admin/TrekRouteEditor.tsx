"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE = [
  { name: "Start", lng: 85.0, lat: 28.0, elevation: 1500, day: 1, note: "Trailhead" },
  { name: "Camp 1", lng: 85.1, lat: 28.1, elevation: 2500, day: 2 },
];

export function TrekRouteEditor({ trekId, slug, initialWaypoints }: { trekId: string; slug: string; initialWaypoints: any[] }) {
  const router = useRouter();
  const [json, setJson] = useState(JSON.stringify(initialWaypoints.length > 0 ? initialWaypoints : EXAMPLE, null, 2));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    setErr(null);
    let waypoints: any[];
    try {
      waypoints = JSON.parse(json);
      if (!Array.isArray(waypoints)) throw new Error("Must be an array");
    } catch (e: any) {
      setErr("Invalid JSON: " + e.message);
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`/api/admin/treks/${trekId}/route-waypoints`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waypoints }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setMsg(`✓ Saved ${data.count} waypoints`);
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function clearRoute() {
    if (!confirm("Clear DB route? Will fall back to hardcoded if available.")) return;
    setJson("[]");
    setTimeout(save, 100);
  }

  return (
    <div className="space-y-3">
      <div className="text-white/50 text-xs">
        <p>Paste an array of waypoints. Required: <code className="text-brand-400">name, lng, lat, elevation</code>. Optional: <code className="text-brand-400">day, note</code>.</p>
      </div>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        className="w-full bg-base-950 border border-white/[0.1] rounded-md p-3 text-white text-xs font-mono focus:border-brand-500 outline-none min-h-[280px]"
      />
      <div className="flex gap-2 items-center flex-wrap">
        <button onClick={save} disabled={saving} className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
          {saving ? "Saving…" : "Save route"}
        </button>
        <button onClick={clearRoute} disabled={saving} className="border border-red-400/30 text-red-400 hover:bg-red-400/10 px-4 py-2 rounded text-sm">
          Clear DB route
        </button>
        {msg && <span className="text-emerald-400 text-sm">{msg}</span>}
        {err && <span className="text-red-400 text-sm">{err}</span>}
      </div>
    </div>
  );
}
