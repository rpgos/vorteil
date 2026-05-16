import type { MatchScore } from '@/types/db/matches';

const submittedAt = new Date('2026-04-10T18:00:00Z');

const seed: MatchScore[] = [
  {
    id: 'score1',
    matchId: 'match1',
    set1A: 6,
    set1B: 3,
    set2A: 6,
    set2B: 4,
    superTiebreakA: null,
    superTiebreakB: null,
    winnerId: 'u1',
    submittedAt,
    disputeWindowEndsAt: new Date(submittedAt.getTime() + 48 * 60 * 60 * 1000),
    disputedAt: null,
    disputeReason: null,
  },
];

const store = new Map<string, MatchScore>(seed.map(s => [s.id, s]));

export function getByMatch(matchId: string): MatchScore | null {
  return Array.from(store.values()).find(s => s.matchId === matchId) ?? null;
}

export function getById(id: string): MatchScore | null {
  return store.get(id) ?? null;
}

export function create(data: MatchScore): MatchScore {
  console.log('[DB STUB] scores.create', { id: data.id, matchId: data.matchId });
  store.set(data.id, data);
  return data;
}

export function update(id: string, data: Partial<Pick<MatchScore, 'disputedAt' | 'disputeReason'>>): MatchScore | null {
  const existing = store.get(id);
  if (!existing) return null;
  console.log('[DB STUB] scores.update', { id });
  const updated: MatchScore = { ...existing, ...data };
  store.set(id, updated);
  return updated;
}
