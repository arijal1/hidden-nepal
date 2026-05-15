"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const PROVINCES = ["Koshi","Madhesh","Bagmati","Gandaki","Lumbini","Karnali","Sudurpashchim"];

export default function NewAlertPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", body: "", severity: "warning", province: "", region: "", expiresAt: "", isActive: true,
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title || !form.body) { toast.error("Title and body are required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Alert created");
      router.push("/admin/alerts");
    } catch {
      toast.error("Failed to save alert");
    } finally {
      setSaving(false);
    }
  };

  const severityColors: Record<string, string> = {
    info: "text-sky-300",
    warning: "text-gold-400",
    critical: "text-gold-500",
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-white font-display text-2xl font-semibold mb-8">New Safety Alert</h1>

      <div className="space-y-5">
        <div className="glass-card p-5 space-y-4">
          <div>
            <label className="text-white/40 text-xs font-mono uppercase tracking-wider block mb-2">Severity *</label>
            <div className="flex gap-3">
              {["info","warning","critical"].map((s) => (
                <button key={s} type="button" onClick={() => set("severity", s)}
                  className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all capitalize ${
                    form.severity === s
                      ? `border-current bg-current/10 ${severityColors[s]}`
                      : "border-white/[0.08] text-white/35"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/40 text-xs font-mono uppercase tracking-wider block mb-1.5">Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Monsoon landslide risk — Karnali roads" className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-500/40 transition-colors placeholder:text-white/20" />
          </div>

          <div>
            <label className="text-white/40 text-xs font-mono uppercase tracking-wider block mb-1.5">Body *</label>
            <textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={4} placeholder="Full alert details, affected areas, recommended actions..."
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-500/40 transition-colors resize-none placeholder:text-white/20" />
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="text-white/40 text-xs font-mono uppercase tracking-wider">Scope</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/30 text-xs font-mono block mb-1.5">Province</label>
              <select value={form.province} onChange={(e) => set("province", e.target.value)}
                className="w-full bg-[#0a0f0a] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-500/40 transition-colors">
                <option value="">All Nepal</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/30 text-xs font-mono block mb-1.5">Expires</label>
              <input type="date" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-500/40 transition-colors" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="accent-brand-400" />
            <span className="text-white/60 text-sm">Active (visible to users)</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button onClick={() => router.back()} className="btn-ghost px-6 py-3 rounded-xl text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex-1 py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? "Saving..." : "Create Alert"}
          </button>
        </div>
      </div>
    </div>
  );
}
