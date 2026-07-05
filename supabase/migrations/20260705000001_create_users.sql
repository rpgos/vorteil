-- Create enum-like check helpers via domains for reuse
-- Using check constraints on text columns for flexibility

CREATE TABLE public.users (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text        NOT NULL,
  name        text        NOT NULL,
  gender      text        NOT NULL CHECK (gender IN ('female', 'male')),
  -- German LK ranking 1.0–25.0; null when not provided
  lk_level    numeric(4,1) CHECK (lk_level BETWEEN 1.0 AND 25.0),
  -- Required when lk_level is null
  level       text        CHECK (level IN ('beginner', 'intermediate', 'advanced', 'pro')),
  dominant_hand text      CHECK (dominant_hand IN ('right', 'left')),
  home_club   text,
  roles       text[]      NOT NULL DEFAULT '{player}'
                          CHECK (roles <@ ARRAY['player', 'admin']::text[]),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  -- At least one skill indicator must be set
  CONSTRAINT chk_skill_indicator CHECK (lk_level IS NOT NULL OR level IS NOT NULL)
);

-- Keep updated_at current automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_users_email ON public.users (email);

-- ── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read any profile (needed for league/match views)
CREATE POLICY "Authenticated users can read all profiles"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insertion is handled by a trigger on auth.users (see below); block direct inserts
-- except via service role
CREATE POLICY "Block direct inserts"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (false);
