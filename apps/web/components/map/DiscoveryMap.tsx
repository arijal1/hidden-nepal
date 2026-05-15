"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { MapMarkerData } from "@/types";
import { MapSearchBar } from "./MapSearchBar";

interface DiscoveryMapProps {
  markers: MapMarkerData[];
  height?: number;
  showFilters?: boolean;
}

const CATEGORIES = [
  { value: "all", label: "All", icon: "◈" },
  { value: "lake", label: "Lakes", icon: "💧" },
  { value: "trek", label: "Treks", icon: "🥾" },
  { value: "hidden_gem", label: "Hidden Gems", icon: "✦" },
  { value: "city", label: "Cities", icon: "🌆" },
  { value: "cultural", label: "Cultural", icon: "🛕" },
  { value: "viewpoint", label: "Viewpoints", icon: "🏔️" },
];

export function DiscoveryMap({
  markers,
  height = 600,
  showFilters = true,
}: DiscoveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const popupRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerData | null>(null);

  // Filter markers
  const filtered = markers.filter((m) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "hidden_gem") return m.type === "hidden_gem";
    return m.type === activeFilter;
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return;

    let mapboxgl: any;

    import("mapbox-gl").then((module) => {
      mapboxgl = module.default ?? module;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [84.124, 28.394], // Nepal center
        zoom: 6.8,
        pitch: 45,
        bearing: 0,
        antialias: true,
      });

      mapRef.current = map;

      map.on("load", () => {

        // ── 3D Terrain ──────────────────────────────
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.8 });

        // ── Sky layer ────────────────────────────────
        map.addLayer({
          id: "sky",
          type: "sky",
          paint: {
            "sky-type": "atmosphere",
            "sky-atmosphere-sun": [0.0, 90.0],
            "sky-atmosphere-sun-intensity": 15,
          },
        });

        // ── Add marker source ────────────────────────
        map.addSource("destinations", {
          type: "geojson",
          data: buildGeoJSON(markers),
          cluster: true,
          clusterMaxZoom: 10,
          clusterRadius: 50,
        });

        // ── Cluster circles ──────────────────────────
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "destinations",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step", ["get", "point_count"],
              "#2d6a4f", 5,
              "#52b788", 10,
              "#f4a261",
            ],
            "circle-radius": [
              "step", ["get", "point_count"],
              20, 5, 28, 10, 36,
            ],
            "circle-opacity": 0.85,
            "circle-stroke-width": 2,
            "circle-stroke-color": "rgba(255,255,255,0.3)",
          },
        });

        // ── Cluster count labels ─────────────────────
        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "destinations",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 13,
          },
          paint: { "text-color": "#fff" },
        });

        // ── Individual markers ───────────────────────
        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "destinations",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "match", ["get", "markerType"],
              "hidden_gem", "#f4a261",
              "lake", "#90e0ef",
              "trek", "#52b788",
              "#52b788",
            ],
            "circle-radius": [
              "interpolate", ["linear"], ["zoom"],
              6, 6,
              12, 10,
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "rgba(255,255,255,0.8)",
            "circle-opacity": 0.9,
          },
        });

        // ── Marker labels ────────────────────────────
        map.addLayer({
          id: "point-labels",
          type: "symbol",
          source: "destinations",
          filter: ["!", ["has", "point_count"]],
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 11,
            "text-offset": [0, 1.2],
            "text-anchor": "top",
            "text-optional": true,
            "text-allow-overlap": false,
          },
          paint: {
            "text-color": "#fff",
            "text-halo-color": "rgba(0,0,0,0.7)",
            "text-halo-width": 1,
            "text-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0, 10, 1],
          },
        });

        // ── Cluster click → zoom in ──────────────────
        map.on("click", "clusters", (e: any) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
          const clusterId = features[0].properties.cluster_id;
          (map.getSource("destinations") as any).getClusterExpansionZoom(
            clusterId,
            (err: any, zoom: number) => {
              if (err) return;
              map.easeTo({ center: features[0].geometry.coordinates, zoom });
            }
          );
        });

        // ── Individual marker click → popup ──────────
        map.on("click", "unclustered-point", (e: any) => {
          const feature = e.features?.[0];
          if (!feature) return;

          const { coordinates } = feature.geometry;
          const props = feature.properties;

          // Close existing popup
          if (popupRef.current) popupRef.current.remove();

          const popup = new mapboxgl.Popup({
            offset: 20,
            closeButton: true,
            maxWidth: "300px",
            className: "hidden-nepal-popup",
          })
            .setLngLat(coordinates)
            .setHTML(buildPopupHTML(props))
            .addTo(map);

          popupRef.current = popup;
        });

        // ── Cursor changes ───────────────────────────
        map.on("mouseenter", "clusters", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "clusters", () => { map.getCanvas().style.cursor = ""; });
        map.on("mouseenter", "unclustered-point", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "unclustered-point", () => { map.getCanvas().style.cursor = ""; });

        setLoaded(true);
      });
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  // Update source data when filter changes
  useEffect(() => {
    if (!mapRef.current || !loaded) return;
    const source = mapRef.current.getSource("destinations") as any;
    if (source) source.setData(buildGeoJSON(filtered));
  }, [filtered, loaded]);

  const handleFilter = useCallback((cat: string) => {
    setActiveFilter(cat);
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.07]" style={{ height }}>
      {/* Loading skeleton */}
      {!loaded && (
        <div className="absolute inset-0 skeleton flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-brand-400 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/30 text-sm font-mono">Loading map…</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Search bar */}
      <MapSearchBar
        onSelect={(lat, lng, name) => {
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [lng, lat],
              zoom: 11,
              pitch: 50,
              speed: 1.2,
              essential: true,
            });
          }
        }}
      />

      {/* Category filter pills */}
      {showFilters && (
        <div className="absolute top-4 left-4 flex gap-2 flex-wrap max-w-[calc(100%-120px)] z-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleFilter(cat.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 ${
                activeFilter === cat.value
                  ? "bg-brand-500 text-white border border-brand-400/50"
                  : "glass-card text-white/55 hover:text-white/80 border-white/[0.1]"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => mapRef.current?.easeTo({ pitch: 45, bearing: 0 })}
          className="glass-card w-9 h-9 flex items-center justify-center text-white/60 hover:text-white/90 text-xs font-mono transition-colors"
          title="3D View"
        >
          3D
        </button>
        <button
          onClick={() => mapRef.current?.easeTo({ pitch: 0, bearing: 0 })}
          className="glass-card w-9 h-9 flex items-center justify-center text-white/60 hover:text-white/90 text-xs font-mono transition-colors"
          title="Top View"
        >
          2D
        </button>
        <button
          onClick={() => mapRef.current?.easeTo({ center: [84.124, 28.394], zoom: 6.8, pitch: 45 })}
          className="glass-card w-9 h-9 flex items-center justify-center text-white/60 hover:text-white/90 text-sm transition-colors"
          title="Reset"
        >
          ⌂
        </button>
      </div>

      {/* Stats badge */}
      <div className="absolute bottom-4 left-4 glass-card px-3 py-2 text-xs font-mono text-white/40 z-10">
        {filtered.length} destinations · Click to explore
      </div>

      {/* Mapbox popup styles */}
      <style>{`
        .hidden-nepal-popup .mapboxgl-popup-content {
          background: rgba(8,13,8,0.97) !important;
          backdrop-filter: blur(24px) !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          border-radius: 16px !important;
          padding: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.7) !important;
        }
        .hidden-nepal-popup .mapboxgl-popup-tip { display: none !important; }
        .hidden-nepal-popup .mapboxgl-popup-close-button {
          color: rgba(255,255,255,0.4) !important;
          font-size: 18px !important;
          padding: 8px 12px !important;
          right: 2px !important;
          top: 2px !important;
        }
        .hidden-nepal-popup .mapboxgl-popup-close-button:hover { color: white !important; background: none !important; }
      `}</style>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────

function buildGeoJSON(markers: MapMarkerData[]) {
  return {
    type: "FeatureCollection" as const,
    features: markers
      .filter((m) => m.coordinates && m.coordinates.lng != null && m.coordinates.lat != null)
      .map((m) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [m.coordinates.lng, m.coordinates.lat],
      },
      properties: {
        id: m.id,
        name: m.label,
        slug: m.slug,
        markerType: m.type,
        coverImageUrl: m.coverImageUrl ?? "",
      },
    })),
  };
}

function buildPopupHTML(props: any): string {
  const typeColors: Record<string, string> = {
    hidden_gem: "#f4a261",
    lake: "#90e0ef",
    trek: "#52b788",
    city: "#f4a261",
    default: "#52b788",
  };
  const color = typeColors[props.markerType] ?? typeColors.default;
  const typeLabel = props.markerType?.replace("_", " ") ?? "destination";

  return `
    <div style="font-family:'DM Sans',system-ui,sans-serif; min-width:240px;">
      ${props.coverImageUrl ? `
        <div style="height:120px;overflow:hidden;border-radius:0;">
          <img src="${props.coverImageUrl}" alt="${props.name}" style="width:100%;height:100%;object-fit:cover;" />
        </div>
      ` : `<div style="height:6px;background:linear-gradient(90deg,${color}cc,${color}30);"></div>`}
      <div style="padding:14px 16px 16px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span style="border:1px solid ${color}50;background:${color}15;color:${color};font-size:9px;font-family:'DM Mono',monospace;letter-spacing:0.1em;text-transform:uppercase;padding:2px 8px;border-radius:20px;">
            ${typeLabel}
          </span>
          ${props.markerType === "hidden_gem" ? `<span style="background:linear-gradient(135deg,#e76f51,#f4a261);color:white;font-size:8px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:2px 8px;border-radius:20px;">✦ Gem</span>` : ""}
        </div>
        <h3 style="color:white;font-size:17px;font-weight:600;margin:0 0 4px;line-height:1.2;">${props.name}</h3>
        <div style="display:flex;gap:12px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.07);">
          <a href="/destinations/${props.slug}"
            style="flex:1;padding:8px;border-radius:8px;background:linear-gradient(135deg,#2d6a4f,#52b788);border:none;color:white;font-size:12px;font-weight:600;cursor:pointer;text-align:center;text-decoration:none;display:block;">
            Explore →
          </a>
          <button
            onclick="window.dispatchEvent(new CustomEvent('save-destination', {detail:'${props.slug}'}))"
            style="padding:8px 12px;border-radius:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:12px;cursor:pointer;">
            ♡
          </button>
        </div>
      </div>
    </div>
  `;
}
