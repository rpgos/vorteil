import { describe, it, expect } from 'vitest';
import * as matchesDb from '@/server/db/matches';
import * as scoresDb from '@/server/db/scores';

// Seed data: match1 is u1 vs u2 (played, u1 won), match2 and match3 are scheduled.

describe('matchesDb.getByPlayer', () => {
  it('returns only played matches for the given player', () => {
    const results = matchesDb.getByPlayer('u1');
    expect(results.every(m => m.status === 'played')).toBe(true);
    expect(results.every(m => m.playerAId === 'u1' || m.playerBId === 'u1')).toBe(true);
  });

  it('does not include scheduled matches', () => {
    const results = matchesDb.getByPlayer('u1');
    expect(results.every(m => m.status !== 'scheduled')).toBe(true);
  });

  it('returns empty array for a player with no played matches', () => {
    expect(matchesDb.getByPlayer('u3')).toHaveLength(0);
  });
});

describe('stats computation', () => {
  it('correctly counts wins and losses for u1', () => {
    const played = matchesDb.getByPlayer('u1');
    const wins = played.filter(m => {
      const score = scoresDb.getByMatch(m.id);
      return score?.winnerId === 'u1';
    }).length;
    const losses = played.length - wins;
    expect(wins).toBe(1);
    expect(losses).toBe(0);
  });

  it('computes win rate as 100% when all matches are won', () => {
    const played = matchesDb.getByPlayer('u1');
    const wins = played.filter(m => scoresDb.getByMatch(m.id)?.winnerId === 'u1').length;
    const winRate = played.length > 0 ? Math.round((wins / played.length) * 100) : 0;
    expect(winRate).toBe(100);
  });

  it('computes win rate as 0% when no matches played', () => {
    const played = matchesDb.getByPlayer('u3');
    const winRate = played.length > 0 ? Math.round((0 / played.length) * 100) : 0;
    expect(winRate).toBe(0);
  });
});

describe('head-to-head computation', () => {
  it('finds matches between two specific players', () => {
    const profileUserId = 'u1';
    const viewerId = 'u2';
    const played = matchesDb.getByPlayer(profileUserId);
    const h2h = played.filter(
      m =>
        (m.playerAId === profileUserId && m.playerBId === viewerId) ||
        (m.playerBId === profileUserId && m.playerAId === viewerId)
    );
    expect(h2h).toHaveLength(1);
  });

  it('viewer wins = matches where score.winnerId === viewerId', () => {
    const profileUserId = 'u1';
    const viewerId = 'u2';
    const played = matchesDb.getByPlayer(profileUserId);
    const h2h = played.filter(
      m =>
        (m.playerAId === profileUserId && m.playerBId === viewerId) ||
        (m.playerBId === profileUserId && m.playerAId === viewerId)
    );
    const viewerWins = h2h.filter(m => scoresDb.getByMatch(m.id)?.winnerId === viewerId).length;
    expect(viewerWins).toBe(0); // u1 won match1
  });

  it('returns no h2h matches for players who have not met', () => {
    const profileUserId = 'u1';
    const viewerId = 'u3'; // u3 is in a different league
    const played = matchesDb.getByPlayer(profileUserId);
    const h2h = played.filter(
      m =>
        (m.playerAId === profileUserId && m.playerBId === viewerId) ||
        (m.playerBId === profileUserId && m.playerAId === viewerId)
    );
    expect(h2h).toHaveLength(0);
  });
});
