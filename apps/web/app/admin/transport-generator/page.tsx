// app/admin/transport-generator/page.tsx
"use client";

import { useState } from "react";

export default function TransportGeneratorPage() {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [dryRun, setDryRun] = useState(false);
  const [onlyMissing, setOnlyMissing] = useState(true);

  async function startGenerate() {
    setRunning(true);
    setLogs([]);
    try {
      const res = await fetch("/api/admin/transport-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun, onlyMissing }),
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
        <h1 className="text-display-md text-white mb-2">Transport Route Generator</h1>
        <p className="text-white/40 text-sm">
          Auto-generate realistic transport routes (flight, bus, jeep) from Kathmandu and Pokhara for destinations missing them.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-base-900/40 p-6 space-y-5">
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 text-sm text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyMissing}
              onChange={(e) => setOnlyMissing(e.target.checked)}
              disabled={running}
            />
            Only destinations missing transport routes (recommended)
          </label>
          <label className="flex items-center gap-3 text-sm text-white/70 cursor-pointer">
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} disabled={running} />
            Dry run — preview without saving
          </label>
        </div>

        <button
          onClick={startGenerate}
          disabled={running}
          className="w-full bg-brand-gradient text-white rounded-xl py-3 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {running ? "Generating…" : "Generate Transport Routes"}
        </button>

        {dryRun && <p className="text-yellow-400/80 text-xs">⚠ Dry run — nothing will be saved</p>}
        <p className="text-white/30 text-xs">
          Cost estimate: ~$0.0005 per destination (Claude Haiku) · ~3-5 seconds per destination
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
              {log.type === "progress" && `${log.message}`}
              {log.type === "success" && `✓ ${log.destination} ${log.message ?? ""}`}
              {log.type === "skip" && `⊘ ${log.destination} — ${log.message}`}
              {log.type === "fail" && `✗ ${log.destination} — ${log.error}`}
              {log.type === "fatal" && `✗ FATAL: ${log.error}`}
              {log.type === "done" && log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
