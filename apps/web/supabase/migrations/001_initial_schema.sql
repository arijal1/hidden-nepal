-- ═══════════════════════════════════════════════════════════════
-- Hidden Nepal — Database Schema
-- Migration: 001_initial_schema
-- ═══════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ─── Custom Types / Enums ─────────────────────────────────────

CREATE TYPE destination_category AS ENUM (
  'city', 'village', 'lake', 'trek', 'temple',
  'waterfall', 'viewpoint', 'valley', 'park', 'cultural', 'hidden_gem'
);

CREATE TYPE trek_difficulty AS ENUM (
  'easy', 'moderate', 'strenuous', 'extreme'
);

CREATE TYPE transport_type AS ENUM (
  'flight', 'bus', 'jeep', 'trek', 'walk', 'boat', 'cable_car'
);

CREATE TYPE road_condition AS ENUM (
  'excellent', 'good', 'fair', 'poor', 'seasonal_only'
);

CREATE TYPE travel_style AS ENUM (
  'budget', 'mid_range', 'luxury', 'backpacker', 'adventure'
);

CREATE TYPE alert_severity AS ENUM (
  'info', 'warning', 'critical'
);

CREATE TYPE nepal_province AS ENUM (
  'Koshi', 'Madhesh', 'Bagmati', 'Gandaki',
  'Lumbini', 'Karnali', 'Sudurpashchim'
);

-- ─── User Profiles ────────────────────────────────────────────

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  nationality TEXT,
  travel_style travel_style,
  saved_destinations UUID[] DEFAULT '{}',
  saved_itineraries UUID[] DEFAULT '{}',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Provinces ────────────────────────────────────────────────

CREATE TABLE provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name nepal_province NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  destination_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO provinces (name, slug, description) VALUES
  ('Koshi',          'koshi',          'Home to Everest, Kanchenjunga, and the Terai wildlife parks'),
  ('Madhesh',        'madhesh',        'The fertile plains with rich culture and Janakpur Dham'),
  ('Bagmati',        'bagmati',        'Capital region — Kathmandu Valley, Langtang, and sacred temples'),
  ('Gandaki',        'gandaki',        'Annapurna, Mustang, Pokhara and the heart of Himalayan trekking'),
  ('Lumbini',        'lumbini',        'Birthplace of Buddha, ancient ruins, and the Terai'),
  ('Karnali',        'karnali',        'Remote Dolpa, Rara Lake, and untouched wilderness'),
  ('Sudurpashchim',  'sudurpashchim',  'Himalayan west — Api Nampa, Khaptad, and indigenous cultures');

-- ─── Destinations ─────────────────────────────────────────────

CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_nepali TEXT,
  tagline TEXT,
  description TEXT,
  province nepal_province NOT NULL,
  province_id UUID REFERENCES provinces(id) ON DELETE SET NULL,
  category destination_category NOT NULL,
  is_hidden_gem BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,

  -- Geo (PostGIS)
  coordinates GEOGRAPHY(POINT, 4326),
  elevation_m INTEGER,

  -- Travel info
  best_season TEXT[] DEFAULT '{}',
  avg_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,

  -- Media
  cover_image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  video_url TEXT,

  -- Content
  tags TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  warnings TEXT[] DEFAULT '{}',

  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  fts tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(tagline, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(tags, ' ')), 'D')
  ) STORED,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_destinations_slug ON destinations(slug);
CREATE INDEX idx_destinations_province ON destinations(province);
CREATE INDEX idx_destinations_category ON destinations(category);
CREATE INDEX idx_destinations_featured ON destinations(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_destinations_gems ON destinations(is_hidden_gem) WHERE is_hidden_gem = TRUE;
CREATE INDEX idx_destinations_published ON destinations(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_destinations_rating ON destinations(avg_rating DESC);
CREATE INDEX idx_destinations_fts ON destinations USING GIN(fts);
CREATE INDEX idx_destinations_geo ON destinations USING GIST(coordinates);

-- ─── Transport Routes (How To Reach) ──────────────────────────

CREATE TABLE transport_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  from_location TEXT NOT NULL,
  transport_type transport_type NOT NULL,
  duration_hours DECIMAL(5,1),
  cost_min_npr INTEGER,
  cost_max_npr INTEGER,
  description TEXT,
  road_condition road_condition,
  notes TEXT,
  is_recommended BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transport_destination ON transport_routes(destination_id);

-- ─── Trekking Routes ──────────────────────────────────────────

CREATE TABLE treks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  difficulty trek_difficulty NOT NULL,
  duration_days INTEGER NOT NULL,
  max_elevation_m INTEGER,
  start_point TEXT,
  end_point TEXT,
  distance_km DECIMAL(6,1),
  permit_required BOOLEAN DEFAULT FALSE,
  permit_info TEXT,
  permit_cost_usd INTEGER,
  best_season TEXT[] DEFAULT '{}',
  emergency_contacts JSONB DEFAULT '[]',
  waypoints GEOGRAPHY(LINESTRING, 4326),
  elevation_profile JSONB DEFAULT '[]',    -- [{distanceKm, elevationM, label}]
  highlights TEXT[] DEFAULT '{}',
  packing_list TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  cover_image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  avg_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  fts tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_treks_slug ON treks(slug);
CREATE INDEX idx_treks_difficulty ON treks(difficulty);
CREATE INDEX idx_treks_published ON treks(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_treks_fts ON treks USING GIN(fts);

-- ─── Trek Stages ──────────────────────────────────────────────

CREATE TABLE trek_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trek_id UUID NOT NULL REFERENCES treks(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  start_point TEXT,
  end_point TEXT,
  distance_km DECIMAL(5,1),
  duration_hours DECIMAL(4,1),
  elevation_gain_m INTEGER,
  elevation_loss_m INTEGER,
  max_elevation_m INTEGER,
  description TEXT,
  accommodation TEXT,
  meals_available TEXT[] DEFAULT '{}',
  waypoints GEOGRAPHY(LINESTRING, 4326),
  UNIQUE(trek_id, stage_number)
);

CREATE INDEX idx_trek_stages_trek ON trek_stages(trek_id);

-- ─── Hidden Gems ──────────────────────────────────────────────

CREATE TABLE hidden_gems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  story TEXT,
  region TEXT,
  province nepal_province,
  submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  coordinates GEOGRAPHY(POINT, 4326),
  cover_image_url TEXT,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gems_destination ON hidden_gems(destination_id);
CREATE INDEX idx_gems_published ON hidden_gems(is_published, is_verified) WHERE is_published = TRUE AND is_verified = TRUE;
CREATE INDEX idx_gems_upvotes ON hidden_gems(upvotes DESC);

-- ─── Saved Itineraries ────────────────────────────────────────

CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT,
  days INTEGER NOT NULL,
  budget_usd INTEGER,
  travel_style travel_style,
  interests TEXT[] DEFAULT '{}',
  trekking_level trek_difficulty DEFAULT 'moderate',
  generated_plan JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_itineraries_user ON itineraries(user_id);
CREATE INDEX idx_itineraries_public ON itineraries(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_itineraries_share ON itineraries(share_token);

-- ─── Reviews ──────────────────────────────────────────────────

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
  trek_id UUID REFERENCES treks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  visited_at DATE,
  season_visited TEXT,
  media_urls TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT review_target CHECK (
    (destination_id IS NOT NULL AND trek_id IS NULL) OR
    (trek_id IS NOT NULL AND destination_id IS NULL)
  )
);

CREATE INDEX idx_reviews_destination ON reviews(destination_id) WHERE destination_id IS NOT NULL;
CREATE INDEX idx_reviews_trek ON reviews(trek_id) WHERE trek_id IS NOT NULL;
CREATE INDEX idx_reviews_published ON reviews(is_published) WHERE is_published = TRUE;

-- Auto-update avg_rating on destinations
CREATE OR REPLACE FUNCTION update_destination_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE destinations
    SET
      avg_rating = COALESCE((
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM reviews
        WHERE destination_id = OLD.destination_id AND is_published = TRUE
      ), 0),
      review_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE destination_id = OLD.destination_id AND is_published = TRUE
      )
    WHERE id = OLD.destination_id;
  ELSE
    UPDATE destinations
    SET
      avg_rating = COALESCE((
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM reviews
        WHERE destination_id = NEW.destination_id AND is_published = TRUE
      ), 0),
      review_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE destination_id = NEW.destination_id AND is_published = TRUE
      )
    WHERE id = NEW.destination_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_destination_rating();

-- ─── Safety Alerts ────────────────────────────────────────────

CREATE TABLE safety_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'info',
  region TEXT,
  province nepal_province,
  destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_active ON safety_alerts(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_alerts_province ON safety_alerts(province);

-- ─── Festivals ────────────────────────────────────────────────

CREATE TABLE festivals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name_nepali TEXT,
  description TEXT,
  cultural_significance TEXT,
  month_start INTEGER CHECK (month_start BETWEEN 1 AND 12),
  month_end INTEGER CHECK (month_end BETWEEN 1 AND 12),
  destinations UUID[] DEFAULT '{}',
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Nearby Destinations (PostGIS RPC) ───────────────────────

CREATE OR REPLACE FUNCTION nearby_destinations(
  lat FLOAT,
  lng FLOAT,
  radius_km FLOAT DEFAULT 50,
  result_limit INTEGER DEFAULT 6
)
RETURNS SETOF destinations AS $$
BEGIN
  RETURN QUERY
  SELECT d.*
  FROM destinations d
  WHERE
    d.is_published = TRUE AND
    ST_DWithin(
      d.coordinates,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_km * 1000  -- convert to meters
    ) AND
    ST_Distance(
      d.coordinates,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) > 0  -- exclude the destination itself
  ORDER BY
    ST_Distance(
      d.coordinates,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) ASC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- ─── Updated At Triggers ──────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER destinations_updated_at
  BEFORE UPDATE ON destinations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER treks_updated_at
  BEFORE UPDATE ON treks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
