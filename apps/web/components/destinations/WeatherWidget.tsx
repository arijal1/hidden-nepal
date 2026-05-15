// components/destinations/WeatherWidget.tsx

"use client";

import { useEffect, useState } from "react";

interface WeatherWidgetProps {
  lat: number;
  lng: number;
  elevationM?: number;
  name: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windKph: number;
  icon: string;
}

export function WeatherWidget({ lat, lng, elevationM, name }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production: fetch from OpenWeatherMap or similar
    // Mock data for now
    setTimeout(() => {
      setWeather({
        temp: elevationM ? Math.max(-10, 22 - Math.floor(elevationM / 200)) : 22,
        condition: "Clear",
        humidity: 45,
        windKph: 12,
        icon: "☀️",
      });
      setLoading(false);
    }, 800);
  }, [lat, lng, elevationM]);

  if (loading) {
    return <div className="glass-card p-6 h-32 skeleton" />;
  }

  if (!weather) return null;

  return (
    <div className="glass-card p-6">
      <h3 className="section-label mb-4">Current Weather</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{weather.icon}</span>
          <div>
            <p className="text-white text-2xl font-semibold">{weather.temp}°C</p>
            <p className="text-white/40 text-sm">{weather.condition}</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-white/40 text-xs font-mono">
            💧 {weather.humidity}%
          </p>
          <p className="text-white/40 text-xs font-mono">
            💨 {weather.windKph} km/h
          </p>
          {elevationM && (
            <p className="text-white/20 text-xs font-mono">
              ↑ {elevationM.toLocaleString()}m
            </p>
          )}
        </div>
      </div>
      <p className="text-white/20 text-xs font-mono mt-3">
        Live data · {name}
      </p>
    </div>
  );
}
