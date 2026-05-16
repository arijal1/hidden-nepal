"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import type { GeocodingResult } from "@/lib/mapbox/geocoding";

interface EnrichedLocation {
  tagline: string;
  description: string;
  isHiddenGem: boolean;
  highlights: string[];
  bestSeason: string[];
  tags: string[];
  warnings: string[];
  estimatedDurationDays: number;
  elevationM: number | null;
  category: string;
  seoTitle: string;
  seoDescription: string;
  province: string;
  coordinates: { lat: number; lng: number };
}

type Stage = "idle" | "geocoding" | "enriching" | "preview" | "importing" | "done";

export function LocationFinder({ onImported }: { onImported?: (slug: string) => void }) {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [geocodeResults, setGeocodeResults] = useState<GeocodingResult[]>([]);
  const [selectedGeocode, setSelectedGeocode] = useState<GeocodingResult | null>(null);
  const [enriched, setEnriched] = useState<EnrichedLocation | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [importedSlug, setImportedSlug] = useState("");
  const debounceRef = useRef<NodeJS.Timeout>();

  // Step 1 — Geocode search
  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 3) { setGeocodeResults([]); return; }
    setStage("geocoding");
    try {
      const res = await fetch(`/api/locations/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setGeocodeResults(data.results ?? []);
      setStage("idle");
    } catch {
      toast.error("Search failed");
      setStage("idle");
    }
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 600);
  };

  // Step 2 — Select geocode result + enrich with AI
  const handleSelect = async (result: GeocodingResult) => {
    setSelectedGeocode(result);
    setGeocodeResults([]);
    setStage("enriching");
    setEnriched(null);

    try {
      const res = await fetch("/api/locations/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.name,
          lat: result.lat,
          lng: result.lng,
          placeTypes: result.placeType,
          province: result.context.region,
        }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setEnriched(data.enriched);
      setStage("preview");
    } catch {
      toast.error("AI enrichment failed — try again");
      setStage("idle");
    }
  };

  // Step 3 — Import to Supabase
  const handleImport = async () => {
    if (!selectedGeocode || !enriched) return;
    setStage("importing");

    try {
      const res = await fetch("/api/locations/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedGeocode.name,
          lat: selectedGeocode.lat,
          lng: selectedGeocode.lng,
          province: enriched.province,
          tagline: enriched.tagline,
          description: enriched.description,
          category: enriched.category,
          isHiddenGem: enriched.isHiddenGem,
          highlights: enriched.highlights,
          bestSeason: enriched.bestSeason,
          tags: enriched.tags,
          warnings: enriched.warnings,
          elevationM: enriched.elevationM,
          seoTitle: enriched.seoTitle,
          seoDescription: enriched.seoDescription,
          coverImageUrl: coverImageUrl || null,
          isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setImportedSlug(data.slug);
      setStage("done");
      toast.success(`"${selectedGeocode.name}" added to site!`);
      onImported?.(data.slug);
    } catch (err: any) {
      toast.error(err.message ?? "Import failed");
      setStage("preview");
    }
  };

  const handleReset = () => {
    setQuery("");
    setStage("idle");
    setGeocodeResults([]);
    setSelectedGeocode(null);
    setEnriched(null);
    setCoverImageUrl("");
    setIsPublished(false);
    setImportedSlug("");
  };

  return (
    <div className="space-y-4">

      {/* ── Step 1: Search ───────────────────────── */}
      <div className="glass-card p-5">
        <h3 className="section-label mb-4">Step 1 — Search Location</h3>
        <div className="relative">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Type any Nepal place name… (e.g. Gosaikunda, Bandipur, Nagarkot)"
                disabled={stage === "enriching" || stage === "importing"}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder:text-white/25 text-sm outline-none focus:border-brand-500/40 transition-colors disabled:opacity-50"
              />
              {stage === "geocoding" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-brand-400 rounded-full animate-spin" />
                </div>
              )}
            </div>
            {(stage === "preview" || stage === "done") && (
              <button onClick={handleReset} className="btn-ghost px-4 py-3 rounded-xl text-sm shrink-0">
                ← New search
              </button>
            )}
          </div>

          {/* Geocode results dropdown */}
          {geocodeResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-base-950/95 backdrop-blur-2xl border border-white/[0.12] rounded-xl overflow-hidden shadow-2xl">
              {geocodeResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/[0.06] transition-colors text-left border-b border-white/[0.05] last:border-0"
                >
                  <span className="text-brand-400 text-base mt-0.5 shrink-0">📍</span>
                  <div>
                    <p className="text-white/85 text-sm font-medium">{result.name}</p>
                    <p className="text-white/35 text-xs mt-0.5">{result.fullName}</p>
                    <p className="text-white/20 text-xs font-mono mt-1">
                      {result.lat.toFixed(4)}°N, {result.lng.toFixed(4)}°E
                      {result.placeType.length > 0 && ` · ${result.placeType[0]}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedGeocode && stage !== "idle" && (
          <div className="mt-3 flex items-center gap-2 text-xs text-white/40 font-mono">
            <span className="text-brand-400">✓</span>
            Selected: {selectedGeocode.fullName}
          </div>
        )}
      </div>

      {/* ── Step 2: AI Enrichment loading ───────── */}
      {stage === "enriching" && (
        <div className="glass-card p-8 text-center">
          <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-display text-lg mb-1">AI is researching this location…</p>
          <p className="text-white/30 text-sm">
            Generating description, tags, highlights, best seasons, SEO data
          </p>
        </div>
      )}

      {/* ── Step 3: Preview ──────────────────────── */}
      {(stage === "preview" || stage === "importing") && enriched && selectedGeocode && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-label">Step 2 — Review &amp; Edit</h3>
            <div className="flex items-center gap-2">
              {enriched.isHiddenGem && (
                <span className="gem-badge text-[9px]">✦ Hidden Gem</span>
              )}
              <span className="text-xs font-mono text-white/30 border border-white/[0.08] rounded-full px-2 py-0.5 capitalize">
                {enriched.category}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left — generated content */}
            <div className="space-y-4">
              <InfoRow label="Name" value={selectedGeocode.name} />
              <InfoRow label="Province" value={enriched.province} />
              <InfoRow
                label="Coordinates"
                value={`${selectedGeocode.lat.toFixed(4)}°N, ${selectedGeocode.lng.toFixed(4)}°E`}
                mono
              />
              {enriched.elevationM && (
                <InfoRow label="Elevation" value={`${enriched.elevationM.toLocaleString()}m`} mono />
              )}

              <div>
                <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-1">Tagline</p>
                <p className="text-white/70 text-sm italic">{enriched.tagline}</p>
              </div>

              <div>
                <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-1">Description</p>
                <p className="text-white/55 text-sm leading-relaxed line-clamp-4">{enriched.description}</p>
              </div>

              <div>
                <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-2">Highlights</p>
                <div className="space-y-1">
                  {enriched.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/55">
                      <span className="text-brand-400 shrink-0">◈</span> {h}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — metadata */}
            <div className="space-y-4">
              <div>
                <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-2">Best Seasons</p>
                <div className="flex flex-wrap gap-2">
                  {enriched.bestSeason.map((s) => (
                    <span key={s} className="text-xs font-mono text-brand-400 border border-brand-500/25 bg-brand-500/[0.07] rounded-full px-3 py-1">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {enriched.tags.map((t) => (
                    <span key={t} className="text-xs text-white/35 border border-white/[0.08] rounded-full px-2 py-0.5 font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {enriched.warnings.length > 0 && (
                <div>
                  <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-2">⚠ Warnings</p>
                  <div className="space-y-1">
                    {enriched.warnings.map((w, i) => (
                      <p key={i} className="text-gold-400/70 text-xs">{w}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover image URL input */}
              <div>
                <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-1.5">Cover Image URL</p>
                <input
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-brand-500/40 transition-colors placeholder:text-white/20"
                />
                {coverImageUrl && (
                  <div className="mt-2 h-24 rounded-lg overflow-hidden">
                    <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Publish toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setIsPublished((p) => !p)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${
                    isPublished ? "bg-brand-500" : "bg-white/[0.1]"
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    isPublished ? "translate-x-5" : "translate-x-0.5"
                  }`} />
                </div>
                <span className="text-white/60 text-sm">
                  {isPublished ? "Publish immediately" : "Save as draft"}
                </span>
              </label>
            </div>
          </div>

          {/* SEO preview */}
          <div className="mt-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
            <p className="text-white/25 text-xs font-mono uppercase tracking-wider mb-2">SEO Preview</p>
            <p className="text-sky-400 text-sm">{enriched.seoTitle}</p>
            <p className="text-white/35 text-xs mt-1 leading-relaxed">{enriched.seoDescription}</p>
          </div>

          {/* Import button */}
          <button
            onClick={handleImport}
            disabled={stage === "importing"}
            className="btn-primary w-full mt-5 py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
          >
            {stage === "importing" ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving to database…
              </>
            ) : (
              <>
                <span>◈</span>
                Import "{selectedGeocode.name}" to Hidden Nepal
                {isPublished && " · Publish live"}
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Done state ──────────────────────────── */}
      {stage === "done" && importedSlug && (
        <div className="glass-card p-6 text-center border-brand-500/25">
          <p className="text-4xl mb-4">◈</p>
          <p className="text-white font-display text-xl mb-2">
            "{selectedGeocode?.name}" is now on Hidden Nepal!
          </p>
          <p className="text-white/40 text-sm mb-6">
            {isPublished ? "Live at:" : "Saved as draft:"}
            <span className="text-brand-400 font-mono ml-2">/destinations/{importedSlug}</span>
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href={`/destinations/${importedSlug}`}
              target="_blank"
              className="btn-primary px-6 py-2.5 rounded-xl text-sm inline-flex items-center gap-2"
            >
              View page ↗
            </a>
            <a
              href={`/admin/destinations/${importedSlug}/edit`}
              className="btn-ghost px-6 py-2.5 rounded-xl text-sm"
            >
              Edit in CMS
            </a>
            <button onClick={handleReset} className="btn-ghost px-6 py-2.5 rounded-xl text-sm">
              Import another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-white/25 text-xs font-mono uppercase tracking-wider shrink-0">{label}</dt>
      <dd className={`text-sm text-right ${mono ? "font-mono text-white/50" : "text-white/70"}`}>{value}</dd>
    </div>
  );
}
