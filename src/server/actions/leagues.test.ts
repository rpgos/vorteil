import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/server/auth/guards', () => ({
  requireSession: vi
    .fn()
    .mockResolvedValue({ userId: 'u1', email: 'player@example.com', registrationComplete: true, roles: ['player'] }),
  requireRole: vi
    .fn()
    .mockResolvedValue({ userId: 'u2', email: 'admin@example.com', registrationComplete: true, roles: ['admin'] }),
}));
vi.mock('@/server/db/leagues', () => ({ create: vi.fn(), getById: vi.fn(), update: vi.fn() }));
vi.mock('@/server/db/memberships', () => ({
  create: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
  getActiveByUser: vi.fn().mockReturnValue(null),
  getByLeague: vi.fn().mockReturnValue([]),
}));
vi.mock('@/server/db/matches', () => ({
  create: vi.fn(),
  getByLeague: vi.fn().mockReturnValue([]),
}));

import { redirect } from 'next/navigation';
import { createLeague, requestJoinLeague, decideMembership, startSeason } from './leagues';
import * as leaguesDb from '@/server/db/leagues';
import * as membershipsDb from '@/server/db/memberships';
import * as matchesDb from '@/server/db/matches';

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

// ---------------------------------------------------------------------------
// requestJoinLeague
// ---------------------------------------------------------------------------

describe('requestJoinLeague', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a pending membership and returns ok', async () => {
    vi.mocked(leaguesDb.getById).mockReturnValue({
      id: 'l1',
      status: 'open',
      name: 'League',
      city: 'Berlin',
      levelRange: null,
      level: null,
      regularSeasonRounds: 8,
      hasPlayoffs: true,
      regularSeasonEnd: new Date(),
      playoffsEnd: null,
      maxParticipants: null,
      description: null,
      createdBy: 'u2',
      createdAt: new Date(),
    });
    vi.mocked(membershipsDb.getActiveByUser).mockReturnValue(null);

    const result = await requestJoinLeague('l1');
    expect(result.ok).toBe(true);
    expect(membershipsDb.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', leagueId: 'l1', status: 'pending' })
    );
  });

  it('returns NOT_FOUND when league does not exist', async () => {
    vi.mocked(leaguesDb.getById).mockReturnValue(null);
    const result = await requestJoinLeague('nonexistent');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('returns CONFLICT when league is not open', async () => {
    vi.mocked(leaguesDb.getById).mockReturnValue({
      id: 'l1',
      status: 'in_season',
      name: 'League',
      city: 'Berlin',
      levelRange: null,
      level: null,
      regularSeasonRounds: 8,
      hasPlayoffs: true,
      regularSeasonEnd: new Date(),
      playoffsEnd: null,
      maxParticipants: null,
      description: null,
      createdBy: 'u2',
      createdAt: new Date(),
    });
    const result = await requestJoinLeague('l1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
    expect(membershipsDb.create).not.toHaveBeenCalled();
  });

  it('returns CONFLICT when user already has an active membership', async () => {
    vi.mocked(leaguesDb.getById).mockReturnValue({
      id: 'l1',
      status: 'open',
      name: 'League',
      city: 'Berlin',
      levelRange: null,
      level: null,
      regularSeasonRounds: 8,
      hasPlayoffs: true,
      regularSeasonEnd: new Date(),
      playoffsEnd: null,
      maxParticipants: null,
      description: null,
      createdBy: 'u2',
      createdAt: new Date(),
    });
    vi.mocked(membershipsDb.getActiveByUser).mockReturnValue({
      id: 'm1',
      userId: 'u1',
      leagueId: 'l2',
      status: 'approved',
      requestedAt: new Date(),
      decidedAt: new Date(),
    });
    const result = await requestJoinLeague('l1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
    expect(membershipsDb.create).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// decideMembership
// ---------------------------------------------------------------------------

describe('decideMembership', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates membership status to approved', async () => {
    vi.mocked(membershipsDb.getById).mockReturnValue({
      id: 'm1',
      userId: 'u1',
      leagueId: 'l1',
      status: 'pending',
      requestedAt: new Date(),
      decidedAt: null,
    });
    const result = await decideMembership('m1', 'approved');
    expect(result.ok).toBe(true);
    expect(membershipsDb.update).toHaveBeenCalledWith('m1', expect.objectContaining({ status: 'approved' }));
  });

  it('updates membership status to rejected', async () => {
    vi.mocked(membershipsDb.getById).mockReturnValue({
      id: 'm1',
      userId: 'u1',
      leagueId: 'l1',
      status: 'pending',
      requestedAt: new Date(),
      decidedAt: null,
    });
    const result = await decideMembership('m1', 'rejected');
    expect(result.ok).toBe(true);
    expect(membershipsDb.update).toHaveBeenCalledWith('m1', expect.objectContaining({ status: 'rejected' }));
  });

  it('returns NOT_FOUND when membership does not exist', async () => {
    vi.mocked(membershipsDb.getById).mockReturnValue(null);
    const result = await decideMembership('nonexistent', 'approved');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });
});

// ---------------------------------------------------------------------------
// startSeason
// ---------------------------------------------------------------------------

describe('startSeason', () => {
  beforeEach(() => vi.clearAllMocks());

  const openLeague = {
    id: 'l1',
    status: 'open' as const,
    name: 'League',
    city: 'Berlin',
    levelRange: null,
    level: null,
    regularSeasonRounds: 8,
    hasPlayoffs: true,
    regularSeasonEnd: new Date(),
    playoffsEnd: null,
    maxParticipants: null,
    description: null,
    createdBy: 'u2',
    createdAt: new Date(),
  };

  it('generates round-robin matches and sets league to in_season', async () => {
    vi.mocked(leaguesDb.getById).mockReturnValue(openLeague);
    vi.mocked(membershipsDb.getByLeague).mockReturnValue([
      { id: 'm1', userId: 'u1', leagueId: 'l1', status: 'approved', requestedAt: new Date(), decidedAt: new Date() },
      { id: 'm2', userId: 'u2', leagueId: 'l1', status: 'approved', requestedAt: new Date(), decidedAt: new Date() },
      { id: 'm3', userId: 'u3', leagueId: 'l1', status: 'approved', requestedAt: new Date(), decidedAt: new Date() },
    ]);
    vi.mocked(matchesDb.getByLeague).mockReturnValue([]);

    const result = await startSeason('l1');
    expect(result.ok).toBe(true);
    // 3 players → 3 pairs
    expect(matchesDb.create).toHaveBeenCalledTimes(3);
    expect(leaguesDb.update).toHaveBeenCalledWith('l1', { status: 'in_season' });
  });

  it('is idempotent — does not duplicate existing pairs', async () => {
    vi.mocked(leaguesDb.getById).mockReturnValue(openLeague);
    vi.mocked(membershipsDb.getByLeague).mockReturnValue([
      { id: 'm1', userId: 'u1', leagueId: 'l1', status: 'approved', requestedAt: new Date(), decidedAt: new Date() },
      { id: 'm2', userId: 'u2', leagueId: 'l1', status: 'approved', requestedAt: new Date(), decidedAt: new Date() },
    ]);
    // The u1-u2 pair already exists
    vi.mocked(matchesDb.getByLeague).mockReturnValue([
      {
        id: 'ex1',
        leagueId: 'l1',
        playerAId: 'u1',
        playerBId: 'u2',
        status: 'scheduled',
        submittedById: null,
        createdAt: new Date(),
      },
    ]);

    const result = await startSeason('l1');
    expect(result.ok).toBe(true);
    expect(matchesDb.create).not.toHaveBeenCalled();
  });

  it('returns NOT_FOUND when league does not exist', async () => {
    vi.mocked(leaguesDb.getById).mockReturnValue(null);
    const result = await startSeason('nonexistent');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('returns CONFLICT when league is not open', async () => {
    vi.mocked(leaguesDb.getById).mockReturnValue({ ...openLeague, status: 'in_season' });
    const result = await startSeason('l1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });

  it('returns CONFLICT when fewer than 2 approved members', async () => {
    vi.mocked(leaguesDb.getById).mockReturnValue(openLeague);
    vi.mocked(membershipsDb.getByLeague).mockReturnValue([
      { id: 'm1', userId: 'u1', leagueId: 'l1', status: 'approved', requestedAt: new Date(), decidedAt: new Date() },
    ]);
    const result = await startSeason('l1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });
});
