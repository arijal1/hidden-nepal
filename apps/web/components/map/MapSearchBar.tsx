"use client";

import { useState, useRef, useEffect } from "react";

interface SearchResult {
  id: string;
  name: string;
  fullName: string;
  lat: number;
  lng: number;
}

interface Props {
  onSelect: (lat: number, lng: number, name: string) => void;
}

export function MapSearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/locations/geocode?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleSelect = (r: SearchResult) => {
    onSelect(r.lat, r.lng, r.name);
    setQuery(r.name);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="absolute top-4 left-4 z-20 w-80">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search any place in Nepal..."
          className="w-full bg-base-950/90 backdrop-blur-md border border-white/[0.15] rounded-xl px-4 py-3 pr-10 text-white text-sm placeholder:text-white/40 outline-none focus:border-brand-500/50 transition-colors shadow-2xl"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-base">
          {loading ? "⋯" : "🔍"}
        </span>
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-base-950/95 backdrop-blur-md border border-white/[0.12] rounded-xl overflow-hidden shadow-2xl">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/[0.06] transition-colors border-b border-white/[0.04] last:border-0"
            >
              <span className="text-brand-400 text-sm mt-0.5 shrink-0">📍</span>
              <div className="min-w-0">
                <p className="text-white/85 text-sm font-medium truncate">{r.name}</p>
                <p className="text-white/35 text-xs truncate mt-0.5">{r.fullName}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && results.length === 0 && !loading && query.length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-base-950/95 backdrop-blur-md border border-white/[0.12] rounded-xl px-4 py-3 shadow-2xl">
          <p className="text-white/40 text-sm">No results in Nepal for "{query}"</p>
        </div>
      )}
    </div>
  );
}
