"use client";

import { useEffect, useRef, useState } from "react";
import type { TrekRoute } from "@/lib/content/trek-routes";

export function TrekRouteMap({ route }: { route: TrekRoute }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      setError(true);
      return;
    }

    import("mapbox-gl").then((mod) => {
      const mapboxgl: any = mod.default ?? mod;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      // Calc bounds
      const lngs = route.waypoints.map(w => w.lng);
      const lats = route.waypoints.map(w => w.lat);
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lngs) - 0.05, Math.min(...lats) - 0.05],
        [Math.max(...lngs) + 0.05, Math.max(...lats) + 0.05],
      ];

      const map = new mapboxgl.Map({
        container: mapRef.current!,
        style: "mapbox://styles/mapbox/outdoors-v12",
        bounds,
        fitBoundsOptions: { padding: 60, pitch: 50 },
      });

      map.on("load", () => {
        // 3D terrain
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

        // Add route line
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: route.waypoints.map(w => [w.lng, w.lat]),
            },
          },
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#d97a3a",
            "line-width": 4,
            "line-opacity": 0.9,
          },
          layout: { "line-cap": "round", "line-join": "round" },
        });
        map.addLayer({
          id: "route-glow",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#d97a3a",
            "line-width": 12,
            "line-opacity": 0.25,
            "line-blur": 4,
          },
          layout: { "line-cap": "round", "line-join": "round" },
        }, "route-line");

        // Add waypoint markers
        route.waypoints.forEach((wp, idx) => {
          const isHighlight = !!wp.note;
          const isLast = idx === route.waypoints.length - 1;
          const isFirst = idx === 0;

          const el = document.createElement("div");
          el.style.cssText = `
            width: ${isFirst || isLast || isHighlight ? "26px" : "18px"};
            height: ${isFirst || isLast || isHighlight ? "26px" : "18px"};
            background: ${isFirst ? "#52b788" : isLast ? "#c84630" : isHighlight ? "#e9a829" : "#d97a3a"};
            border: 3px solid #0f1419;
            border-radius: 50%;
            box-shadow: 0 0 0 2px ${isFirst ? "#52b788" : isLast ? "#c84630" : isHighlight ? "#e9a829" : "#d97a3a"};
            cursor: pointer;
          `;

          const popup = new mapboxgl.Popup({ offset: 18, closeButton: false }).setHTML(`
            <div style="font-family: system-ui; color: #1a1a1a; padding: 4px;">
              <div style="font-weight: 600; font-size: 14px;">${wp.name}</div>
              <div style="font-size: 12px; color: #555; margin-top: 2px;">
                ${wp.elevation}m${wp.day ? ` · Day ${wp.day}` : ""}
              </div>
              ${wp.note ? `<div style="font-size: 11px; color: #777; margin-top: 4px; max-width: 200px;">${wp.note}</div>` : ""}
            </div>
          `);

          new mapboxgl.Marker(el)
            .setLngLat([wp.lng, wp.lat])
            .setPopup(popup)
            .addTo(map);
        });

        // Nav controls
        map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");
      });

      return () => map.remove();
    });
  }, [route]);

  if (error) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center text-white/50">
        Map unavailable (missing Mapbox token)
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
}
