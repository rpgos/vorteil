import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/server/auth/guards', () => ({
  requireRole: vi
    .fn()
    .mockResolvedValue({ userId: 'u2', email: 'admin@example.com', registrationComplete: true, roles: ['admin'] }),
}));
vi.mock('@/server/db/leagues', () => ({ create: vi.fn() }));

import { redirect } from 'next/navigation';
import { createLeague } from './leagues';
import * as leaguesDb from '@/server/db/leagues';

function makeFormData(values: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

const validData = {
  name: 'Berlin Summer League',
  city: 'Berlin',
  regularSeasonRounds: '8',
  hasPlayoffs: 'true',
  regularSeasonEnd: '2026-08-31',
  playoffsEnd: '2026-09-30',
};

describe('createLeague', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates the league and redirects to it on valid input', async () => {
    await createLeague(null, makeFormData(validData));
    expect(leaguesDb.create).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith(expect.stringMatching(/^\/leagues\//));
  });

  it('sets status to draft on creation', async () => {
    await createLeague(null, makeFormData(validData));
    expect(leaguesDb.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'draft' }));
  });

  it('sets createdBy to the session userId', async () => {
    await createLeague(null, makeFormData(validData));
    expect(leaguesDb.create).toHaveBeenCalledWith(expect.objectContaining({ createdBy: 'u2' }));
  });

  it('accepts a league without playoffs', async () => {
    await createLeague(null, makeFormData({ ...validData, hasPlayoffs: 'false', playoffsEnd: '' }));
    expect(redirect).toHaveBeenCalled();
    expect(leaguesDb.create).toHaveBeenCalledWith(expect.objectContaining({ hasPlayoffs: false, playoffsEnd: null }));
  });

  it('stores a level range when provided', async () => {
    await createLeague(null, makeFormData({ ...validData, levelMin: '6', levelMax: '14' }));
    expect(leaguesDb.create).toHaveBeenCalledWith(expect.objectContaining({ levelRange: { min: 6, max: 14 } }));
  });

  it('stores null levelRange when min/max are empty', async () => {
    await createLeague(null, makeFormData(validData));
    expect(leaguesDb.create).toHaveBeenCalledWith(expect.objectContaining({ levelRange: null }));
  });

  it('returns VALIDATION error when name is missing', async () => {
    const result = await createLeague(null, makeFormData({ ...validData, name: '' }));
    expect(result?.ok).toBe(false);
    if (result?.ok === false) {
      expect(result.error.code).toBe('VALIDATION');
      expect(result.error.fieldErrors?.name).toBeDefined();
    }
  });

  it('returns VALIDATION error when city is missing', async () => {
    const result = await createLeague(null, makeFormData({ ...validData, city: '' }));
    expect(result?.ok).toBe(false);
    if (result?.ok === false) {
      expect(result.error.fieldErrors?.city).toBeDefined();
    }
  });

  it('returns VALIDATION error when hasPlayoffs is true but playoffsEnd is missing', async () => {
    const result = await createLeague(null, makeFormData({ ...validData, hasPlayoffs: 'true', playoffsEnd: '' }));
    expect(result?.ok).toBe(false);
    if (result?.ok === false) {
      expect(result.error.fieldErrors?.playoffsEnd).toBeDefined();
    }
  });

  it('returns VALIDATION error when playoffsEnd is before regularSeasonEnd', async () => {
    const result = await createLeague(
      null,
      makeFormData({ ...validData, regularSeasonEnd: '2026-09-30', playoffsEnd: '2026-08-31' })
    );
    expect(result?.ok).toBe(false);
    if (result?.ok === false) {
      expect(result.error.fieldErrors?.playoffsEnd).toBeDefined();
    }
  });

  it('returns VALIDATION error for non-positive regularSeasonRounds', async () => {
    const result = await createLeague(null, makeFormData({ ...validData, regularSeasonRounds: '0' }));
    expect(result?.ok).toBe(false);
    if (result?.ok === false) {
      expect(result.error.fieldErrors?.regularSeasonRounds).toBeDefined();
    }
  });
});
