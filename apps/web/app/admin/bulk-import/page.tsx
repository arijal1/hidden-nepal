import { OSM_BULK_CATEGORIES } from "@/lib/content/openstreetmap";
import { BulkImportClient } from "./BulkImportClient";

export default function BulkImportPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-white font-display text-2xl font-semibold">
          Bulk Import Tool
        </h1>
        <p className="text-white/35 text-sm mt-1">
          Import hundreds of Nepal locations at once using OpenStreetMap + Wikipedia + AI
        </p>
      </div>

      {/* Data pipeline diagram */}
      <div className="glass-card p-5 mb-8">
        <p className="text-white/40 text-xs font-mono uppercase tracking-wider mb-4">
          Data Pipeline
        </p>
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {[
            { icon:"🗺", label:"OpenStreetMap", sub:"Coordinates, names, tags" },
            { icon:"→", label:"", sub:"" },
            { icon:"📖", label:"Wikipedia", sub:"Description, images" },
            { icon:"→", label:"", sub:"" },
            { icon:"🌤", label:"OpenWeatherMap", sub:"Best seasons" },
            { icon:"→", label:"", sub:"" },
            { icon:"✦", label:"GPT-4o Mini", sub:"Tagline, highlights, SEO" },
            { icon:"→", label:"", sub:"" },
            { icon:"◈", label:"Supabase", sub:"Saved to database" },
          ].map((step, i) => step.label ? (
            <div key={i} className="text-center flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-lg mb-1.5">
                {step.icon}
              </div>
              <p className="text-white/70 text-xs font-medium whitespace-nowrap">{step.label}</p>
              <p className="text-white/25 text-[9px] whitespace-nowrap mt-0.5">{step.sub}</p>
            </div>
          ) : (
            <span key={i} className="text-white/20 text-lg flex-shrink-0">→</span>
          ))}
        </div>
      </div>

      <BulkImportClient categories={[...OSM_BULK_CATEGORIES]} />
    </div>
  );
}
