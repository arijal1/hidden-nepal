// components/destinations/ReviewsSection.tsx

import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import type { Review } from "@/types";

async function getReviews(destinationId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles(id, username, full_name, avatar_url)
    `)
    .eq("destination_id", destinationId)
    .eq("is_published", true)
    .order("helpful_count", { ascending: false })
    .limit(5);
  return (data ?? []) as unknown as Review[];
}

export async function ReviewsSection({
  destinationId,
  destinationName,
}: {
  destinationId: string;
  destinationName: string;
}) {
  const reviews = await getReviews(destinationId);

  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/[0.08] rounded-2xl">
          <p className="text-white/30 text-sm mb-4">
            No reviews yet. Be the first to share your experience.
          </p>
          <button className="btn-ghost text-sm px-6 py-3">
            Write a review
          </button>
        </div>
      ) : (
        <>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          <button className="w-full text-center text-white/30 text-sm hover:text-white/60 transition-colors py-2">
            View all reviews →
          </button>
        </>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          {review.user?.avatarUrl ? (
            <Image
              src={review.user.avatarUrl}
              alt={review.user.fullName ?? "User"}
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-sm font-semibold">
              {(review.user?.fullName ?? "U").charAt(0)}
            </div>
          )}
          <div>
            <p className="text-white/80 text-sm font-medium">
              {review.user?.fullName ?? "Traveler"}
            </p>
            <p className="text-white/30 text-xs font-mono">
              {review.visitedAt
                ? new Date(review.visitedAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : ""}
            </p>
          </div>
        </div>
        <div className="text-gold-400 text-sm tracking-widest">{stars}</div>
      </div>

      {review.title && (
        <p className="text-white/80 text-sm font-medium mb-1">{review.title}</p>
      )}
      <p className="text-white/50 text-sm leading-relaxed">{review.body}</p>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.05]">
        <button className="text-white/30 text-xs hover:text-white/60 transition-colors flex items-center gap-1">
          <span>👍</span> Helpful ({review.helpfulCount})
        </button>
      </div>
    </div>
  );
}
