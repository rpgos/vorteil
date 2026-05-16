import type { League } from '@/types/db/leagues';

const seed: League[] = [
  {
    id: 'l1',
    name: 'Berlin Summer League 2026',
    city: 'Berlin',
    levelRange: { min: 6, max: 14 },
    regularSeasonRounds: 8,
    hasPlayoffs: true,
    regularSeasonEnd: new Date('2026-08-31T23:59:59Z'),
    playoffsEnd: new Date('2026-09-30T23:59:59Z'),
    maxParticipants: 16,
    description: 'The premier amateur tennis league in Berlin. Round-robin format with playoffs.',
    status: 'in_season',
    createdBy: 'u2',
    createdAt: new Date('2026-03-01T08:00:00Z'),
  },
  {
    id: 'l2',
    name: 'München Open 2026',
    city: 'München',
    levelRange: null,
    regularSeasonRounds: 6,
    hasPlayoffs: false,
    regularSeasonEnd: new Date('2026-07-31T23:59:59Z'),
    playoffsEnd: null,
    maxParticipants: null,
    description: 'Open-level league welcoming all skill levels.',
    status: 'open',
    createdBy: 'u2',
    createdAt: new Date('2026-03-15T10:00:00Z'),
  },
];

const store = new Map<string, League>(seed.map(l => [l.id, l]));

export type LeagueFilters = {
  city?: string;
  status?: League['status'];
  levelMin?: number;
  levelMax?: number;
};

export function getAll(filters?: LeagueFilters): League[] {
  let results = Array.from(store.values());
  if (filters?.city) results = results.filter(l => l.city === filters.city);
  if (filters?.status) results = results.filter(l => l.status === filters.status);
  if (filters?.levelMin != null)
    results = results.filter(l => l.levelRange == null || l.levelRange.max >= filters.levelMin!);
  if (filters?.levelMax != null)
    results = results.filter(l => l.levelRange == null || l.levelRange.min <= filters.levelMax!);
  return results;
}

export function getById(id: string): League | null {
  return store.get(id) ?? null;
}

export function create(data: Omit<League, 'createdAt'>): League {
  console.log('[DB STUB] leagues.create', { id: data.id, name: data.name });
  const league: League = { ...data, createdAt: new Date() };
  store.set(league.id, league);
  return league;
}

export function update(id: string, data: Partial<Omit<League, 'id' | 'createdAt'>>): League | null {
  const existing = store.get(id);
  if (!existing) return null;
  console.log('[DB STUB] leagues.update', { id });
  const updated: League = { ...existing, ...data };
  store.set(id, updated);
  return updated;
}
