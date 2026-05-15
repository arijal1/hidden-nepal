"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ReviewModerationClient({ reviews: initial }: { reviews: any[] }) {
  const [reviews, setReviews] = useState(initial);

  const update = async (id: string, updates: Record<string, boolean>) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
      toast.success("Review updated");
    } catch {
      toast.error("Update failed");
    }
  };

  if (reviews.length === 0) {
    return <p className="text-white/25 text-sm text-center py-12">No reviews found</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="glass-card p-5">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <span className="text-gold-400 text-sm">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                {review.destinations && (
                  <a href={`/destinations/${review.destinations.slug}`} target="_blank"
                    className="text-brand-400 text-xs hover:text-brand-300">
                    {review.destinations.name}
                  </a>
                )}
                {review.is_flagged && <span className="text-gold-500 text-xs border border-gold-500/25 rounded-full px-2 py-0.5">Flagged</span>}
                {review.is_published && <span className="text-brand-400 text-xs">● Live</span>}
              </div>
              {review.title && <p className="text-white/75 text-sm font-medium mb-1">{review.title}</p>}
              <p className="text-white/45 text-sm leading-relaxed line-clamp-3">{review.body}</p>
              <p className="text-white/20 text-xs font-mono mt-2">
                {review.profiles?.full_name ?? review.profiles?.username ?? "Anonymous"} ·{" "}
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {!review.is_published && (
                <button onClick={() => update(review.id, { is_published: true })}
                  className="text-xs px-3 py-1.5 rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-400 hover:bg-brand-500/25 transition-colors">
                  ✓ Publish
                </button>
              )}
              {review.is_published && (
                <button onClick={() => update(review.id, { is_published: false })}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white/40 hover:text-white/70 transition-colors">
                  Unpublish
                </button>
              )}
              {!review.is_flagged ? (
                <button onClick={() => update(review.id, { is_flagged: true })}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gold-500/[0.07] border border-gold-500/20 text-gold-500/70 hover:text-gold-400 transition-colors">
                  Flag
                </button>
              ) : (
                <button onClick={() => update(review.id, { is_flagged: false, is_published: false })}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white/40 hover:text-white/70 transition-colors">
                  Unflag
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
