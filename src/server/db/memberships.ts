import type { LeagueMembership } from '@/types/db/leagues';

const seed: LeagueMembership[] = [
  {
    id: 'm1',
    userId: 'u1',
    leagueId: 'l1',
    status: 'approved',
    requestedAt: new Date('2026-03-05T12:00:00Z'),
    decidedAt: new Date('2026-03-06T09:00:00Z'),
  },
  {
    id: 'm2',
    userId: 'u2',
    leagueId: 'l1',
    status: 'approved',
    requestedAt: new Date('2026-03-05T13:00:00Z'),
    decidedAt: new Date('2026-03-06T09:05:00Z'),
  },
  {
    id: 'm3',
    userId: 'u4',
    leagueId: 'l1',
    status: 'approved',
    requestedAt: new Date('2026-03-07T10:00:00Z'),
    decidedAt: new Date('2026-03-08T11:00:00Z'),
  },
  {
    id: 'm4',
    userId: 'u3',
    leagueId: 'l2',
    status: 'pending',
    requestedAt: new Date('2026-03-20T15:00:00Z'),
    decidedAt: null,
  },
];

const store = new Map<string, LeagueMembership>(seed.map(m => [m.id, m]));

export function getByLeague(leagueId: string): LeagueMembership[] {
  return Array.from(store.values()).filter(m => m.leagueId === leagueId);
}

export function getByUser(userId: string): LeagueMembership[] {
  return Array.from(store.values()).filter(m => m.userId === userId);
}

export function getById(id: string): LeagueMembership | null {
  return store.get(id) ?? null;
}

export function getActiveByUser(userId: string): LeagueMembership | null {
  return (
    Array.from(store.values()).find(m => m.userId === userId && (m.status === 'approved' || m.status === 'pending')) ??
    null
  );
}

export function create(data: Omit<LeagueMembership, 'requestedAt' | 'decidedAt'>): LeagueMembership {
  console.log('[DB STUB] memberships.create', { userId: data.userId, leagueId: data.leagueId });
  const membership: LeagueMembership = { ...data, requestedAt: new Date(), decidedAt: null };
  store.set(membership.id, membership);
  return membership;
}

export function update(
  id: string,
  data: Partial<Omit<LeagueMembership, 'id' | 'userId' | 'leagueId' | 'requestedAt'>>
): LeagueMembership | null {
  const existing = store.get(id);
  if (!existing) return null;
  console.log('[DB STUB] memberships.update', { id });
  const updated: LeagueMembership = { ...existing, ...data };
  store.set(id, updated);
  return updated;
}
