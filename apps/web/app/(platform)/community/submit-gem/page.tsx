"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/formatters";

const PROVINCES = ["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"];

export default function SubmitGemPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    story: "",
    region: "",
    province: "",
    lat: "",
    lng: "",
    contactEmail: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.story || !form.region) {
      setError("Please fill in the required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/community/submit-gem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-base-950 flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-6">✦</p>
          <h2 className="text-white font-display text-3xl mb-4">Gem submitted!</h2>
          <p className="text-white/45 text-base leading-relaxed mb-8">
            Our Nepal-based team will verify your submission on the ground. If approved, it'll be published within 7 days.
          </p>
          <button onClick={() => router.push("/hidden-gems")} className="btn-primary px-8 py-3 rounded-xl">
            View Hidden Gems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-950 pb-24">
      <section className="pt-12 pb-8 px-5 border-b border-white/[0.06]">
        <div className="container max-w-[720px] mx-auto">
          <p className="section-label mb-3">◈ Community</p>
          <h1 className="text-display-md text-white mb-3">Submit a Hidden Gem</h1>
          <p className="text-white/40 text-sm">
            Know a place most people never find? Share it. Our team verifies every submission.
          </p>
        </div>
      </section>

      <section className="py-12 px-5">
        <div className="container max-w-[720px] mx-auto space-y-6">
          {/* Name */}
          <Field label="Place Name *" hint="What do locals call this place?">
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Panch Pokhari"
              className="form-input"
            />
          </Field>

          {/* Story */}
          <Field label="The Story *" hint="Why is this special? What makes it hidden? (min 50 chars)">
            <textarea
              value={form.story}
              onChange={(e) => set("story", e.target.value)}
              placeholder="Tell us what makes this place extraordinary and why most people never find it..."
              rows={5}
              className="form-input resize-none"
            />
            <p className="text-white/20 text-xs mt-1 text-right">{form.story.length} chars</p>
          </Field>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="District / Region *">
              <input
                value={form.region}
                onChange={(e) => set("region", e.target.value)}
                placeholder="e.g. Sindhupalchok"
                className="form-input"
              />
            </Field>
            <Field label="Province">
              <select
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
                className="form-input bg-base-950"
              >
                <option value="">Select province</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude (optional)" hint="e.g. 27.9450">
              <input
                type="number"
                value={form.lat}
                onChange={(e) => set("lat", e.target.value)}
                placeholder="27.9450"
                step="0.0001"
                className="form-input"
              />
            </Field>
            <Field label="Longitude (optional)" hint="e.g. 85.8925">
              <input
                type="number"
                value={form.lng}
                onChange={(e) => set("lng", e.target.value)}
                placeholder="85.8925"
                step="0.0001"
                className="form-input"
              />
            </Field>
          </div>

          {/* Email */}
          <Field label="Your Email (optional)" hint="We'll notify you when verified">
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => set("contactEmail", e.target.value)}
              placeholder="you@email.com"
              className="form-input"
            />
          </Field>

          {error && <p className="text-gold-500 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
            ) : (
              <><span>✦</span> Submit Hidden Gem</>
            )}
          </button>

          <p className="text-white/20 text-xs text-center">
            By submitting you confirm this is a real place and you have personally visited or have direct knowledge of it.
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
