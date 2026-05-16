import { describe, it, expect } from 'vitest';
import { createLeagueSchema } from './leagues';

const regularSeasonEnd = new Date('2026-08-31');
const playoffsEnd = new Date('2026-09-30');

const valid = {
  name: 'Berlin Summer League',
  city: 'Berlin',
  regularSeasonRounds: 8,
  hasPlayoffs: true,
  regularSeasonEnd,
  playoffsEnd,
};

describe('createLeagueSchema', () => {
  it('accepts a fully valid input', () => {
    expect(createLeagueSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a league without playoffs', () => {
    const result = createLeagueSchema.safeParse({
      ...valid,
      hasPlayoffs: false,
      playoffsEnd: undefined,
    });
    expect(result.success).toBe(true);
  });

  it('rejects when hasPlayoffs is true but playoffsEnd is missing', () => {
    const result = createLeagueSchema.safeParse({ ...valid, playoffsEnd: undefined });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('playoffsEnd'))).toBe(true);
    }
  });

  it('rejects when playoffsEnd is before regularSeasonEnd', () => {
    const result = createLeagueSchema.safeParse({
      ...valid,
      regularSeasonEnd: new Date('2026-09-30'),
      playoffsEnd: new Date('2026-08-31'),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('playoffsEnd'))).toBe(true);
    }
  });

  it('rejects when playoffsEnd equals regularSeasonEnd', () => {
    const same = new Date('2026-08-31');
    const result = createLeagueSchema.safeParse({
      ...valid,
      regularSeasonEnd: same,
      playoffsEnd: same,
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    expect(createLeagueSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('rejects non-positive regularSeasonRounds', () => {
    expect(createLeagueSchema.safeParse({ ...valid, regularSeasonRounds: 0 }).success).toBe(false);
  });

  it('rejects non-integer maxParticipants', () => {
    expect(createLeagueSchema.safeParse({ ...valid, maxParticipants: 1.5 }).success).toBe(false);
  });

  it('rejects levelRange where max < min', () => {
    const result = createLeagueSchema.safeParse({
      ...valid,
      levelRange: { min: 10, max: 5 },
    });
    expect(result.success).toBe(false);
  });

  it('applies default values', () => {
    const result = createLeagueSchema.safeParse({
      name: 'Test',
      city: 'Berlin',
      regularSeasonEnd,
      playoffsEnd,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.regularSeasonRounds).toBe(8);
      expect(result.data.hasPlayoffs).toBe(true);
    }
  });
});
