import { z } from 'zod';

/**
 * Validates a standard tennis set score.
 * A set is won by reaching 6 games with a 2-game margin, or 7–6 via tiebreak.
 */
function isValidTennisSet(a: number, b: number): boolean {
  if (a < 0 || b < 0) return false;
  const winner = a > b ? a : b;
  const loser = a > b ? b : a;
  if (winner === 7 && loser === 6) return true; // tiebreak
  if (winner === 6 && loser <= 4) return true; // normal win
  if (winner === 6 && loser === 5) return false; // invalid: must play on
  if (winner >= 7) return false;
  return false;
}

/**
 * Validates a super tiebreak (first to 10, win by 2).
 */
function isValidSuperTiebreak(a: number, b: number): boolean {
  if (a < 0 || b < 0) return false;
  const winner = Math.max(a, b);
  const loser = Math.min(a, b);
  if (winner < 10) return false;
  if (winner - loser < 2) return false;
  if (winner > 10 && winner - loser !== 2) return false;
  return true;
}

export const submitScoreSchema = z
  .object({
    set1A: z.number().int().min(0),
    set1B: z.number().int().min(0),
    set2A: z.number().int().min(0),
    set2B: z.number().int().min(0),
    superTiebreakA: z.number().int().min(0).optional(),
    superTiebreakB: z.number().int().min(0).optional(),
  })
  .refine(d => isValidTennisSet(d.set1A, d.set1B), {
    message: 'Set 1 score is not a valid tennis set',
    path: ['set1A'],
  })
  .refine(d => isValidTennisSet(d.set2A, d.set2B), {
    message: 'Set 2 score is not a valid tennis set',
    path: ['set2A'],
  })
  .refine(
    d => {
      const p1SetsWon = (d.set1A > d.set1B ? 1 : 0) + (d.set2A > d.set2B ? 1 : 0);
      const splitSets = p1SetsWon === 1;
      const hasSuperTB = d.superTiebreakA != null && d.superTiebreakB != null;
      if (splitSets && !hasSuperTB) return false;
      return true;
    },
    { message: 'Super tiebreak is required when sets are split 1–1', path: ['superTiebreakA'] }
  )
  .refine(
    d => {
      const p1SetsWon = (d.set1A > d.set1B ? 1 : 0) + (d.set2A > d.set2B ? 1 : 0);
      const hasSuperTB = d.superTiebreakA != null && d.superTiebreakB != null;
      if (p1SetsWon !== 1 && hasSuperTB) return false;
      return true;
    },
    { message: 'Super tiebreak must not be submitted when one player won both sets', path: ['superTiebreakA'] }
  )
  .refine(
    d => {
      if (d.superTiebreakA == null || d.superTiebreakB == null) return true;
      return isValidSuperTiebreak(d.superTiebreakA, d.superTiebreakB);
    },
    { message: 'Super tiebreak score is invalid (first to 10, win by 2)', path: ['superTiebreakA'] }
  );

export const disputeMatchSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason of at least 10 characters').max(1000),
});

export type SubmitScoreInput = z.infer<typeof submitScoreSchema>;
export type DisputeMatchInput = z.infer<typeof disputeMatchSchema>;
