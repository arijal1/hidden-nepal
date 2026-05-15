"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGeolocation } from "@/hooks/useGeolocation";
import { formatDistance } from "@/lib/utils/formatters";

export function NearbyClient() {
  const { lat, lng, loading, error, getLocation } = useGeolocation();
  const [results, setResults] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [radius, setRadius] = useState(50);

  const fetchNearby = async () => {
    if (!lat || !lng) return;
    setFetching(true);
    try {
      const res = await fetch(`/api/destinations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
      const data = await res.json();
      setResults(data.destinations ?? []);
    } catch {
      setResults([]);
    } finally {
      setFetching(false);
    }
  };

  // Auto-fetch when location obtained
  const handleGetLocation = async () => {
    getLocation();
  };

  // Fetch when lat/lng becomes available
  if (lat && lng && results.length === 0 && !fetching) {
    fetchNearby();
  }

  return (
    <div className="space-y-8">
      {/* Location state */}
      {!lat && !loading && (
        <div className="text-center py-16 glass-card rounded-2xl">
          <p className="text-5xl mb-5">📍</p>
          <h2 className="text-white/70 font-display text-xl mb-3">Share your location</h2>
          <p className="text-white/35 text-sm mb-8 max-w-sm mx-auto">
            We'll find Nepal destinations, treks, and hidden gems near where you are right now.
          </p>
          <button onClick={handleGetLocation} className="btn-primary px-8 py-3 rounded-xl">
            Use My Location
          </button>
          {error && <p className="text-gold-400 text-xs mt-4">{error}</p>}
        </div>
      )}

      {loading && (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-white/20 border-t-brand-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Getting your location…</p>
        </div>
      )}

      {lat && lng && (
        <>
          {/* Location info + radius control */}
          <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
              <div>
                <p className="text-white/70 text-sm font-medium">Location found</p>
                <p className="text-white/30 text-xs font-mono">{lat.toFixed(4)}°N, {lng.toFixed(4)}°E</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-xs font-mono">RADIUS</span>
                <select
                  value={radius}
                  onChange={(e) => setRadius(+e.target.value)}
                  className="bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-1.5 text-white/70 text-sm outline-none"
                >
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                  <option value={200}>200 km</option>
                </select>
              </div>
              <button onClick={fetchNearby} disabled={fetching} className="btn-primary text-xs px-4 py-2 rounded-lg">
                {fetching ? "Searching…" : "Search"}
              </button>
            </div>
          </div>

          {/* Results */}
          {fetching && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton rounded-2xl h-52" />
              ))}
            </div>
          )}

          {!fetching && results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/30 text-sm">No destinations found within {radius}km. Try increasing the radius.</p>
            </div>
          )}

          {!fetching && results.length > 0 && (
            <div>
              <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-5">
                {results.length} destinations within {radius}km
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map((dest: any) => (
                  <Link key={dest.id} href={`/destinations/${dest.slug}`}
                    className="group block rounded-2xl overflow-hidden border border-white/[0.07] hover:border-white/15 hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-44 overflow-hidden">
                      <Image src={dest.coverImageUrl} alt={dest.name} fill sizes="33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-card-gradient" />
                      {dest.distanceKm != null && (
                        <div className="absolute top-3 right-3 glass-card rounded-full px-2.5 py-1 text-xs font-mono text-white/70">
                          {formatDistance(dest.distanceKm)}
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-white/[0.02]">
                      <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider mb-1">{dest.category}</p>
                      <p className="text-white/85 font-medium text-sm">{dest.name}</p>
                      <p className="text-white/40 text-xs mt-1 line-clamp-1">{dest.tagline}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
