"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const CATEGORIES = ["city","village","lake","trek","temple","waterfall","viewpoint","valley","park","cultural","hidden_gem"];
const PROVINCES = ["Koshi","Madhesh","Bagmati","Gandaki","Lumbini","Karnali","Sudurpashchim"];

export function DestinationEditClient({ destination: initial }: { destination: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: initial.name ?? "",
    nameNepali: initial.name_nepali ?? "",
    tagline: initial.tagline ?? "",
    description: initial.description ?? "",
    province: initial.province ?? "",
    category: initial.category ?? "",
    isHiddenGem: initial.is_hidden_gem ?? false,
    isFeatured: initial.is_featured ?? false,
    isPublished: initial.is_published ?? false,
    elevationM: initial.elevation_m?.toString() ?? "",
    bestSeason: initial.best_season ?? [],
    coverImageUrl: initial.cover_image_url ?? "",
    tags: (initial.tags ?? []).join(", "),
    seoTitle: initial.seo_title ?? "",
    seoDescription: initial.seo_description ?? "",
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));
  const toggleSeason = (s: string) =>
    set("bestSeason", form.bestSeason.includes(s) ? form.bestSeason.filter((x: string) => x !== s) : [...form.bestSeason, s]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/destinations/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Destination updated");
      router.push("/admin/destinations");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          {/* Main info */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-white/40 text-xs font-mono uppercase tracking-wider">Basic Info</h3>
            <AdminInput label="Name" value={form.name} onChange={(v) => set("name", v)} />
            <AdminInput label="Nepali Name" value={form.nameNepali} onChange={(v) => set("nameNepali", v)} />
            <AdminInput label="Tagline" value={form.tagline} onChange={(v) => set("tagline", v)} />
            <AdminTextarea label="Description" value={form.description} onChange={(v) => set("description", v)} rows={6} />
          </div>

          {/* SEO */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-white/40 text-xs font-mono uppercase tracking-wider">SEO</h3>
            <AdminInput label="SEO Title" value={form.seoTitle} onChange={(v) => set("seoTitle", v)} />
            <AdminTextarea label="SEO Description" value={form.seoDescription} onChange={(v) => set("seoDescription", v)} rows={3} />
          </div>

          {/* Media */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-white/40 text-xs font-mono uppercase tracking-wider">Cover Image</h3>
            <AdminInput label="Image URL" value={form.coverImageUrl} onChange={(v) => set("coverImageUrl", v)} placeholder="https://..." />
            {form.coverImageUrl && <img src={form.coverImageUrl} alt="" className="rounded-xl h-40 w-full object-cover" />}
          </div>
        </div>

        <div className="space-y-5">
          {/* Classification */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-white/40 text-xs font-mono uppercase tracking-wider">Classification</h3>
            <AdminSelect label="Province" value={form.province} options={PROVINCES} onChange={(v) => set("province", v)} />
            <AdminSelect label="Category" value={form.category} options={CATEGORIES} onChange={(v) => set("category", v)} />
            <div className="space-y-2">
              {[
                { key: "isHiddenGem", label: "Hidden Gem" },
                { key: "isFeatured", label: "Featured" },
                { key: "isPublished", label: "Published (live)" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={(form as any)[key]} onChange={(e) => set(key, e.target.checked)} className="accent-brand-400" />
                  <span className="text-white/60 text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Seasons */}
          <div className="glass-card p-5">
            <h3 className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">Best Seasons</h3>
            <div className="flex flex-wrap gap-2">
              {["Spring", "Summer", "Autumn", "Winter"].map((s) => (
                <button key={s} type="button" onClick={() => toggleSeason(s)}
                  className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                    form.bestSeason.includes(s) ? "border-brand-500/50 bg-brand-500/10 text-brand-400" : "border-white/[0.08] text-white/40"
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">Details</h3>
            <AdminInput label="Elevation (m)" value={form.elevationM} onChange={(v) => set("elevationM", v)} type="number" />
            <div className="mt-3">
              <AdminInput label="Tags (comma-separated)" value={form.tags} onChange={(v) => set("tags", v)} />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : "Save Changes"}
          </button>
        </div>
      </div>

      <style jsx>{`
        :global(.admin-i) { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:0.625rem; padding:0.625rem 0.875rem; color:white; font-size:0.8125rem; outline:none; transition:border-color 0.2s; }
        :global(.admin-i:focus) { border-color:rgba(82,183,136,0.4); }
        :global(.admin-i::placeholder) { color:rgba(255,255,255,0.2); }
        :global(.admin-i option) { background:#0a0f0a; }
      `}</style>
    </div>
  );
}

function AdminInput({ label, value, onChange, type = "text", placeholder = "" }: any) {
  return (
    <div>
      <label className="text-white/30 text-xs font-mono block mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="admin-i w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-500/40 transition-colors placeholder:text-white/20" />
    </div>
  );
}

function AdminTextarea({ label, value, onChange, rows = 4 }: any) {
  return (
    <div>
      <label className="text-white/30 text-xs font-mono block mb-1">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="admin-i w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-500/40 transition-colors resize-none" />
    </div>
  );
}

function AdminSelect({ label, value, options, onChange }: any) {
  return (
    <div>
      <label className="text-white/30 text-xs font-mono block mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="admin-i w-full bg-[#0a0f0a] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-500/40 transition-colors capitalize">
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((o: string) => <option key={o} value={o} className="capitalize">{o.replace("_", " ")}</option>)}
      </select>
    </div>
  );
}
