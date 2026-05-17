"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteButton({ id, name, resource = "destinations" }: { id: string; name: string; resource?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/${resource}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Delete failed: ${data.error ?? res.statusText}`);
        setBusy(false);
        return;
      }
      router.refresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="text-red-400 text-xs hover:text-red-300 disabled:opacity-50"
    >
      {busy ? "..." : "Delete"}
    </button>
  );
}
