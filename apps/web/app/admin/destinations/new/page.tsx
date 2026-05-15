"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils/formatters";

const CATEGORIES = ["city","village","lake","trek","temple","waterfall","viewpoint","valley","park","cultural","hidden_gem"];
const PROVINCES = ["Koshi","Madhesh","Bagmati","Gandaki","Lumbini","Karnali","Sudurpashchim"];

export default function NewDestinationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", nameNepali: "", tagline: "", description: "",
    province: "", category: "", isHiddenGem: false, isFeatured: false,
    lat: "", lng: "", elevationM: "",
    bestSeason: [] as string[],
    coverImageUrl: "", tags: "",
    seoTitle: "", seoDescription: "",
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const toggleSeason = (s: string) =>
    set("bestSeason", form.bestSeason.includes(s) ? form.bestSeason.filter((x) => x !== s) : [...form.bestSeason, s]);

  const handleSave = async (publish = false) => {
    if (!form.name || !form.province || !form.category) {
      setError("Name, province, and category are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isPublished: publish, slug: slugify(form.name) }),
      });
      if (!res.ok) throw new Error();
      router.push("/admin/destinations");
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white font-display text-2xl font-semibold">New Destination</h1>
          <p className="text-white/35 text-sm mt-1">
            Slug will be: <span className="font-mono text-brand-400">{slugify(form.name) || "auto-generated"}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSave(false)} disabled={saving} className="btn-ghost text-sm px-5 py-2.5 rounded-xl">
            Save Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary text-sm px-5 py-2.5 rounded-xl">
            {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 rounded-xl bg-gold-500/[0.08] border border-gold-500/25 text-gold-400 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main fields */}
        <div className="lg:col-span-2 space-y-5">
          <FormSection title="Basic Info">
            <Field label="Name *">
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Rara Lake" className="admin-input" />
            </Field>
            <Field label="Nepali Name">
              <input value={form.nameNepali} onChange={(e) => set("nameNepali", e.target.value)} placeholder="रारा ताल" className="admin-input" />
            </Field>
            <Field label="Tagline">
              <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Nepal's largest and most pristine lake" className="admin-input" />
            </Field>
            <Field label="Description">
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} placeholder="Full description..." className="admin-input resize-none" />
            </Field>
          </FormSection>

          <FormSection title="SEO">
            <Field label="SEO Title">
              <input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className="admin-input" placeholder="Leave blank to auto-generate" />
            </Field>
            <Field label="SEO Description">
              <textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={3} className="admin-input resize-none" placeholder="Leave blank to auto-generate" />
            </Field>
          </FormSection>

          <FormSection title="Media">
            <Field label="Cover Image URL">
              <input value={form.coverImageUrl} onChange={(e) => set("coverImageUrl", e.target.value)} placeholder="https://..." className="admin-input" />
            </Field>
            {form.coverImageUrl && (
              <img src={form.coverImageUrl} alt="Preview" className="rounded-xl h-40 object-cover w-full mt-2" />
            )}
          </FormSection>
        </div>

        {/* Sidebar fields */}
        <div className="space-y-5">
          <FormSection title="Classification">
            <Field label="Province *">
              <select value={form.province} onChange={(e) => set("province", e.target.value)} className="admin-input bg-base-950">
                <option value="">Select province</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Category *">
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="admin-input bg-base-950">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c.replace("_", " ")}</option>)}
              </select>
            </Field>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isHiddenGem} onChange={(e) => set("isHiddenGem", e.target.checked)} className="accent-brand-400" />
                <span className="text-white/60 text-sm">Hidden Gem</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="accent-brand-400" />
                <span className="text-white/60 text-sm">Featured</span>
              </label>
            </div>
          </FormSection>

          <FormSection title="Location">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude">
                <input value={form.lat} onChange={(e) => set("lat", e.target.value)} placeholder="29.5266" type="number" step="0.0001" className="admin-input" />
              </Field>
              <Field label="Longitude">
                <input value={form.lng} onChange={(e) => set("lng", e.target.value)} placeholder="82.0889" type="number" step="0.0001" className="admin-input" />
              </Field>
            </div>
            <Field label="Elevation (m)">
              <input value={form.elevationM} onChange={(e) => set("elevationM", e.target.value)} placeholder="2990" type="number" className="admin-input" />
            </Field>
          </FormSection>

          <FormSection title="Best Seasons">
            <div className="flex flex-wrap gap-2">
              {["Spring", "Summer", "Autumn", "Winter"].map((s) => (
                <button key={s} type="button" onClick={() => toggleSeason(s)}
                  className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                    form.bestSeason.includes(s)
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                      : "border-white/[0.08] text-white/40 hover:text-white/70"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </FormSection>

          <FormSection title="Tags">
            <Field label="Tags (comma-separated)">
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="lake, hidden gem, national park" className="admin-input" />
            </Field>
          </FormSection>
        </div>
      </div>

      <style jsx>{`
        .admin-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:0.625rem; padding:0.625rem 0.875rem; color:white; font-size:0.8125rem; outline:none; transition:border-color 0.2s; font-family:var(--font-body); }
        .admin-input:focus { border-color:rgba(82,183,136,0.4); }
        .admin-input::placeholder { color:rgba(255,255,255,0.2); }
        .admin-input option { background:#0a0f0a; }
      `}</style>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5 space-y-4">
      <h3 className="text-white/40 text-xs font-mono uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-white/35 text-xs font-mono block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
