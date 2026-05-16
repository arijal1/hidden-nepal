// app/admin/trek-import/page.tsx
"use client";

import { useState } from "react";

type FilterCategory = "all" | "famous" | "hidden_gem" | "remote";

export default function TrekImportPage() {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [dryRun, setDryRun] = useState(false);
  const [publishImmediately, setPublishImmediately] = useState(true);

  async function startImport() {
    setRunning(true);
    setLogs([]);
    try {
      const res = await fetch("/api/admin/trek-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dryRun,
          publishImmediately,
          fetchPhotos: true,
          filterCategory: filter,
        }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const e of events) {
          if (!e.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(e.slice(6));
            setLogs((l) => [...l, data]);
          } catch {}
        }
      }
    } catch (err: any) {
      setLogs((l) => [...l, { type: "fatal", error: err.message }]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-display-md text-white mb-2">Trek Import</h1>
        <p className="text-white/40 text-sm">
          Import 20 curated Nepal treks — famous routes and hidden gems — enriched by Claude AI.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-base-900/40 p-6 space-y-5">
        <div>
          <label className="text-white/40 text-xs font-mono uppercase tracking-wider mb-2 block">
            Category Filter
          </label>
          <div className="flex flex-wrap gap-2">
            {(["all", "famous", "hidden_gem", "remote"] as FilterCategory[]).map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                disabled={running}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  filter === c
                    ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                    : "bg-white/[0.03] text-white/60 border border-white/[0.08] hover:bg-white/[0.06]"
                }`}
              >
                {c === "all" ? "All 20" : c === "hidden_gem" ? "Hidden Gems" : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="flex items-center gap-3 text-sm text-white/70 cursor-pointer">
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} disabled={running} />
            Dry run — preview without saving
          </label>
          <label className="flex items-center gap-3 text-sm text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={publishImmediately}
              onChange={(e) => setPublishImmediately(e.target.checked)}
              disabled={running || dryRun}
            />
            Publish immediately
          </label>
        </div>

        <button
          onClick={startImport}
          disabled={running}
          className="w-full bg-brand-gradient text-white rounded-xl py-3 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {running ? "Importing…" : "Start Trek Import"}
        </button>

        {dryRun && <p className="text-yellow-400/80 text-xs">⚠ Dry run — nothing will be saved</p>}
        <p className="text-white/30 text-xs">
          Cost estimate: ~$0.05 (Claude Sonnet) · Time: ~3-5 minutes for 20 treks
        </p>
      </div>

      {logs.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-base-900/40 p-5 max-h-96 overflow-y-auto space-y-1.5 font-mono text-xs">
          {logs.map((log, i) => (
            <div
              key={i}
              className={
                log.type === "success"
                  ? "text-emerald-400"
                  : log.type === "fail" || log.type === "fatal"
                  ? "text-red-400"
                  : log.type === "skip"
                  ? "text-yellow-400/70"
                  : log.type === "done"
                  ? "text-brand-400 font-medium pt-2 border-t border-white/[0.06]"
                  : "text-white/60"
              }
            >
              {log.type === "start" && `▶ ${log.message}`}
              {log.type === "progress" && `◈ ${log.message}`}
              {log.type === "success" && `✓ ${log.trek} ${log.message ?? ""}`}
              {log.type === "skip" && `⊘ ${log.trek} — ${log.message}`}
              {log.type === "fail" && `✗ ${log.trek} — ${log.error}`}
              {log.type === "fatal" && `✗ FATAL: ${log.error}`}
              {log.type === "done" && log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
