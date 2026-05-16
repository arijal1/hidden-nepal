"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/formatters";
import { useUser } from "@clerk/nextjs";

const SEASONS = ["Spring (Mar–May)", "Summer/Monsoon (Jun–Aug)", "Autumn (Sep–Nov)", "Winter (Dec–Feb)"];

function WriteReviewInner() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const destinationSlug = searchParams.get("destination") ?? "";
  const trekSlug = searchParams.get("trek") ?? "";

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState({ title: "", body: "", visitedAt: "", season: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-base-950 flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-5">★</p>
          <h2 className="text-white font-display text-2xl mb-3">Sign in to review</h2>
          <p className="text-white/40 text-sm mb-6">You need an account to write reviews.</p>
          <a href={`/sign-in?redirect_url=${encodeURIComponent("/community/review")}`} className="btn-primary px-7 py-3 rounded-xl text-sm block text-center">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-base-950 flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-5">★</p>
          <h2 className="text-white font-display text-2xl mb-3">Review submitted!</h2>
          <p className="text-white/40 text-sm mb-8">
            Your review will be visible after a quick moderation check — usually within 24 hours.
          </p>
          <button onClick={() => router.back()} className="btn-primary px-7 py-3 rounded-xl text-sm">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) { setError("Please select a rating."); return; }
    if (!form.body || form.body.length < 20) { setError("Review must be at least 20 characters."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/community/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rating, destinationSlug, trekSlug }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-950 pb-24">
      <section className="pt-12 pb-8 px-5 border-b border-white/[0.06]">
        <div className="container max-w-[720px] mx-auto">
          <p className="section-label mb-3">◈ Community</p>
          <h1 className="text-display-md text-white mb-2">Write a Review</h1>
          <p className="text-white/40 text-sm">
            {destinationSlug
              ? `Reviewing: ${destinationSlug.replace(/-/g, " ")}`
              : trekSlug
              ? `Reviewing: ${trekSlug.replace(/-/g, " ")} trek`
              : "Share your experience"}
          </p>
        </div>
      </section>

      <section className="py-12 px-5">
        <div className="container max-w-[720px] mx-auto space-y-6">
          {/* Star rating */}
          <div>
            <label className="text-white/50 text-xs font-mono uppercase tracking-wider block mb-3">
              Overall Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="text-3xl transition-transform hover:scale-110"
                  style={{ color: star <= (hoverRating || rating) ? "#f4a261" : "rgba(255,255,255,0.15)" }}
                >
                  ★
                </button>
              ))}
              {rating > 0 && (
                <span className="text-white/40 text-sm self-center ml-2">
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <Field label="Review Title">
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Summarise your experience in one line"
              className="form-input"
            />
          </Field>

          {/* Body */}
          <Field label="Your Review *" hint="Minimum 20 characters. Be specific — it helps future travelers.">
            <textarea
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              placeholder="What did you love? What should travelers know? Any tips or warnings?"
              rows={6}
              className="form-input resize-none"
            />
            <p className="text-white/20 text-xs mt-1 text-right">{form.body.length} chars</p>
          </Field>

          {/* Visit details */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="When did you visit?">
              <input
                type="month"
                value={form.visitedAt}
                onChange={(e) => set("visitedAt", e.target.value)}
                className="form-input"
              />
            </Field>
            <Field label="Season">
              <select
                value={form.season}
                onChange={(e) => set("season", e.target.value)}
                className="form-input bg-base-950"
              >
                <option value="">Select season</option>
                {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          {error && <p className="text-gold-500 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
              : "Submit Review ★"
            }
          </button>

          <p className="text-white/20 text-xs text-center">
            Reviews are moderated before publishing. Honest experiences only — no spam or promotional content.
          </p>
        </div>
      </section>

      <style jsx>{`
        .form-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
          font-family: var(--font-body);
        }
        .form-input:focus { border-color: rgba(82,183,136,0.4); }
        .form-input::placeholder { color: rgba(255,255,255,0.2); }
        .form-input option { background: #0a0f0a; }
      `}</style>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-white/50 text-xs font-mono uppercase tracking-wider block mb-2">{label}</label>
      {children}
      {hint && <p className="text-white/20 text-xs mt-1">{hint}</p>}
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-base-950" />}>
      <WriteReviewInner />
    </Suspense>
  );
}
