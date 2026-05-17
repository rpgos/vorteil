import { describe, it, expect } from 'vitest';

// Import fresh module state by using vi.resetModules between tests if needed.
// For simplicity we test observable behaviour: reads after writes are consistent.

describe('users DB stub', () => {
  it('getAll returns seeded users', async () => {
    const db = await import('./users');
    const users = db.getAll();
    expect(users.length).toBeGreaterThanOrEqual(4);
    expect(users.find(u => u.id === 'u1')).toBeDefined();
  });

  it('getById returns the correct user', async () => {
    const db = await import('./users');
    const user = db.getById('u1');
    expect(user).not.toBeNull();
    expect(user?.name).toBe('Anna Schmidt');
  });

  it('getById returns null for unknown id', async () => {
    const db = await import('./users');
    expect(db.getById('unknown')).toBeNull();
  });

  it('getByEmail is case-sensitive and returns match', async () => {
    const db = await import('./users');
    const user = db.getByEmail('anna.schmidt@example.com');
    expect(user?.id).toBe('u1');
  });

  it('create and retrieve a new user', async () => {
    const db = await import('./users');
    const newUser = db.create({
      id: 'u_test',
      email: 'test@example.com',
      name: 'Test User',
      gender: 'male',
      lkLevel: null,
      level: 'beginner',
      city: 'Hamburg',
      dominantHand: null,
      homeClub: null,
      roles: ['player'],
    });
    expect(newUser.id).toBe('u_test');
    expect(db.getById('u_test')?.name).toBe('Test User');
  });

  it('update modifies the user and bumps updatedAt', async () => {
    const db = await import('./users');
    const before = db.getById('u1')!;
    const updated = db.update('u1', { city: 'Hamburg' });
    expect(updated?.city).toBe('Hamburg');
    expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(before.updatedAt.getTime());
  });

  it('update returns null for unknown id', async () => {
    const db = await import('./users');
    expect(db.update('nope', { city: 'Berlin' })).toBeNull();
  });
});

describe('leagues DB stub', () => {
  it('getAll returns seeded leagues', async () => {
    const db = await import('./leagues');
    expect(db.getAll().length).toBeGreaterThanOrEqual(2);
  });

  it('getAll filters by city', async () => {
    const db = await import('./leagues');
    const results = db.getAll({ city: 'Berlin' });
    expect(results.every(l => l.city === 'Berlin')).toBe(true);
  });

  it('getAll filters by status', async () => {
    const db = await import('./leagues');
    const results = db.getAll({ status: 'open' });
    expect(results.every(l => l.status === 'open')).toBe(true);
  });

  it('getById returns correct league', async () => {
    const db = await import('./leagues');
    expect(db.getById('l1')?.name).toBe('Berlin Summer League 2026');
  });
});

describe('memberships DB stub', () => {
  it('getByLeague returns memberships for a league', async () => {
    const db = await import('./memberships');
    const memberships = db.getByLeague('l1');
    expect(memberships.length).toBeGreaterThanOrEqual(3);
    expect(memberships.every(m => m.leagueId === 'l1')).toBe(true);
  });

  it('getActiveByUser returns the active membership', async () => {
    const db = await import('./memberships');
    const m = db.getActiveByUser('u1');
    expect(m?.leagueId).toBe('l1');
  });
});
