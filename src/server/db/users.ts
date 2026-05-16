import type { User } from '@/types/db/users';

const now = new Date();

const seed: User[] = [
  {
    id: 'u1',
    email: 'anna.schmidt@example.com',
    name: 'Anna Schmidt',
    gender: 'female',
    lkLevel: 8.1,
    level: 'advanced',
    city: 'Berlin',
    dominantHand: 'right',
    homeClub: 'TC Blau-Weiss Berlin',
    roles: ['player'],
    createdAt: new Date('2026-01-10T10:00:00Z'),
    updatedAt: new Date('2026-01-10T10:00:00Z'),
  },
  {
    id: 'u2',
    email: 'max.weber@example.com',
    name: 'Max Weber',
    gender: 'male',
    lkLevel: 10.2,
    level: 'advanced',
    city: 'Berlin',
    dominantHand: 'right',
    homeClub: null,
    roles: ['player', 'admin'],
    createdAt: new Date('2026-01-11T09:00:00Z'),
    updatedAt: new Date('2026-01-11T09:00:00Z'),
  },
  {
    id: 'u3',
    email: 'lisa.mueller@example.com',
    name: 'Lisa Müller',
    gender: 'female',
    lkLevel: null,
    level: 'intermediate',
    city: 'München',
    dominantHand: 'left',
    homeClub: 'TC München-Süd',
    roles: ['player'],
    createdAt: new Date('2026-01-15T14:00:00Z'),
    updatedAt: new Date('2026-01-15T14:00:00Z'),
  },
  {
    id: 'u4',
    email: 'thomas.bauer@example.com',
    name: 'Thomas Bauer',
    gender: 'male',
    lkLevel: 15.5,
    level: 'intermediate',
    city: 'Berlin',
    dominantHand: 'right',
    homeClub: null,
    roles: ['player'],
    createdAt: new Date('2026-01-20T11:00:00Z'),
    updatedAt: now,
  },
];

const store = new Map<string, User>(seed.map(u => [u.id, u]));

export function getAll(): User[] {
  return Array.from(store.values());
}

export function getById(id: string): User | null {
  return store.get(id) ?? null;
}

export function getByEmail(email: string): User | null {
  return Array.from(store.values()).find(u => u.email === email) ?? null;
}

export function create(data: Omit<User, 'createdAt' | 'updatedAt'>): User {
  console.log('[DB STUB] users.create', { id: data.id, email: data.email });
  const user: User = { ...data, createdAt: new Date(), updatedAt: new Date() };
  store.set(user.id, user);
  return user;
}

export function update(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
  const existing = store.get(id);
  if (!existing) return null;
  console.log('[DB STUB] users.update', { id });
  const updated: User = { ...existing, ...data, updatedAt: new Date() };
  store.set(id, updated);
  return updated;
}

export function remove(id: string): boolean {
  console.log('[DB STUB] users.remove', { id });
  return store.delete(id);
}
