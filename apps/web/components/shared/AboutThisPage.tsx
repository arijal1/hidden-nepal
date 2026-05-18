"use client";

import { useState } from "react";

type Source = { name: string; url?: string };

interface AboutThisPageProps {
  contentType: "destination" | "trek" | "adventure";
  contentName: string;
  contentSlug: string;
  updatedAt?: string;
  sources?: Source[];
  imageCreditName?: string;
  imageCreditUrl?: string;
}

export function AboutThisPage({
  contentType,
  contentName,
  contentSlug,
  updatedAt,
  sources = [],
  imageCreditName,
  imageCreditUrl,
}: AboutThisPageProps) {
  const [copied, setCopied] = useState(false);

  const defaultSources: Source[] = [
    { name: "OpenStreetMap", url: "https://www.openstreetmap.org/copyright" },
    { name: "Wikipedia", url: "https://en.wikipedia.org" },
    { name: "Wikivoyage", url: "https://en.wikivoyage.org" },
  ];
  const allSources = sources.length > 0 ? sources : defaultSources;

  const reportUrl = `mailto:hello@anuprijal.com?subject=${encodeURIComponent(`Correction needed: ${contentName}`)}&body=${encodeURIComponent(`Page: /${contentType === "destination" ? "destinations" : contentType + "s"}/${contentSlug}\n\nIssue:\n`)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  function printPage() {
    if (typeof window !== "undefined") window.print();
  }

  return (
    <section className="mt-16 pt-10 border-t border-white/[0.06]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sources */}
        <div>
          <h3 className="text-brand-400 text-xs font-mono uppercase tracking-[0.3em] mb-3">Sources & Data</h3>
          <ul className="space-y-1.5 text-sm">
            {allSources.map((s) => (
              <li key={s.name}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-white/55 hover:text-white">
                    {s.name} <span className="text-white/30">↗</span>
                  </a>
                ) : (
                  <span className="text-white/55">{s.name}</span>
                )}
              </li>
            ))}
          </ul>
          {(imageCreditName || imageCreditUrl) && (
            <p className="text-white/40 text-xs mt-4">
              Cover image:{" "}
              {imageCreditUrl ? (
                <a href={imageCreditUrl} target="_blank" rel="noopener noreferrer" className="text-white/65 hover:text-white">
                  {imageCreditName ?? "Wikimedia Commons"}
                </a>
              ) : (
                <span className="text-white/65">{imageCreditName ?? "Wikimedia Commons"}</span>
              )}
            </p>
          )}
          {updatedAt && (
            <p className="text-white/30 text-xs font-mono mt-3">
              Last updated · {new Date(updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-brand-400 text-xs font-mono uppercase tracking-[0.3em] mb-3">Actions</h3>
          <div className="flex flex-col gap-2">
            <button onClick={copyLink} className="text-left text-sm text-white/65 hover:text-white border border-white/10 hover:border-white/30 rounded-md px-3 py-2 transition-all">
              {copied ? "✓ Link copied" : "Share — copy link"}
            </button>
            <button onClick={printPage} className="text-left text-sm text-white/65 hover:text-white border border-white/10 hover:border-white/30 rounded-md px-3 py-2 transition-all">
              Print for offline use
            </button>
            <a href={reportUrl} className="text-left text-sm text-white/65 hover:text-white border border-white/10 hover:border-white/30 rounded-md px-3 py-2 transition-all">
              Report an error / correction
            </a>
          </div>
        </div>

        {/* Lead capture CTA */}
        <div className="bg-brand-500/[0.04] border border-brand-500/20 rounded-xl p-5">
          <h3 className="text-brand-400 text-xs font-mono uppercase tracking-[0.3em] mb-3">Need help planning?</h3>
          <p className="text-white/75 text-sm leading-relaxed mb-4">
            Get a custom Nepal itinerary built around {contentName}. We'll match you with vetted local operators.
          </p>
          <a
            href={`/plan?destination=${encodeURIComponent(contentName)}`}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium tracking-wide transition-all"
          >
            Plan a trip <span>→</span>
          </a>
        </div>
      </div>

      <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest mt-10 text-center">
        Hidden Nepal — Editorial travel platform. See <a href="/about" className="text-white/60 hover:text-white">about</a> for full disclaimer.
      </p>
    </section>
  );
}
