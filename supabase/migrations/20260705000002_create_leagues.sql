CREATE TABLE public.leagues (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    text        NOT NULL,
  city                    text        NOT NULL,
  country_code            char(2)     NOT NULL DEFAULT 'DE',
  -- Optional LK range filter (e.g. 5.0–12.0); both null = no restriction
  level_range_min         numeric(4,1) CHECK (level_range_min BETWEEN 1.0 AND 25.0),
  level_range_max         numeric(4,1) CHECK (level_range_max BETWEEN 1.0 AND 25.0),
  -- Text-based level filter (e.g. 'beginner'); alternative to numeric range
  level                   text        CHECK (level IN ('beginner', 'intermediate', 'advanced', 'pro')),
  regular_season_rounds   int         NOT NULL CHECK (regular_season_rounds > 0),
  matchmaking_type        text        NOT NULL CHECK (matchmaking_type IN ('round_robin', 'swiss', 'custom')),
  has_playoffs            boolean     NOT NULL DEFAULT false,
  regular_season_end      timestamptz NOT NULL,
  playoffs_end            timestamptz,
  max_participants        int         CHECK (max_participants > 0),
  description             text,
  status                  text        NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'open', 'in_season', 'playoffs', 'finished')),
  created_by              uuid        NOT NULL REFERENCES public.users(id),
  created_at              timestamptz NOT NULL DEFAULT now(),

  -- If a range is given, min must be <= max
  CONSTRAINT chk_level_range CHECK (
    level_range_min IS NULL
    OR level_range_max IS NULL
    OR level_range_min <= level_range_max
  ),
  -- playoffs_end only makes sense when has_playoffs is true
  CONSTRAINT chk_playoffs_end CHECK (
    has_playoffs = true OR playoffs_end IS NULL
  )
);

-- ── League memberships ───────────────────────────────────────────────────────
CREATE TABLE public.league_memberships (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.users(id)   ON DELETE CASCADE,
  league_id    uuid        NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  status       text        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  decided_at   timestamptz,

  -- A player can only have one membership per league
  CONSTRAINT uq_league_membership UNIQUE (user_id, league_id)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_leagues_city         ON public.leagues (city);
CREATE INDEX idx_leagues_country_code ON public.leagues (country_code);
CREATE INDEX idx_leagues_status       ON public.leagues (status);
CREATE INDEX idx_leagues_created_by ON public.leagues (created_by);

CREATE INDEX idx_league_memberships_user_id   ON public.league_memberships (user_id);
CREATE INDEX idx_league_memberships_league_id ON public.league_memberships (league_id);
CREATE INDEX idx_league_memberships_status    ON public.league_memberships (status);

-- ── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can view leagues
CREATE POLICY "Authenticated users can read leagues"
  ON public.leagues FOR SELECT
  TO authenticated
  USING (true);

-- Only admins (roles @> '{admin}') can create leagues
CREATE POLICY "Admins can create leagues"
  ON public.leagues FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND roles @> '{admin}'::text[]
    )
  );

-- Creator or admin can update
CREATE POLICY "Creator or admin can update league"
  ON public.leagues FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND roles @> '{admin}'::text[]
    )
  );

-- ── Memberships RLS ──────────────────────────────────────────────────────────
ALTER TABLE public.league_memberships ENABLE ROW LEVEL SECURITY;

-- Members can see all memberships in leagues they belong to; admins see all
CREATE POLICY "Users can read memberships in their leagues"
  ON public.league_memberships FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.league_memberships lm
      WHERE lm.league_id = league_id
        AND lm.user_id = auth.uid()
        AND lm.status = 'approved'
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND roles @> '{admin}'::text[]
    )
  );

-- Players can request to join
CREATE POLICY "Players can request membership"
  ON public.league_memberships FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Admins can approve/reject
CREATE POLICY "Admins can update membership status"
  ON public.league_memberships FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND roles @> '{admin}'::text[]
    )
  );
