export type LeagueStatus = 'draft' | 'open' | 'in_season' | 'playoffs' | 'finished';
export type MembershipStatus = 'pending' | 'approved' | 'rejected';

export type LevelRange = {
  min: number;
  max: number;
};

export type League = {
  id: string;
  name: string;
  city: string;
  levelRange: LevelRange | null;
  regularSeasonRounds: number;
  hasPlayoffs: boolean;
  regularSeasonEnd: Date;
  playoffsEnd: Date | null;
  maxParticipants: number | null;
  description: string | null;
  status: LeagueStatus;
  createdBy: string;
  createdAt: Date;
};

export type LeagueMembership = {
  id: string;
  userId: string;
  leagueId: string;
  status: MembershipStatus;
  requestedAt: Date;
  decidedAt: Date | null;
};
