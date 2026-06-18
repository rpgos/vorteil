import { describe, it, expect } from 'vitest';
import { matchPoints, computeLeaderboard, formatScore } from './leagueRanking';
import type { Match, MatchScore } from '@/types/db/matches';
import type { LeagueMembership } from '@/types/db/leagues';
import type { User } from '@/types/db/users';

// ---------------------------------------------------------------------------
// matchPoints
// ---------------------------------------------------------------------------

describe('matchPoints', () => {
  it('returns 3 for a 2-0 win', () => {
    expect(matchPoints(true, false)).toBe(3);
  });

  it('returns 2 for a 2-1 win (super tiebreak)', () => {
    expect(matchPoints(true, true)).toBe(2);
  });

  it('returns 1 for a 1-2 loss (super tiebreak)', () => {
    expect(matchPoints(false, true)).toBe(1);
  });

  it('returns 0 for a 0-2 loss', () => {
    expect(matchPoints(false, false)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// formatScore
// ---------------------------------------------------------------------------

describe('formatScore', () => {
  it('formats a 2-0 score without super tiebreak', () => {
    const score = {
      set1A: 6,
      set1B: 3,
      set2A: 6,
      set2B: 4,
      superTiebreakA: null,
      superTiebreakB: null,
    } as MatchScore;
    expect(formatScore(score)).toBe('6–3 6–4');
  });

  it('formats a 2-1 score with super tiebreak', () => {
    const score = {
      set1A: 6,
      set1B: 3,
      set2A: 4,
      set2B: 6,
      superTiebreakA: 10,
      superTiebreakB: 3,
    } as MatchScore;
    expect(formatScore(score)).toBe('6–3 4–6 [10–3]');
  });
});

// ---------------------------------------------------------------------------
// computeLeaderboard
// ---------------------------------------------------------------------------

const makeMembership = (userId: string, status: LeagueMembership['status'] = 'approved'): LeagueMembership => ({
  id: `m-${userId}`,
  userId,
  leagueId: 'l1',
  status,
  requestedAt: new Date(),
  decidedAt: new Date(),
});

const makeUser = (id: string, name: string): User => ({
  id,
  email: `${id}@example.com`,
  name,
  gender: 'male',
  lkLevel: null,
  level: 'intermediate',
  city: 'Berlin',
  dominantHand: null,
  homeClub: null,
  roles: ['player'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeMatch = (id: string, playerAId: string, playerBId: string, status: Match['status'] = 'played'): Match => ({
  id,
  leagueId: 'l1',
  playerAId,
  playerBId,
  status,
  submittedById: playerAId,
  createdAt: new Date(),
});

const makeScore = (
  matchId: string,
  winnerId: string,
  withSuperTiebreak = false,
  disputedAt: Date | null = null
): MatchScore => ({
  id: `score-${matchId}`,
  matchId,
  set1A: 6,
  set1B: 3,
  set2A: withSuperTiebreak ? 4 : 6,
  set2B: withSuperTiebreak ? 6 : 2,
  superTiebreakA: withSuperTiebreak ? 10 : null,
  superTiebreakB: withSuperTiebreak ? 3 : null,
  winnerId,
  submittedAt: new Date(),
  disputeWindowEndsAt: new Date(),
  disputedAt,
  disputeReason: null,
});

describe('computeLeaderboard', () => {
  const memberships = [makeMembership('u1'), makeMembership('u2'), makeMembership('u3')];
  const users = [makeUser('u1', 'Alice'), makeUser('u2', 'Bob'), makeUser('u3', 'Carol')];

  it('includes all approved members even with no matches', () => {
    const result = computeLeaderboard(memberships, users, [], () => null);
    expect(result).toHaveLength(3);
  });

  it('excludes non-approved members', () => {
    const ms = [makeMembership('u1'), makeMembership('u2', 'pending')];
    const result = computeLeaderboard(ms, users, [], () => null);
    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe('u1');
  });

  it('computes points correctly for a 2-0 win', () => {
    const match = makeMatch('m1', 'u1', 'u2');
    const score = makeScore('m1', 'u1');
    const result = computeLeaderboard(memberships, users, [match], id => (id === 'm1' ? score : null));
    const alice = result.find(p => p.userId === 'u1')!;
    const bob = result.find(p => p.userId === 'u2')!;
    expect(alice.points).toBe(3);
    expect(bob.points).toBe(0);
    expect(alice.won).toBe(1);
    expect(bob.lost).toBe(1);
  });

  it('computes points correctly for a 2-1 win with super tiebreak', () => {
    const match = makeMatch('m1', 'u1', 'u2');
    const score = makeScore('m1', 'u1', true);
    const result = computeLeaderboard(memberships, users, [match], id => (id === 'm1' ? score : null));
    const alice = result.find(p => p.userId === 'u1')!;
    const bob = result.find(p => p.userId === 'u2')!;
    expect(alice.points).toBe(2);
    expect(bob.points).toBe(1);
  });

  it('ignores disputed matches', () => {
    const match = makeMatch('m1', 'u1', 'u2');
    const score = makeScore('m1', 'u1', false, new Date());
    const result = computeLeaderboard(memberships, users, [match], id => (id === 'm1' ? score : null));
    const alice = result.find(p => p.userId === 'u1')!;
    expect(alice.points).toBe(0);
    expect(alice.played).toBe(0);
  });

  it('ignores scheduled matches', () => {
    const match = makeMatch('m1', 'u1', 'u2', 'scheduled');
    const result = computeLeaderboard(memberships, users, [match], () => null);
    expect(result.every(p => p.played === 0)).toBe(true);
  });

  it('sorts by points then sets then games as tiebreaks', () => {
    // u1 beats u2 (3pts, setsWon=2, gamesWon=12)
    // u2 beats u3 (3pts, cumulative setsWon=0+2=2, gamesWon=5+12=17)
    // u3 loses to u2 (0pts)
    // u1 and u2 tied on points and sets → u2 wins on games (17 > 12)
    const m1 = makeMatch('m1', 'u1', 'u2');
    const m2 = makeMatch('m2', 'u2', 'u3');
    const s1 = makeScore('m1', 'u1');
    const s2 = makeScore('m2', 'u2');
    const scores: Record<string, MatchScore> = { m1: s1, m2: s2 };
    const result = computeLeaderboard(memberships, users, [m1, m2], id => scores[id] ?? null);
    expect(result[0].userId).toBe('u2'); // 3pts, 2 sets, 17 games
    expect(result[1].userId).toBe('u1'); // 3pts, 2 sets, 12 games
    expect(result[2].userId).toBe('u3'); // 0pts
  });
});
