// Approximate trek route data — major waypoints + line geometry
// Sourced from OpenStreetMap trek relations + standard trekking guides

export interface Waypoint {
  name: string;
  lng: number;
  lat: number;
  elevation: number;
  day?: number;
  note?: string;
}

export interface TrekRoute {
  slug: string;
  name: string;
  waypoints: Waypoint[];
  // Approximate trekking line (subset of waypoints often suffices for visual)
}

export const TREK_ROUTES: Record<string, TrekRoute> = {
  "everest-base-camp": {
    slug: "everest-base-camp",
    name: "Everest Base Camp Trek",
    waypoints: [
      { name: "Lukla", lng: 86.7311, lat: 27.6869, elevation: 2860, day: 1, note: "Flight from Kathmandu" },
      { name: "Phakding", lng: 86.7124, lat: 27.7434, elevation: 2610, day: 1 },
      { name: "Namche Bazaar", lng: 86.7142, lat: 27.8050, elevation: 3440, day: 2, note: "Acclimatization day" },
      { name: "Tengboche", lng: 86.7641, lat: 27.8366, elevation: 3860, day: 4, note: "Famous monastery" },
      { name: "Dingboche", lng: 86.8311, lat: 27.8919, elevation: 4410, day: 5, note: "Second acclimatization" },
      { name: "Lobuche", lng: 86.8089, lat: 27.9445, elevation: 4910, day: 7 },
      { name: "Gorak Shep", lng: 86.8281, lat: 27.9819, elevation: 5164, day: 8 },
      { name: "Everest Base Camp", lng: 86.8528, lat: 28.0026, elevation: 5364, day: 8, note: "The destination" },
      { name: "Kala Patthar", lng: 86.8221, lat: 27.9846, elevation: 5545, day: 9, note: "Best Everest viewpoint" },
    ],
  },
  "annapurna-circuit": {
    slug: "annapurna-circuit",
    name: "Annapurna Circuit",
    waypoints: [
      { name: "Besisahar", lng: 84.3789, lat: 28.2331, elevation: 760, day: 1, note: "Trailhead" },
      { name: "Chame", lng: 84.2419, lat: 28.5475, elevation: 2710, day: 3 },
      { name: "Pisang", lng: 84.1567, lat: 28.6325, elevation: 3200, day: 4 },
      { name: "Manang", lng: 84.0167, lat: 28.6700, elevation: 3540, day: 5, note: "Acclimatization village" },
      { name: "Thorong Phedi", lng: 83.9333, lat: 28.7833, elevation: 4540, day: 8 },
      { name: "Thorong La Pass", lng: 83.9389, lat: 28.7889, elevation: 5416, day: 9, note: "High point of circuit" },
      { name: "Muktinath", lng: 83.8667, lat: 28.8167, elevation: 3800, day: 9, note: "Sacred Hindu/Buddhist site" },
      { name: "Jomsom", lng: 83.7233, lat: 28.7833, elevation: 2720, day: 11 },
      { name: "Tatopani", lng: 83.6500, lat: 28.5000, elevation: 1189, day: 13, note: "Hot springs" },
      { name: "Ghorepani / Poon Hill", lng: 83.6979, lat: 28.4017, elevation: 2860, day: 14, note: "Sunrise viewpoint" },
    ],
  },
  "manaslu-circuit": {
    slug: "manaslu-circuit",
    name: "Manaslu Circuit",
    waypoints: [
      { name: "Soti Khola", lng: 84.8167, lat: 28.1167, elevation: 730, day: 1, note: "Trailhead" },
      { name: "Machha Khola", lng: 84.8333, lat: 28.2667, elevation: 900, day: 2 },
      { name: "Jagat", lng: 84.8000, lat: 28.3833, elevation: 1410, day: 3, note: "Restricted area entry" },
      { name: "Deng", lng: 84.7333, lat: 28.4500, elevation: 1860, day: 4 },
      { name: "Namrung", lng: 84.7167, lat: 28.5333, elevation: 2630, day: 5 },
      { name: "Samagaon", lng: 84.6333, lat: 28.6500, elevation: 3530, day: 7, note: "Acclimatization day" },
      { name: "Samdo", lng: 84.6667, lat: 28.6667, elevation: 3860, day: 9 },
      { name: "Larkya La Pass", lng: 84.6000, lat: 28.6667, elevation: 5160, day: 11, note: "Highest point" },
      { name: "Bimthang", lng: 84.5167, lat: 28.5833, elevation: 3720, day: 11 },
      { name: "Dharapani", lng: 84.3667, lat: 28.5167, elevation: 1860, day: 13, note: "Joins Annapurna Circuit" },
    ],
  },
  "langtang-valley": {
    slug: "langtang-valley",
    name: "Langtang Valley Trek",
    waypoints: [
      { name: "Syabrubesi", lng: 85.3500, lat: 28.1500, elevation: 1460, day: 1, note: "Trailhead" },
      { name: "Lama Hotel", lng: 85.4500, lat: 28.1667, elevation: 2470, day: 2 },
      { name: "Langtang Village", lng: 85.5167, lat: 28.2167, elevation: 3430, day: 3, note: "Rebuilt after 2015 quake" },
      { name: "Kyanjin Gompa", lng: 85.5667, lat: 28.2167, elevation: 3870, day: 4, note: "Sacred monastery" },
      { name: "Tserko Ri", lng: 85.5667, lat: 28.2333, elevation: 4984, day: 5, note: "Day-hike viewpoint" },
    ],
  },
  "mardi-himal": {
    slug: "mardi-himal",
    name: "Mardi Himal Trek",
    waypoints: [
      { name: "Kande", lng: 83.8500, lat: 28.3000, elevation: 1770, day: 1, note: "Trailhead, 1hr from Pokhara" },
      { name: "Forest Camp", lng: 83.9000, lat: 28.3500, elevation: 2600, day: 1 },
      { name: "Low Camp", lng: 83.9333, lat: 28.4000, elevation: 3150, day: 2 },
      { name: "High Camp", lng: 83.9500, lat: 28.4500, elevation: 3580, day: 3 },
      { name: "Mardi Himal Base Camp", lng: 83.9667, lat: 28.4833, elevation: 4500, day: 4, note: "Stunning Annapurna South close-up" },
    ],
  },
};

export function getTrekRoute(slug: string): TrekRoute | null {
  return TREK_ROUTES[slug] ?? null;
}
