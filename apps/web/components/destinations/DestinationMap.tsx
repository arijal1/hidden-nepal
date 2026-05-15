// components/destinations/DestinationMap.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import type { Coordinates } from "@/types";

interface DestinationMapProps {
  coordinates: Coordinates;
  name: string;
}

export function DestinationMap({ coordinates, name }: DestinationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      setError(true);
      return;
    }

    let mapboxgl: typeof import("mapbox-gl");

    import("mapbox-gl").then((module) => {
      mapboxgl = module.default ?? module;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const map = new mapboxgl.Map({
        container: mapRef.current!,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [coordinates.lng, coordinates.lat],
        zoom: 10,
        pitch: 60,
        bearing: -20,
        antialias: true,
      });

      map.on("load", () => {
        // Add 3D terrain
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

        // Marker
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.innerHTML = `
          <div style="
            width: 48px; height: 48px;
            background: linear-gradient(135deg, #2d6a4f, #52b788);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 8px 24px rgba(45,106,79,0.5);
            display: flex; align-items: center; justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-size: 18px;">◈</span>
          </div>
        `;

        new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([coordinates.lng, coordinates.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 56, closeButton: false })
              .setHTML(`
                <div style="font-family: 'DM Sans', sans-serif;">
                  <p style="color: rgba(255,255,255,0.4); font-size: 10px; letter-spacing: 0.1em; margin: 0 0 4px; font-family: 'DM Mono', monospace; text-transform: uppercase;">
                    Hidden Nepal
                  </p>
                  <p style="color: white; font-size: 16px; font-weight: 600; margin: 0;">
                    ${name}
                  </p>
                  <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 4px 0 0; font-family: 'DM Mono', monospace;">
                    ${coordinates.lat.toFixed(4)}°N ${coordinates.lng.toFixed(4)}°E
                  </p>
                </div>
              `)
          )
          .addTo(map);

        setLoaded(true);
      });

      map.on("error", () => setError(true));
      mapInstanceRef.current = map;
    });

    return () => {
      mapInstanceRef.current?.remove();
    };
  }, [coordinates, name]);

  if (error) {
    return (
      <div className="h-64 rounded-2xl border border-white/[0.07] bg-white/[0.02] flex items-center justify-center">
        <p className="text-white/30 text-sm font-mono">
          📍 {coordinates.lat.toFixed(4)}°N, {coordinates.lng.toFixed(4)}°E
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-80 rounded-2xl overflow-hidden border border-white/[0.07]">
      {!loaded && (
        <div className="absolute inset-0 skeleton z-10" />
      )}
      <div ref={mapRef} className="w-full h-full" />

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 flex gap-2 z-10">
        <button
          onClick={() => mapInstanceRef.current?.easeTo({ pitch: 60, bearing: -20, zoom: 10 })}
          className="glass-card px-3 py-2 text-xs font-mono text-white/60 hover:text-white/90 transition-colors"
        >
          3D View
        </button>
        <button
          onClick={() => mapInstanceRef.current?.easeTo({ pitch: 0, bearing: 0, zoom: 9 })}
          className="glass-card px-3 py-2 text-xs font-mono text-white/60 hover:text-white/90 transition-colors"
        >
          Map View
        </button>
      </div>
    </div>
  );
}
