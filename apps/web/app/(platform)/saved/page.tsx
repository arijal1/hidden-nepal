"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import type { Destination } from "@/types";

export default function SavedPage() {
  const [saved, setSaved] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const { getSavedDestinations, removeDestination, isOnline } = useOfflineStorage();

  useEffect(() => {
    getSavedDestinations().then((data) => {
      setSaved(data);
      setLoading(false);
    });
  }, [getSavedDestinations]);

  const handleRemove = async (id: string) => {
    await removeDestination(id);
    setSaved((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-base-950 pb-24">
      <section className="pt-12 pb-8 px-5 border-b border-white/[0.06]">
        <div className="container max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <p className="section-label">Saved</p>
            {!isOnline && (
              <span className="text-gold-400 text-xs font-mono border border-gold-400/25 rounded-full px-2.5 py-0.5">
                Offline mode
              </span>
            )}
          </div>
          <h1 className="text-display-md text-white">Saved for offline</h1>
          <p className="text-white/40 text-sm mt-2 max-w-md">
            Destinations saved to this device. Available without internet — perfect for treks with no connectivity.
          </p>
        </div>
      </section>

      <div className="container max-w-[1200px] mx-auto px-5 py-12">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && saved.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-5">♡</p>
            <h2 className="text-white/50 font-display text-xl mb-3">Nothing saved yet</h2>
            <p className="text-white/25 text-sm mb-8">
              On any destination page, tap "Save for offline" to access it without internet.
            </p>
            <Link href="/destinations" className="btn-primary px-7 py-3 rounded-xl text-sm inline-block">
              Browse Destinations
            </Link>
          </div>
        )}

        {!loading && saved.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {saved.map((dest) => (
              <div key={dest.id} className="glass-card overflow-hidden group">
                {dest.coverImageUrl && (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={dest.coverImageUrl}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-card-gradient" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider mb-1">
                    {dest.province} · {dest.category}
                  </p>
                  <h3 className="text-white/85 font-display font-semibold">{dest.name}</h3>
                  <p className="text-white/40 text-xs mt-1 line-clamp-2">{dest.tagline}</p>
                  <div className="flex gap-3 mt-4">
                    <Link href={`/destinations/${dest.slug}`} className="btn-primary flex-1 text-center text-xs py-2 rounded-lg">
                      View
                    </Link>
                    <button
                      onClick={() => handleRemove(dest.id)}
                      className="btn-ghost text-xs px-3 py-2 rounded-lg text-gold-500/70 border-gold-500/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
