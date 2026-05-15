// ─────────────────────────────────────────────────────
// Hidden Nepal — Global Type Definitions
// ─────────────────────────────────────────────────────

// ─── Enums ────────────────────────────────────────────

export type DestinationCategory =
  | "city"
  | "village"
  | "lake"
  | "trek"
  | "temple"
  | "waterfall"
  | "viewpoint"
  | "valley"
  | "park"
  | "cultural"
  | "hidden_gem";

export type TrekDifficulty = "easy" | "moderate" | "strenuous" | "extreme";

export type TransportType =
  | "flight"
  | "bus"
  | "jeep"
  | "trek"
  | "walk"
  | "boat"
  | "cable_car";

export type RoadCondition =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "seasonal_only";

export type TravelStyle =
  | "budget"
  | "mid_range"
  | "luxury"
  | "backpacker"
  | "adventure";

export type AlertSeverity = "info" | "warning" | "critical";

export type Province =
  | "Koshi"
  | "Madhesh"
  | "Bagmati"
  | "Gandaki"
  | "Lumbini"
  | "Karnali"
  | "Sudurpashchim";

// ─── Geo Types ────────────────────────────────────────

export interface Coordinates {
  lat: number;
  lng: number;
}

// ─── Destination ──────────────────────────────────────

export interface Destination {
  id: string;
  slug: string;
  name: string;
  nameNepali?: string;
  tagline: string;
  description: string;
  province: Province;
  category: DestinationCategory;
  isHiddenGem: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  coordinates: Coordinates;
  elevationM?: number;
  bestSeason: string[];
  avgRating: number;
  reviewCount: number;
  coverImageUrl: string;
  galleryUrls: string[];
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  transportRoutes?: TransportRoute[];
  nearbyDestinations?: NearbyDestination[];
  createdAt: string;
  updatedAt: string;
}

export interface NearbyDestination {
  id: string;
  slug: string;
  name: string;
  category: DestinationCategory;
  coverImageUrl: string;
  distanceKm: number;
  avgRating: number;
}

// ─── Transport / How To Reach ─────────────────────────

export interface TransportRoute {
  id: string;
  destinationId: string;
  fromLocation: string;
  transportType: TransportType;
  durationHours: number;
  costMinNpr?: number;
  costMaxNpr?: number;
  description: string;
  roadCondition?: RoadCondition;
  notes?: string;
}

// ─── Trekking ─────────────────────────────────────────

export interface Trek {
  id: string;
  slug: string;
  name: string;
  description: string;
  difficulty: TrekDifficulty;
  durationDays: number;
  maxElevationM: number;
  startPoint: string;
  endPoint: string;
  distanceKm: number;
  permitRequired: boolean;
  permitInfo?: string;
  permitCostUsd?: number;
  bestSeason: string[];
  emergencyContacts: EmergencyContact[];
  elevationProfile: ElevationPoint[];
  stages: TrekStage[];
  isPublished: boolean;
  coverImageUrl: string;
  galleryUrls: string[];
}

export interface TrekStage {
  id: string;
  trekId: string;
  stageNumber: number;
  name: string;
  startPoint: string;
  endPoint: string;
  distanceKm: number;
  durationHours: number;
  elevationGainM: number;
  description: string;
  accommodation?: string;
  mealsAvailable: string[];
}

export interface ElevationPoint {
  distanceKm: number;
  elevationM: number;
  label?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  type: "hospital" | "rescue" | "police" | "embassy";
}

// ─── Hidden Gems ──────────────────────────────────────

export interface HiddenGem {
  id: string;
  destinationId?: string;
  title: string;
  story: string;
  submittedBy?: UserProfile;
  isVerified: boolean;
  isPublished: boolean;
  coordinates: Coordinates;
  coverImageUrl: string;
  upvotes: number;
  region: string;
  createdAt: string;
}

// ─── AI Itinerary ─────────────────────────────────────

export interface ItineraryInput {
  days: number;
  budgetUsd: number;
  travelStyle: TravelStyle;
  interests: string[];
  trekkingLevel: TrekDifficulty;
  startDate?: string;
  startCity?: string;
  endCity?: string;
}

export interface GeneratedItinerary {
  title: string;
  summary: string;
  totalBudgetBreakdown: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
  };
  days: ItineraryDay[];
  packingList: string[];
  permits: PermitInfo[];
  hiddenGems: ItineraryGem[];
}

export interface ItineraryDay {
  day: number;
  location: string;
  theme: string;
  accommodation: {
    name: string;
    type: string;
    estimatedCostUsd: number;
  };
  activities: {
    time: string;
    title: string;
    description: string;
    hiddenGem: boolean;
    coordinates?: Coordinates;
  }[];
  meals: {
    meal: "breakfast" | "lunch" | "dinner";
    suggestion: string;
    localDish: string;
  }[];
  transport: {
    from: string;
    to: string;
    method: string;
    estimatedCostUsd: number;
    duration: string;
  };
  tips: string[];
  emergencyInfo: {
    nearestHospital: string;
    emergencyContact: string;
  };
}

export interface PermitInfo {
  name: string;
  cost: string;
  whereToGet: string;
}

export interface ItineraryGem {
  name: string;
  why: string;
  coordinates: [number, number];
}

// ─── Itinerary (saved) ────────────────────────────────

export interface SavedItinerary {
  id: string;
  userId: string;
  title: string;
  days: number;
  budgetUsd: number;
  travelStyle: TravelStyle;
  interests: string[];
  trekkingLevel: TrekDifficulty;
  generatedPlan: GeneratedItinerary;
  isPublic: boolean;
  shareToken: string;
  createdAt: string;
}

// ─── Community / Reviews ──────────────────────────────

export interface Review {
  id: string;
  destinationId: string;
  user: UserProfile;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  visitedAt?: string;
  mediaUrls: string[];
  isPublished: boolean;
  helpfulCount: number;
  createdAt: string;
}

// ─── User ─────────────────────────────────────────────

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio?: string;
  nationality?: string;
  travelStyle?: TravelStyle;
  savedDestinations: string[];
  savedItineraries: string[];
}

// ─── Safety ───────────────────────────────────────────

export interface SafetyAlert {
  id: string;
  title: string;
  body: string;
  severity: AlertSeverity;
  region?: string;
  destinationId?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

// ─── Festivals ────────────────────────────────────────

export interface Festival {
  id: string;
  name: string;
  slug: string;
  description: string;
  culturalSignificance: string;
  monthStart: number;
  monthEnd: number;
  destinations: string[];
  coverImageUrl: string;
}

// ─── Search ───────────────────────────────────────────

export interface SearchResult {
  id: string;
  type: "destination" | "trek" | "hidden_gem" | "festival";
  slug: string;
  name: string;
  tagline?: string;
  coverImageUrl: string;
  category?: DestinationCategory;
  difficulty?: TrekDifficulty;
}

export interface SearchFilters {
  category?: DestinationCategory;
  province?: Province;
  difficulty?: TrekDifficulty;
  isHiddenGem?: boolean;
  bestSeason?: string;
  query?: string;
}

// ─── API Responses ────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Map ──────────────────────────────────────────────

export interface MapMarkerData {
  id: string;
  coordinates: Coordinates;
  type: "destination" | "trek" | "gem" | "safety";
  label: string;
  slug: string;
  coverImageUrl?: string;
}
