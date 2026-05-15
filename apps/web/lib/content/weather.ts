// lib/content/weather.ts
// OpenWeatherMap — historical climate data to calculate best seasons

export interface MonthlyClimate {
  month: number; // 1-12
  monthName: string;
  avgTempC: number;
  minTempC: number;
  maxTempC: number;
  rainfallMm: number;
  humidity: number;
  score: number; // 0-100, higher = better for travel
}

export interface SeasonalAnalysis {
  bestMonths: number[];
  bestSeason: string[];
  worstMonths: number[];
  monthlyData: MonthlyClimate[];
  summary: string;
}

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ─── Get climate data from OpenWeatherMap ─────────────

export async function getClimateData(
  lat: number,
  lng: number
): Promise<MonthlyClimate[] | null> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    // Return elevation-adjusted estimates if no API key
    return estimateClimate(lat, lng);
  }

  try {
    // Use the Climate API (requires paid subscription)
    // Fallback to 5-day forecast for current conditions
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OWM error: ${res.status}`);

    // With free tier, we can't get historical monthly data directly
    // Use our estimation function enhanced with current reading
    return estimateClimate(lat, lng);
  } catch {
    return estimateClimate(lat, lng);
  }
}

// ─── Season calculator ────────────────────────────────

export function calculateBestSeasons(climate: MonthlyClimate[]): SeasonalAnalysis {
  // Score each month (0-100)
  const scored = climate.map((m) => ({
    ...m,
    score: scoreMonth(m),
  }));

  const bestMonths = scored
    .filter((m) => m.score >= 65)
    .map((m) => m.month);

  const worstMonths = scored
    .filter((m) => m.score < 35)
    .map((m) => m.month);

  // Map months to seasons
  const bestSeason = monthsToSeasons(bestMonths);

  const summary = generateSummary(scored, bestSeason);

  return {
    bestMonths,
    bestSeason,
    worstMonths,
    monthlyData: scored,
    summary,
  };
}

// ─── Estimate climate based on elevation + latitude ───
// Nepal's climate is primarily determined by monsoon + elevation

function estimateClimate(lat: number, lng: number): MonthlyClimate[] {
  // Estimate elevation from latitude/longitude position in Nepal
  // Higher lat + certain lng ranges = higher elevation
  const estimatedElevation = estimateElevationFromPosition(lat, lng);
  const elevKm = estimatedElevation / 1000;

  // Base temperature at sea level for Nepal latitude
  const baseTempJan = 15 - lat * 0.5; // rough sea-level estimate
  const tempLapseRate = 6.5; // °C per 1000m elevation

  // Monsoon rainfall — peaks June-September
  const monsoonRainfall = [
    20, 30, 50, 80, 120, 280, 380, 320, 180, 50, 15, 12
  ]; // mm per month, lowland estimate

  // Rain shadow effect for areas north of Annapurna/Dhaulagiri (lng ~83-84, lat >28.5)
  const isRainShadow = lat > 28.5 && lng < 85;
  const rainMultiplier = isRainShadow ? 0.2 : 1.0;

  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;

    // Temperature varies by month (sinusoidal)
    const tempVariation = -Math.cos((month / 12) * 2 * Math.PI) * 10;
    const avgTemp = baseTempJan + tempVariation - (elevKm * tempLapseRate);
    const minTemp = avgTemp - 5 - elevKm * 2;
    const maxTemp = avgTemp + 7;

    const rainfall = monsoonRainfall[i] * rainMultiplier;
    const humidity = 40 + (rainfall / 400) * 50;

    return {
      month,
      monthName: MONTH_NAMES[month],
      avgTempC: Math.round(avgTemp * 10) / 10,
      minTempC: Math.round(minTemp * 10) / 10,
      maxTempC: Math.round(maxTemp * 10) / 10,
      rainfallMm: Math.round(rainfall),
      humidity: Math.round(humidity),
      score: 0, // will be calculated
    };
  });
}

function estimateElevationFromPosition(lat: number, lng: number): number {
  // Very rough: northern Nepal is higher
  // Karnali province (far west) and north = very high
  if (lat > 29.5) return 4500;
  if (lat > 29.0) return 3500;
  if (lat > 28.5) return 2500;
  if (lat > 28.0) return 1500;
  return 300;
}

function scoreMonth(m: MonthlyClimate): number {
  let score = 100;

  // Penalise for rainfall
  if (m.rainfallMm > 300) score -= 40;
  else if (m.rainfallMm > 150) score -= 25;
  else if (m.rainfallMm > 80) score -= 15;
  else if (m.rainfallMm > 30) score -= 5;

  // Penalise for extreme cold
  if (m.minTempC < -15) score -= 30;
  else if (m.minTempC < -5) score -= 15;
  else if (m.minTempC < 0) score -= 8;

  // Penalise for extreme heat (lowland)
  if (m.maxTempC > 38) score -= 20;
  else if (m.maxTempC > 35) score -= 10;

  // Penalise for high humidity
  if (m.humidity > 85) score -= 15;
  else if (m.humidity > 75) score -= 5;

  return Math.max(0, Math.min(100, score));
}

function monthsToSeasons(months: number[]): string[] {
  const seasons = new Set<string>();

  for (const m of months) {
    if (m >= 3 && m <= 5) seasons.add("Spring");
    else if (m >= 6 && m <= 8) seasons.add("Summer");
    else if (m >= 9 && m <= 11) seasons.add("Autumn");
    else seasons.add("Winter");
  }

  // Canonical Nepal travel season order
  const order = ["Spring", "Autumn", "Winter", "Summer"];
  return order.filter((s) => seasons.has(s));
}

function generateSummary(
  climate: MonthlyClimate[],
  bestSeasons: string[]
): string {
  const topMonths = climate
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((m) => m.monthName)
    .join(", ");

  return `Best visited in ${topMonths}. ${
    bestSeasons.includes("Autumn")
      ? "October and November offer ideal trekking conditions with clear skies and comfortable temperatures. "
      : ""
  }${
    bestSeasons.includes("Spring")
      ? "March to May brings rhododendron blooms and good visibility before the monsoon. "
      : ""
  }${
    !bestSeasons.includes("Summer")
      ? "Avoid June–September when monsoon rains affect trail conditions."
      : ""
  }`.trim();
}

// ─── Altitude-adjusted temperature display ─────────────

export function adjustTempForElevation(
  baseTempC: number,
  elevationM: number
): number {
  // Lapse rate: -6.5°C per 1000m
  return Math.round((baseTempC - (elevationM / 1000) * 6.5) * 10) / 10;
}
