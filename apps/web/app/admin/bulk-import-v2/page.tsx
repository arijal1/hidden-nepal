// app/admin/bulk-import-v2/page.tsx
"use client";

import { useState } from "react";

type Candidate = {
  osmId: number;
  name: string;
  nameNepali?: string;
  lat: number;
  lng: number;
  category: string;
  province: string;
  elevation?: number;
  tags: Record<string, string>;
  wikipediaTitle?: string;
  wikiSummary?: string;
  imageUrl?: string;
  galleryUrls: string[];
  score: number;
  reasons: string[];
  alreadyExists: boolean;
};

const CATEGORIES = [
  { value: "lake", label: "Lakes" },
  { value: "temple", label: "Temples" },
  { value: "viewpoint", label: "Viewpoints" },
  { value: "peak", label: "Peaks" },
  { value: "waterfall", label: "Waterfalls" },
  { value: "park", label: "National Parks" },
  { value: "village", label: "Villages" },
  { value: "city", label: "Cities" },
  { value: "heritage", label: "Heritage Sites" },
];

export default function BulkImportV2Page() {
  const [step, setStep] = useState<"discover" | "review" | "importing">("discover");
  const [category, setCategory] = useState("lake");
  const [minScore, setMinScore] = useState(40);
  const [maxResults, setMaxResults] = useState(25);
  const [publish, setPublish] = useState(false);
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  async function handleDiscover() {
    setBusy(true);
    setCandidates([]);
    setSelected(new Set());
    setLogs([]);
    setStep("discover");

    try {
      const res = await fetch("/api/admin/bulk-import-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "discover", category, minScore, maxResults }),
      });
      if (!res.body) throw new Error("No response");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      const found: Candidate[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split("\n\n");
        buf = events.pop() ?? "";
        for (const e of events) {
          if (!e.startsWith("data: ")) continue;
          const data = JSON.parse(e.slice(6));
          if (data.type === "candidate") {
            found.push(data.candidate);
            setCandidates([...found]);
          } else if (data.type === "progress" || data.type === "start") {
            setLogs((l) => [...l, data.message]);
          } else if (data.type === "done") {
            setLogs((l) => [...l, "✓ " + data.message]);
            setStep("review");
          } else if (data.type === "fatal") {
            setLogs((l) => [...l, "✗ " + data.error]);
          }
        }
      }
    } catch (err: any) {
      setLogs((l) => [...l, "Error: " + err.message]);
    } finally {
      setBusy(false);
    }
  }

  async function handleImportSelected() {
    if (selected.size === 0) {
      alert("Select at least one to import");
      return;
    }
    const toImport = candidates.filter((c) => selected.has(c.osmId));
    setBusy(true);
    setStep("importing");
    setLogs([]);

    try {
      const res = await fetch("/api/admin/bulk-import-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", candidates: toImport, publish }),
      });
      if (!res.body) throw new Error("No response");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split("\n\n");
        buf = events.pop() ?? "";
        for (const e of events) {
          if (!e.startsWith("data: ")) continue;
          const data = JSON.parse(e.slice(6));
          if (data.type === "success") setLogs((l) => [...l, `✓ ${data.name} → /${data.slug}`]);
          else if (data.type === "fail") setLogs((l) => [...l, `✗ ${data.name}: ${data.error}`]);
          else if (data.type === "progress" || data.type === "start") setLogs((l) => [...l, data.message]);
          else if (data.type === "done") setLogs((l) => [...l, "✓ " + data.message]);
          else if (data.type === "fatal") setLogs((l) => [...l, "✗ " + data.error]);
        }
      }
    } catch (err: any) {
      setLogs((l) => [...l, "Error: " + err.message]);
    } finally {
      setBusy(false);
    }
  }

  function toggle(osmId: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(osmId)) next.delete(osmId);
      else next.add(osmId);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(candidates.filter((c) => !c.alreadyExists).map((c) => c.osmId)));
  }
  function selectNone() {
    setSelected(new Set());
  }
  function selectHighQuality() {
    setSelected(new Set(candidates.filter((c) => c.score >= 70 && !c.alreadyExists).map((c) => c.osmId)));
  }

  const importable = candidates.filter((c) => !c.alreadyExists);
  const dupCount = candidates.length - importable.length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-display-md text-white mb-2">Curated Bulk Import</h1>
        <p className="text-white/40 text-sm">
          Discover real Nepal destinations from OpenStreetMap with quality scoring. Pick what you want, AI enrichment only on selected.
        </p>
      </div>

      {/* Step 1: Discover controls */}
      <div className="rounded-2xl border border-white/[0.08] bg-base-900/40 p-6 space-y-5">
        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-brand-400 mb-2">
          <span>Step 1</span>
          <div className="h-px w-12 bg-brand-500/60" />
          <span className="text-white/70">Discover candidates</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-white/40 text-xs font-mono uppercase tracking-wider mb-2 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={busy}
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2.5 text-white text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-white/40 text-xs font-mono uppercase tracking-wider mb-2 block">Min score ({minScore})</label>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              disabled={busy}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-white/40 text-xs font-mono uppercase tracking-wider mb-2 block">Max results ({maxResults})</label>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              disabled={busy}
              className="w-full"
            />
          </div>
        </div>

        <button
          onClick={handleDiscover}
          disabled={busy}
          className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-md text-sm font-medium disabled:opacity-40"
        >
          {busy && step === "discover" ? "Discovering…" : "Discover Candidates"}
        </button>
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-base-900/40 p-4 max-h-40 overflow-y-auto font-mono text-xs space-y-1 text-white/60">
          {logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}

      {/* Step 2: Review candidates */}
      {candidates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-brand-400 mb-2">
            <span>Step 2</span>
            <div className="h-px w-12 bg-brand-500/60" />
            <span className="text-white/70">Select to import ({selected.size} of {importable.length} selectable, {dupCount} duplicates skipped)</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={selectAll} disabled={busy} className="text-xs px-3 py-1.5 border border-white/15 rounded text-white/70 hover:bg-white/[0.05]">Select all</button>
            <button onClick={selectHighQuality} disabled={busy} className="text-xs px-3 py-1.5 border border-emerald-400/30 rounded text-emerald-400 hover:bg-emerald-400/10">High quality only (70+)</button>
            <button onClick={selectNone} disabled={busy} className="text-xs px-3 py-1.5 border border-white/15 rounded text-white/70 hover:bg-white/[0.05]">Clear</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((c) => {
              const isSelected = selected.has(c.osmId);
              const scoreColor = c.score >= 70 ? "text-emerald-400 border-emerald-400/30" : c.score >= 50 ? "text-yellow-400 border-yellow-400/30" : "text-red-400 border-red-400/30";
              return (
                <div
                  key={c.osmId}
                  className={`rounded-xl border p-4 transition-all ${c.alreadyExists ? "opacity-40 border-white/[0.05]" : isSelected ? "border-brand-500/50 bg-brand-500/[0.06]" : "border-white/[0.08] bg-base-900/40 hover:border-white/20"}`}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={c.alreadyExists || busy}
                      onChange={() => toggle(c.osmId)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      {c.imageUrl && (
                        <img src={c.imageUrl} alt={c.name} className="w-full h-32 object-cover rounded mb-3" />
                      )}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm truncate">{c.name}</p>
                          {c.nameNepali && <p className="text-white/40 text-xs truncate">{c.nameNepali}</p>}
                        </div>
                        <span className={`text-xs font-mono border px-2 py-0.5 rounded ${scoreColor}`}>{c.score}</span>
                      </div>
                      <p className="text-white/40 text-xs mb-2">{c.province} · {c.lat.toFixed(3)}, {c.lng.toFixed(3)}</p>
                      {c.alreadyExists && <p className="text-yellow-400 text-xs mb-2">Already in DB</p>}
                      <div className="space-y-0.5">
                        {c.reasons.slice(0, 4).map((r, i) => (
                          <p key={i} className="text-white/45 text-[11px]">✓ {r}</p>
                        ))}
                      </div>
                      {c.wikiSummary && (
                        <p className="text-white/30 text-xs mt-2 line-clamp-2">{c.wikiSummary}</p>
                      )}
                    </div>
                  </label>
                </div>
              );
            })}
          </div>

          {/* Step 3 */}
          {selected.size > 0 && (
            <div className="rounded-2xl border border-brand-500/30 bg-brand-500/[0.05] p-5 sticky bottom-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-white font-medium">{selected.size} destinations selected</p>
                  <p className="text-white/50 text-xs mt-1">~${(selected.size * 0.0005).toFixed(3)} in Claude API cost</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                    <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} disabled={busy} />
                    Publish immediately
                  </label>
                  <button
                    onClick={handleImportSelected}
                    disabled={busy}
                    className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-md text-sm font-medium disabled:opacity-40"
                  >
                    {busy && step === "importing" ? "Importing…" : "Import Selected"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
