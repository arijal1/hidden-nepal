"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function SearchBox({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center gap-3 bg-white/[0.05] border border-white/[0.1] rounded-2xl px-5 py-4 focus-within:border-brand-500/40 transition-colors">
        <span className="text-white/30 text-lg shrink-0">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search destinations, treks, hidden gems..."
          className="flex-1 bg-transparent text-white placeholder:text-white/25 text-base outline-none font-body"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-white/25 hover:text-white/60 transition-colors text-sm shrink-0"
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || !query.trim()}
          className="btn-primary px-5 py-2 rounded-xl text-sm shrink-0 disabled:opacity-50"
        >
          {isPending ? "..." : "Search"}
        </button>
      </div>
    </form>
  );
}
