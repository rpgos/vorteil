export type MatchStatus = 'scheduled' | 'played' | 'disputed';

export type Match = {
  id: string;
  leagueId: string;
  playerAId: string;
  playerBId: string;
  status: MatchStatus;
  submittedById: string | null;
  createdAt: Date;
};

export type MatchScore = {
  id: string;
  matchId: string;
  set1A: number;
  set1B: number;
  set2A: number;
  set2B: number;
  /** Super tiebreak points for player A; null when match decided in 2 sets */
  superTiebreakA: number | null;
  /** Super tiebreak points for player B; null when match decided in 2 sets */
  superTiebreakB: number | null;
  winnerId: string;
  submittedAt: Date;
  disputeWindowEndsAt: Date;
  disputedAt: Date | null;
  disputeReason: string | null;
};
