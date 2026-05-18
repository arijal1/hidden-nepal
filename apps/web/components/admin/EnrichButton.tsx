"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EnrichButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setErr(null);
    setDone(null);
    try {
      const res = await fetch(`/api/admin/destinations/${id}/enrich`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setDone(`Filled: ${(data.filled ?? []).join(", ")}`);
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (done) return <span className="text-emerald-400 text-xs">{done}</span>;
  if (err) return <span className="text-red-400 text-xs">{err}</span>;

  return (
    <button
      onClick={run}
      disabled={busy}
      className="text-xs px-3 py-1.5 border border-brand-500/40 text-brand-400 rounded hover:bg-brand-500/10 disabled:opacity-50"
    >
      {busy ? "Filling..." : "Fill missing"}
    </button>
  );
}
