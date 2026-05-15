-- ═══════════════════════════════════════════════════════════════
-- Hidden Nepal — Row Level Security Policies
-- Migration: 002_rls_policies
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE treks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE trek_stages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidden_gems      ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_alerts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE festivals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces        ENABLE ROW LEVEL SECURITY;

-- ─── Helper: is_admin ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── Provinces (public read) ──────────────────────────────────

CREATE POLICY "provinces_public_read"
  ON provinces FOR SELECT
  USING (TRUE);

CREATE POLICY "provinces_admin_write"
  ON provinces FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── Destinations (published = public) ───────────────────────

CREATE POLICY "destinations_public_read"
  ON destinations FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "destinations_admin_all"
  ON destinations FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── Transport Routes (public read) ───────────────────────────

CREATE POLICY "transport_public_read"
  ON transport_routes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM destinations d
      WHERE d.id = destination_id AND d.is_published = TRUE
    )
  );

CREATE POLICY "transport_admin_write"
  ON transport_routes FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── Treks (published = public) ───────────────────────────────

CREATE POLICY "treks_public_read"
  ON treks FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "treks_admin_all"
  ON treks FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── Trek Stages ──────────────────────────────────────────────

CREATE POLICY "trek_stages_public_read"
  ON trek_stages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM treks t
      WHERE t.id = trek_id AND t.is_published = TRUE
    )
  );

CREATE POLICY "trek_stages_admin_write"
  ON trek_stages FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── Hidden Gems (verified + published = public) ──────────────

CREATE POLICY "gems_public_read"
  ON hidden_gems FOR SELECT
  USING (is_published = TRUE AND is_verified = TRUE);

CREATE POLICY "gems_auth_insert"
  ON hidden_gems FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "gems_owner_update"
  ON hidden_gems FOR UPDATE
  USING (auth.uid() = submitted_by)
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "gems_admin_all"
  ON hidden_gems FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── Itineraries ─────────────────────────────────────────────

CREATE POLICY "itineraries_public_shared"
  ON itineraries FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "itineraries_owner_all"
  ON itineraries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "itineraries_anon_insert"
  ON itineraries FOR INSERT
  WITH CHECK (TRUE);  -- Allow anonymous itinerary creation

CREATE POLICY "itineraries_admin_all"
  ON itineraries FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── Reviews ─────────────────────────────────────────────────

CREATE POLICY "reviews_public_read"
  ON reviews FOR SELECT
  USING (is_published = TRUE AND is_flagged = FALSE);

CREATE POLICY "reviews_auth_insert"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "reviews_owner_update"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_admin_all"
  ON reviews FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── Profiles ────────────────────────────────────────────────

CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "profiles_owner_update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── Safety Alerts (public read) ─────────────────────────────

CREATE POLICY "alerts_public_read"
  ON safety_alerts FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "alerts_admin_all"
  ON safety_alerts FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── Festivals ───────────────────────────────────────────────

CREATE POLICY "festivals_public_read"
  ON festivals FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "festivals_admin_all"
  ON festivals FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
