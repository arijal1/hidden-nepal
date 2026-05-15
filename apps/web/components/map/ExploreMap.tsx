"use client";

import { useEffect, useRef, useState } from "react";
import type { MapMarkerData } from "@/types";

interface ExploreMapProps {
  markers: MapMarkerData[];
}

export function ExploreMap({ markers }: ExploreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return;

    import("mapbox-gl").then((module) => {
      const mapboxgl = module.default ?? module;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const map = new mapboxgl.Map({
        container: mapRef.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [84.124, 28.394], // Nepal center
        zoom: 6.5,
        pitch: 30,
      });

      map.on("load", () => {
        // Add terrain
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
        });
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.3 });

        // Add all markers
        markers.forEach((marker) => {
          const el = document.createElement("div");
          el.style.cssText = `
            width: 28px; height: 28px;
            background: linear-gradient(135deg, #2d6a4f, #52b788);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(45,106,79,0.5);
            cursor: pointer;
          `;

          const popup = new mapboxgl.Popup({ offset: 32, closeButton: false })
            .setHTML(`
              <div style="font-family: sans-serif; min-width: 160px;">
                <p style="color: rgba(255,255,255,0.4); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 3px;">Nepal</p>
                <p style="color: white; font-size: 14px; font-weight: 600; margin: 0;">${marker.label}</p>
                <a href="/destinations/${marker.slug}"
                  style="color: #52b788; font-size: 11px; text-decoration: none; display: block; margin-top: 6px;"
                  onclick="event.stopPropagation()">
                  View destination →
                </a>
              </div>
            `);

          new mapboxgl.Marker({ element: el, anchor: "bottom" })
            .setLngLat([marker.coordinates.lng, marker.coordinates.lat])
            .setPopup(popup)
            .addTo(map);
        });

        setLoaded(true);
      });
    });
  }, [markers]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.07]" style={{ height: 560 }}>
      {!loaded && (
        <div className="absolute inset-0 skeleton flex items-center justify-center z-10">
          <p className="text-white/30 text-sm font-mono">Loading map…</p>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-card px-3 py-2 text-xs font-mono text-white/40">
        {markers.length} destinations mapped
      </div>
    </div>
  );
}
