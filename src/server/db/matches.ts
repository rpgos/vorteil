import type { Match } from '@/types/db/matches';

const seed: Match[] = [
  {
    id: 'match1',
    leagueId: 'l1',
    playerAId: 'u1',
    playerBId: 'u2',
    status: 'played',
    submittedById: 'u1',
    createdAt: new Date('2026-04-01T00:00:00Z'),
  },
  {
    id: 'match2',
    leagueId: 'l1',
    playerAId: 'u1',
    playerBId: 'u4',
    status: 'scheduled',
    submittedById: null,
    createdAt: new Date('2026-04-01T00:00:00Z'),
  },
  {
    id: 'match3',
    leagueId: 'l1',
    playerAId: 'u2',
    playerBId: 'u4',
    status: 'scheduled',
    submittedById: null,
    createdAt: new Date('2026-04-01T00:00:00Z'),
  },
];

const store = new Map<string, Match>(seed.map(m => [m.id, m]));

export function getByLeague(leagueId: string): Match[] {
  return Array.from(store.values()).filter(m => m.leagueId === leagueId);
}

export function getById(id: string): Match | null {
  return store.get(id) ?? null;
}

export function create(data: Omit<Match, 'createdAt'>): Match {
  console.log('[DB STUB] matches.create', { id: data.id, leagueId: data.leagueId });
  const match: Match = { ...data, createdAt: new Date() };
  store.set(match.id, match);
  return match;
}

export function update(
  id: string,
  data: Partial<Omit<Match, 'id' | 'leagueId' | 'playerAId' | 'playerBId' | 'createdAt'>>
): Match | null {
  const existing = store.get(id);
  if (!existing) return null;
  console.log('[DB STUB] matches.update', { id });
  const updated: Match = { ...existing, ...data };
  store.set(id, updated);
  return updated;
}
