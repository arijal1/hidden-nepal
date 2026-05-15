"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";

interface Category {
  key: string;
  label: string;
  icon: string;
  estimated: number;
}

interface ImportEvent {
  type: string;
  name?: string;
  total?: number;
  processed?: number;
  succeeded?: number;
  skipped?: number;
  failed?: number;
  message?: string;
  error?: string;
  item?: any;
}

export function BulkImportClient({ categories }: { categories: Category[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [limit, setLimit] = useState(50);
  const [enrichWithAI, setEnrichWithAI] = useState(true);
  const [fetchWikipedia, setFetchWikipedia] = useState(true);
  const [publishAll, setPublishAll] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<ImportEvent[]>([]);
  const [stats, setStats] = useState({ total:0, processed:0, succeeded:0, skipped:0, failed:0 });
  const [completed, setCompleted] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const addEvent = (event: ImportEvent) => {
    setEvents((prev) => [...prev.slice(-100), event]); // keep last 100
    if (event.total) setStats((s) => ({ ...s, total: event.total! }));
    if (event.processed != null) setStats((s) => ({
      ...s,
      processed: event.processed!,
      succeeded: event.succeeded ?? s.succeeded,
      skipped: event.skipped ?? s.skipped,
      failed: event.failed ?? s.failed,
    }));
    // Auto-scroll log
    setTimeout(() => logRef.current?.scrollTo(0, logRef.current.scrollHeight), 50);
  };

  const startImport = async () => {
    if (!selectedCategory) {
      toast.error("Select a category first");
      return;
    }

    setRunning(true);
    setCompleted(false);
    setEvents([]);
    setStats({ total:0, processed:0, succeeded:0, skipped:0, failed:0 });

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/admin/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          limit,
          enrichWithAI,
          fetchWikipedia,
          publishAll,
          dryRun,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("Import failed to start");
      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event: ImportEvent = JSON.parse(line.slice(6));
              addEvent(event);

              if (event.type === "complete") {
                setCompleted(true);
                toast.success(event.message ?? "Import complete");
              }
              if (event.type === "fatal") {
                toast.error(event.error ?? "Fatal error");
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error(err.message ?? "Import failed");
      }
    } finally {
      setRunning(false);
    }
  };

  const stopImport = () => {
    abortRef.current?.abort();
    setRunning(false);
    toast("Import stopped");
  };

  const progressPct = stats.total > 0
    ? Math.round((stats.processed / stats.total) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

      {/* Config panel */}
      <div className="xl:col-span-1 space-y-5">

        {/* Category selection */}
        <div className="glass-card p-5">
          <p className="section-label mb-4">1. Choose Category</p>
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                  selectedCategory === cat.key
                    ? "border-brand-500/50 bg-brand-500/10"
                    : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${selectedCategory === cat.key ? "text-brand-400" : "text-white/70"}`}>
                    {cat.label}
                  </p>
                </div>
                <span className="text-white/25 text-xs font-mono shrink-0">
                  ~{cat.estimated}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="glass-card p-5 space-y-4">
          <p className="section-label">2. Options</p>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/50 text-xs font-mono uppercase tracking-wider">Limit</span>
              <span className="text-brand-400 text-xs font-mono font-bold">{limit} locations</span>
            </div>
            <input
              type="range" min={5} max={200} step={5} value={limit}
              onChange={(e) => setLimit(+e.target.value)}
              className="w-full h-1.5 rounded-full cursor-pointer"
              style={{ accentColor:"#52b788", background:`linear-gradient(to right, #52b788 0%, #52b788 ${((limit-5)/195)*100}%, rgba(255,255,255,0.1) ${((limit-5)/195)*100}%, rgba(255,255,255,0.1) 100%)` }}
            />
            <div className="flex justify-between text-white/20 text-[10px] font-mono mt-1">
              <span>5</span><span>100</span><span>200</span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key:"enrichWithAI", label:"AI enrichment", sub:"GPT-4o generates taglines, SEO, highlights", val:enrichWithAI, set:setEnrichWithAI },
              { key:"fetchWikipedia", label:"Wikipedia data", sub:"Pull descriptions and CC photos", val:fetchWikipedia, set:setFetchWikipedia },
              { key:"publishAll", label:"Publish immediately", sub:"Make all imports live on site", val:publishAll, set:setPublishAll },
              { key:"dryRun", label:"Dry run (preview only)", sub:"Preview without saving to database", val:dryRun, set:setDryRun },
            ].map((opt) => (
              <div key={opt.key} className="flex items-start gap-3">
                <div
                  onClick={() => opt.set(!opt.val)}
                  className={`mt-0.5 w-9 h-5 rounded-full relative transition-colors cursor-pointer flex-shrink-0 ${opt.val ? "bg-brand-500" : "bg-white/[0.1]"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${opt.val ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <div>
                  <p className={`text-sm ${opt.val ? "text-white/80" : "text-white/40"}`}>{opt.label}</p>
                  <p className="text-white/25 text-xs">{opt.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start/Stop */}
        <div className="space-y-2">
          {dryRun && (
            <div className="p-3 rounded-xl bg-gold-500/[0.06] border border-gold-500/20 text-gold-400 text-xs text-center">
              ⚠ Dry run — nothing will be saved
            </div>
          )}
          {!running ? (
            <button
              onClick={startImport}
              disabled={!selectedCategory}
              className="btn-primary w-full py-4 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <span>◈</span>
              {dryRun ? "Preview Import" : `Import ${limit} Locations`}
            </button>
          ) : (
            <button
              onClick={stopImport}
              className="w-full py-4 rounded-xl text-sm border border-gold-500/30 bg-gold-500/[0.07] text-gold-400 flex items-center justify-center gap-2"
            >
              ⬛ Stop Import
            </button>
          )}
        </div>
      </div>

      {/* Live progress panel */}
      <div className="xl:col-span-2 space-y-4">

        {/* Stats bar */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="section-label">Live Progress</p>
            {running && (
              <span className="flex items-center gap-2 text-brand-400 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                Running…
              </span>
            )}
            {completed && (
              <span className="text-brand-400 text-xs font-mono">✓ Complete</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-brand-gradient rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Stat counters */}
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { label:"Total", value:stats.total, color:"text-white/70" },
              { label:"Added", value:stats.succeeded, color:"text-brand-400" },
              { label:"Skipped", value:stats.skipped, color:"text-white/40" },
              { label:"Failed", value:stats.failed, color:"text-gold-400" },
            ].map((s) => (
              <div key={s.label}>
                <p className={`text-2xl font-display font-medium ${s.color}`}>{s.value}</p>
                <p className="text-white/25 text-xs font-mono uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live log */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <p className="text-white/40 text-xs font-mono uppercase tracking-wider">Import Log</p>
            <button
              onClick={() => setEvents([])}
              className="text-white/20 text-xs hover:text-white/50 transition-colors"
            >
              Clear
            </button>
          </div>
          <div
            ref={logRef}
            className="h-80 overflow-y-auto p-4 space-y-1.5 scroll-smooth"
            style={{ scrollbarWidth:"thin" }}
          >
            {events.length === 0 ? (
              <p className="text-white/20 text-xs font-mono text-center py-12">
                Configure options and click Import to start
              </p>
            ) : (
              events.map((event, i) => (
                <LogLine key={i} event={event} />
              ))
            )}
          </div>
        </div>

        {/* Cost estimate */}
        <div className="glass-card p-4">
          <p className="text-white/25 text-xs font-mono uppercase tracking-wider mb-2">Estimated Cost</p>
          <div className="flex gap-6 text-xs">
            <span className="text-white/40">
              OpenStreetMap: <span className="text-white/60">Free</span>
            </span>
            <span className="text-white/40">
              Wikipedia: <span className="text-white/60">Free</span>
            </span>
            <span className="text-white/40">
              GPT-4o Mini: <span className="text-brand-400">
                ~${(limit * 0.0004).toFixed(3)}
              </span>
            </span>
            <span className="text-white/40">
              Total for {limit}: <span className="text-brand-400 font-semibold">
                ~${(limit * 0.0004).toFixed(2)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogLine({ event }: { event: ImportEvent }) {
  const styles: Record<string, { color: string; prefix: string }> = {
    start:    { color:"text-white/50", prefix:"▶" },
    progress: { color:"text-white/40", prefix:"…" },
    item:     { color:"text-white/65", prefix:"◈" },
    error:    { color:"text-gold-400", prefix:"⚠" },
    fatal:    { color:"text-red-400",  prefix:"✕" },
    complete: { color:"text-brand-400",prefix:"✓" },
    preview:  { color:"text-sky-400",  prefix:"👁" },
  };

  const s = styles[event.type] ?? { color:"text-white/40", prefix:"·" };

  let message = "";
  if (event.type === "item") message = `${event.name} (${event.processed}/${event.total})`;
  else if (event.type === "error") message = `⚠ ${event.name}: ${event.error}`;
  else if (event.type === "complete") message = event.message ?? "Complete";
  else if (event.type === "preview") message = `Preview: ${event.item?.name}`;
  else message = event.message ?? event.type;

  return (
    <div className={`flex items-start gap-2 text-xs font-mono ${s.color}`}>
      <span className="shrink-0 mt-0.5">{s.prefix}</span>
      <span className="break-all">{message}</span>
    </div>
  );
}
