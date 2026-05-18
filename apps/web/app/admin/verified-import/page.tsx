"use client";

import { useState } from "react";

type VerifiedLocation = {
  name: string;
  nameNepali?: string;
  coordinates: { lat: number; lng: number };
  elevation?: number;
  province?: string;
  category?: string;
  sources: any;
  trustScore: number;
  trustReasons: string[];
  warnings: string[];
  inNepal: boolean;
};

const CATEGORIES = ["lake", "temple", "village", "city", "viewpoint", "peak", "waterfall", "heritage", "nationalpark"];

export default function VerifiedImportPage() {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VerifiedLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("viewpoint");
  const [publish, setPublish] = useState(false);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/verify-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", query: query.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResult(data.location);
      if (data.location.category) {
        const matched = CATEGORIES.find(c => data.location.category?.toLowerCase().includes(c));
        if (matched) setCategory(matched);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function doImport() {
    if (!result || !result.inNepal) return;
    setImporting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/verify-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", verifiedData: result, publish, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setSuccess(`✓ Imported as /${data.slug} with trust score ${data.trustScore}`);
      setResult(null);
      setQuery("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setImporting(false);
    }
  }

  const scoreColor = result ? (result.trustScore >= 70 ? "text-emerald-400" : result.trustScore >= 50 ? "text-yellow-400" : "text-red-400") : "";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-display-md text-white mb-2">Verified Import</h1>
        <p className="text-white/40 text-sm">Search a destination — we cross-check OpenStreetMap + Wikipedia + Wikidata for accuracy before importing.</p>
      </div>

      <form onSubmit={verify} className="bg-base-900 border border-white/[0.08] rounded-2xl p-6 mb-6">
        <label className="text-white/60 text-xs font-mono uppercase tracking-widest mb-2 block">Search</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Rara Lake, Janakpurdham, Phewa Lake, Pashupatinath…"
            className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-md px-4 py-3 text-white focus:border-brand-500 outline-none"
            disabled={busy}
          />
          <button type="submit" disabled={busy || !query.trim()} className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50">
            {busy ? "Verifying…" : "Verify"}
          </button>
        </div>
      </form>

      {error && <div className="bg-red-400/10 border border-red-400/30 rounded-md p-4 text-red-400 text-sm mb-6">{error}</div>}
      {success && <div className="bg-emerald-400/10 border border-emerald-400/30 rounded-md p-4 text-emerald-400 text-sm mb-6">{success}</div>}

      {result && (
        <div className="bg-base-900 border border-white/[0.08] rounded-2xl p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              {result.sources.wikipedia?.thumbnail && (
                <img src={result.sources.wikipedia.thumbnail} alt="" className="w-24 h-24 rounded-lg object-cover" />
              )}
              <div>
                <h2 className="text-white font-display text-2xl">{result.name}</h2>
                {result.nameNepali && <p className="text-white/55 text-sm mt-1">{result.nameNepali}</p>}
                <p className="text-white/40 text-xs font-mono mt-2">
                  {result.coordinates.lat.toFixed(4)}, {result.coordinates.lng.toFixed(4)}
                  {result.elevation ? ` · ${result.elevation}m` : ""}
                  {result.province ? ` · ${result.province}` : ""}
                </p>
              </div>
            </div>
            <div className={`text-center px-4 py-3 rounded-lg border ${result.trustScore >= 70 ? "border-emerald-400/40 bg-emerald-400/5" : result.trustScore >= 50 ? "border-yellow-400/40 bg-yellow-400/5" : "border-red-400/40 bg-red-400/5"}`}>
              <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest">Trust</p>
              <p className={`font-display text-3xl ${scoreColor}`}>{result.trustScore}</p>
              <p className="text-white/40 text-[10px]">/ 100</p>
            </div>
          </div>

          {!result.inNepal && (
            <div className="bg-red-400/10 border border-red-400/30 rounded-md p-4">
              <p className="text-red-400 font-medium">Location outside Nepal — import blocked</p>
            </div>
          )}

          {/* Cross-source agreement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SourceCard label="OpenStreetMap" data={result.sources.nominatim} type="nominatim" />
            <SourceCard label="Wikipedia" data={result.sources.wikipedia} type="wikipedia" />
            <SourceCard label="Wikidata" data={result.sources.wikidata} type="wikidata" />
          </div>

          {/* Trust reasons */}
          {result.trustReasons.length > 0 && (
            <div>
              <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-2">Verification</p>
              <ul className="space-y-1">
                {result.trustReasons.map((r, i) => <li key={i} className="text-emerald-400 text-sm">{r}</li>)}
              </ul>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div>
              <p className="text-yellow-400 text-xs font-mono uppercase tracking-widest mb-2">Warnings</p>
              <ul className="space-y-1">
                {result.warnings.map((w, i) => <li key={i} className="text-yellow-400 text-sm">{w}</li>)}
              </ul>
            </div>
          )}

          {/* Wikipedia preview */}
          {result.sources.wikipedia?.extract && (
            <div>
              <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-2">Wikipedia preview</p>
              <p className="text-white/70 text-sm leading-relaxed line-clamp-4">{result.sources.wikipedia.extract}</p>
            </div>
          )}

          {/* Import action */}
          {result.inNepal && (
            <div className="pt-4 border-t border-white/[0.06] flex items-center gap-4 flex-wrap">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-white/[0.04] border border-white/[0.1] rounded px-3 py-2 text-white text-sm focus:border-brand-500 outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="flex items-center gap-2 text-white/70 text-sm cursor-pointer">
                <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="accent-brand-500" />
                Publish immediately
              </label>
              <button onClick={doImport} disabled={importing || result.trustScore < 30} className="ml-auto bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50">
                {importing ? "Importing…" : `Import (score ${result.trustScore})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SourceCard({ label, data, type }: { label: string; data: any; type: string }) {
  const hit = !!data;
  return (
    <div className={`rounded-lg border p-3 ${hit ? "border-emerald-400/30 bg-emerald-400/[0.04]" : "border-white/[0.08] bg-white/[0.02]"}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={hit ? "text-emerald-400" : "text-white/30"}>{hit ? "✓" : "—"}</span>
        <p className="text-white text-sm font-medium">{label}</p>
      </div>
      {hit && type === "nominatim" && <p className="text-white/55 text-xs font-mono">{data.lat.toFixed(4)}, {data.lng.toFixed(4)} · {data.type}</p>}
      {hit && type === "wikipedia" && <a href={data.url} target="_blank" className="text-brand-400 text-xs hover:underline">{data.title} ↗</a>}
      {hit && type === "wikidata" && data.id && <p className="text-white/55 text-xs font-mono">{data.id}</p>}
      {!hit && <p className="text-white/30 text-xs">No match</p>}
    </div>
  );
}
