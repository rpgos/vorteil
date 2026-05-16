import { describe, it, expect } from 'vitest';
import { submitScoreSchema } from './matches';

describe('submitScoreSchema — valid scores', () => {
  it('accepts a 2–0 win (6–3 6–4)', () => {
    const result = submitScoreSchema.safeParse({ set1A: 6, set1B: 3, set2A: 6, set2B: 4 });
    expect(result.success).toBe(true);
  });

  it('accepts a 0–2 loss (3–6 4–6)', () => {
    const result = submitScoreSchema.safeParse({ set1A: 3, set1B: 6, set2A: 4, set2B: 6 });
    expect(result.success).toBe(true);
  });

  it('accepts a 2–1 result with super tiebreak (6–3 3–6 10–7)', () => {
    const result = submitScoreSchema.safeParse({
      set1A: 6,
      set1B: 3,
      set2A: 3,
      set2B: 6,
      superTiebreakA: 10,
      superTiebreakB: 7,
    });
    expect(result.success).toBe(true);
  });

  it('accepts a super tiebreak going beyond 10 (12–10)', () => {
    const result = submitScoreSchema.safeParse({
      set1A: 6,
      set1B: 3,
      set2A: 3,
      set2B: 6,
      superTiebreakA: 12,
      superTiebreakB: 10,
    });
    expect(result.success).toBe(true);
  });

  it('accepts a tiebreak set (7–6)', () => {
    const result = submitScoreSchema.safeParse({ set1A: 7, set1B: 6, set2A: 6, set2B: 3 });
    expect(result.success).toBe(true);
  });
});

describe('submitScoreSchema — invalid scores', () => {
  it('rejects impossible set score (5–5)', () => {
    const result = submitScoreSchema.safeParse({ set1A: 5, set1B: 5, set2A: 6, set2B: 3 });
    expect(result.success).toBe(false);
  });

  it('rejects score 6–5 (no margin)', () => {
    const result = submitScoreSchema.safeParse({ set1A: 6, set1B: 5, set2A: 6, set2B: 3 });
    expect(result.success).toBe(false);
  });

  it('rejects missing super tiebreak when sets are split', () => {
    const result = submitScoreSchema.safeParse({
      set1A: 6,
      set1B: 3,
      set2A: 3,
      set2B: 6,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('superTiebreakA'))).toBe(true);
    }
  });

  it('rejects super tiebreak when one player already won both sets', () => {
    const result = submitScoreSchema.safeParse({
      set1A: 6,
      set1B: 3,
      set2A: 6,
      set2B: 4,
      superTiebreakA: 10,
      superTiebreakB: 5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects super tiebreak with insufficient margin (10–9)', () => {
    const result = submitScoreSchema.safeParse({
      set1A: 6,
      set1B: 3,
      set2A: 3,
      set2B: 6,
      superTiebreakA: 10,
      superTiebreakB: 9,
    });
    expect(result.success).toBe(false);
  });

  it('rejects super tiebreak where neither player reached 10 (9–7)', () => {
    const result = submitScoreSchema.safeParse({
      set1A: 6,
      set1B: 3,
      set2A: 3,
      set2B: 6,
      superTiebreakA: 9,
      superTiebreakB: 7,
    });
    expect(result.success).toBe(false);
  });
});
