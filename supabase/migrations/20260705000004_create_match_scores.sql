CREATE TABLE public.match_scores (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id                uuid        NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  set1_a                  int         NOT NULL CHECK (set1_a >= 0),
  set1_b                  int         NOT NULL CHECK (set1_b >= 0),
  set2_a                  int         NOT NULL CHECK (set2_a >= 0),
  set2_b                  int         NOT NULL CHECK (set2_b >= 0),
  -- Super tiebreak points; both null when match decided in 2 sets,
  -- both non-null when a super tiebreak was played
  super_tiebreak_a        int         CHECK (super_tiebreak_a >= 0),
  super_tiebreak_b        int         CHECK (super_tiebreak_b >= 0),
  winner_id               uuid        NOT NULL REFERENCES public.users(id),
  submitted_at            timestamptz NOT NULL DEFAULT now(),
  dispute_window_ends_at  timestamptz NOT NULL,
  disputed_at             timestamptz,
  dispute_reason          text,

  -- Each match has exactly one score record
  CONSTRAINT uq_match_score UNIQUE (match_id),

  -- Super tiebreak scores must both be set or both be null
  CONSTRAINT chk_super_tiebreak_consistency CHECK (
    (super_tiebreak_a IS NULL) = (super_tiebreak_b IS NULL)
  ),

  -- dispute_reason only meaningful when disputed_at is set
  CONSTRAINT chk_dispute_reason CHECK (
    disputed_at IS NOT NULL OR dispute_reason IS NULL
  )
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_match_scores_match_id  ON public.match_scores (match_id);
CREATE INDEX idx_match_scores_winner_id ON public.match_scores (winner_id);

-- ── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE public.match_scores ENABLE ROW LEVEL SECURITY;

-- Visible to approved league members (via the match's league)
CREATE POLICY "League members can read match scores"
  ON public.match_scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.matches m
      JOIN public.league_memberships lm ON lm.league_id = m.league_id
      WHERE m.id = match_scores.match_id
        AND lm.user_id = auth.uid()
        AND lm.status = 'approved'
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND roles @> '{admin}'::text[]
    )
  );

-- Only a participant of the match can submit the score
CREATE POLICY "Match participants can submit scores"
  ON public.match_scores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
        AND (m.player_a_id = auth.uid() OR m.player_b_id = auth.uid())
    )
  );

-- Only admins can correct a submitted score
CREATE POLICY "Admins can update match scores"
  ON public.match_scores FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND roles @> '{admin}'::text[]
    )
  );
