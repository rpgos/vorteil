CREATE TABLE public.matches (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id       uuid        NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  player_a_id     uuid        NOT NULL REFERENCES public.users(id),
  player_b_id     uuid        NOT NULL REFERENCES public.users(id),
  status          text        NOT NULL DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled', 'played', 'disputed')),
  -- The player who submitted the result; null until a score is submitted
  submitted_by_id uuid        REFERENCES public.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),

  -- Players must be different
  CONSTRAINT chk_players_distinct CHECK (player_a_id <> player_b_id)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_matches_league_id   ON public.matches (league_id);
CREATE INDEX idx_matches_player_a_id ON public.matches (player_a_id);
CREATE INDEX idx_matches_player_b_id ON public.matches (player_b_id);
CREATE INDEX idx_matches_status      ON public.matches (status);

-- ── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Any approved member of the league can view its matches
CREATE POLICY "League members can read matches"
  ON public.matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.league_memberships lm
      WHERE lm.league_id = matches.league_id
        AND lm.user_id = auth.uid()
        AND lm.status = 'approved'
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND roles @> '{admin}'::text[]
    )
  );

-- Admins can create/schedule matches
CREATE POLICY "Admins can create matches"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND roles @> '{admin}'::text[]
    )
  );

-- Admins or the participating players can update match status
CREATE POLICY "Players or admins can update match"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (
    player_a_id = auth.uid()
    OR player_b_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND roles @> '{admin}'::text[]
    )
  );
