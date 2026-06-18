import type { Match, MatchScore } from '@/types/db/matches';
import type { LeagueMembership } from '@/types/db/leagues';
import type { User } from '@/types/db/users';

export type PlayerStats = {
  userId: string;
  name: string;
  played: number;
  won: number;
  lost: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
};

export function matchPoints(isWinner: boolean, wentToSuperTiebreak: boolean): number {
  if (isWinner && !wentToSuperTiebreak) return 3; // 2-0
  if (isWinner && wentToSuperTiebreak) return 2; // 2-1
  if (!isWinner && wentToSuperTiebreak) return 1; // 1-2
  return 0; // 0-2
}

function computeSets(score: MatchScore, isPlayerA: boolean): [number, number] {
  let won = 0;
  let lost = 0;

  const s1My = isPlayerA ? score.set1A : score.set1B;
  const s1Opp = isPlayerA ? score.set1B : score.set1A;
  if (s1My > s1Opp) won++;
  else lost++;

  const s2My = isPlayerA ? score.set2A : score.set2B;
  const s2Opp = isPlayerA ? score.set2B : score.set2A;
  if (s2My > s2Opp) won++;
  else lost++;

  if (score.superTiebreakA !== null && score.superTiebreakB !== null) {
    const stMy = isPlayerA ? score.superTiebreakA : score.superTiebreakB;
    const stOpp = isPlayerA ? score.superTiebreakB : score.superTiebreakA;
    if (stMy > stOpp) won++;
    else lost++;
  }

  return [won, lost];
}

function computeGames(score: MatchScore, isPlayerA: boolean): [number, number] {
  const my = (isPlayerA ? score.set1A : score.set1B) + (isPlayerA ? score.set2A : score.set2B);
  const opp = (isPlayerA ? score.set1B : score.set1A) + (isPlayerA ? score.set2B : score.set2A);
  return [my, opp];
}

export function computeLeaderboard(
  memberships: LeagueMembership[],
  users: User[],
  matches: Match[],
  getScore: (matchId: string) => MatchScore | null
): PlayerStats[] {
  const userMap = new Map(users.map(u => [u.id, u]));
  const approvedIds = memberships.filter(m => m.status === 'approved').map(m => m.userId);

  const stats = new Map<string, PlayerStats>(
    approvedIds.map(userId => [
      userId,
      {
        userId,
        name: userMap.get(userId)?.name ?? 'Unknown',
        played: 0,
        won: 0,
        lost: 0,
        setsWon: 0,
        setsLost: 0,
        gamesWon: 0,
        gamesLost: 0,
        points: 0,
      },
    ])
  );

  for (const match of matches) {
    if (match.status !== 'played') continue;
    const score = getScore(match.id);
    if (!score || score.disputedAt !== null) continue;

    for (const [playerId, isPlayerA] of [
      [match.playerAId, true],
      [match.playerBId, false],
    ] as [string, boolean][]) {
      const st = stats.get(playerId);
      if (!st) continue;

      const isWinner = score.winnerId === playerId;
      const wentToSuperTiebreak = score.superTiebreakA !== null;

      st.played++;
      st.points += matchPoints(isWinner, wentToSuperTiebreak);
      if (isWinner) st.won++;
      else st.lost++;

      const [sw, sl] = computeSets(score, isPlayerA);
      st.setsWon += sw;
      st.setsLost += sl;

      const [gw, gl] = computeGames(score, isPlayerA);
      st.gamesWon += gw;
      st.gamesLost += gl;
    }
  }

  return Array.from(stats.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.setsWon !== a.setsWon) return b.setsWon - a.setsWon;
    if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;
    return 0;
  });
}

export function formatScore(score: MatchScore): string {
  const parts = [`${score.set1A}–${score.set1B}`, `${score.set2A}–${score.set2B}`];
  if (score.superTiebreakA !== null && score.superTiebreakB !== null) {
    parts.push(`[${score.superTiebreakA}–${score.superTiebreakB}]`);
  }
  return parts.join(' ');
}
