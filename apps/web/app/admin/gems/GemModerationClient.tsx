"use client";

import { useState } from "react";
import { toast } from "sonner";

export function GemModerationClient({ gems: initialGems }: { gems: any[] }) {
  const [gems, setGems] = useState(initialGems);

  const updateGem = async (id: string, updates: Record<string, boolean>) => {
    try {
      const res = await fetch(`/api/admin/gems/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      setGems((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
      toast.success("Gem updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const pending = gems.filter((g) => !g.is_verified);
  const verified = gems.filter((g) => g.is_verified);

  return (
    <div className="space-y-8">
      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <p className="text-gold-400 text-xs font-mono uppercase tracking-wider mb-4">
            ⏳ Pending Verification ({pending.length})
          </p>
          <div className="space-y-3">
            {pending.map((gem) => (
              <GemRow key={gem.id} gem={gem} onUpdate={updateGem} />
            ))}
          </div>
        </div>
      )}

      {/* Verified */}
      <div>
        <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-4">
          ✓ Verified ({verified.length})
        </p>
        <div className="space-y-3">
          {verified.map((gem) => (
            <GemRow key={gem.id} gem={gem} onUpdate={updateGem} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GemRow({ gem, onUpdate }: { gem: any; onUpdate: (id: string, u: any) => void }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-white/80 font-medium">{gem.title}</h3>
            {gem.is_verified && <span className="text-brand-400 text-xs">✓ Verified</span>}
            {gem.is_published && <span className="text-brand-400 text-xs">● Live</span>}
          </div>
          <p className="text-white/40 text-xs font-mono mb-2">📍 {gem.region} {gem.province && `· ${gem.province}`}</p>
          <p className="text-white/50 text-sm leading-relaxed line-clamp-3">{gem.story}</p>
          {gem.profiles && (
            <p className="text-white/25 text-xs mt-2">
              Submitted by {gem.profiles.full_name ?? gem.profiles.username ?? "Anonymous"}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {!gem.is_verified && (
            <button
              onClick={() => onUpdate(gem.id, { is_verified: true })}
              className="text-xs px-3 py-1.5 rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-400 hover:bg-brand-500/25 transition-colors"
            >
              ✓ Verify
            </button>
          )}
          {gem.is_verified && !gem.is_published && (
            <button
              onClick={() => onUpdate(gem.id, { is_published: true })}
              className="text-xs px-3 py-1.5 rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-400 hover:bg-brand-500/25 transition-colors"
            >
              Publish
            </button>
          )}
          {gem.is_published && (
            <button
              onClick={() => onUpdate(gem.id, { is_published: false })}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white/40 hover:text-white/70 transition-colors"
            >
              Unpublish
            </button>
          )}
          <button
            onClick={() => onUpdate(gem.id, { is_verified: false, is_published: false })}
            className="text-xs px-3 py-1.5 rounded-lg bg-gold-500/[0.07] border border-gold-500/20 text-gold-500/70 hover:text-gold-400 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
