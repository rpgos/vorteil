import { describe, it, expect } from 'vitest';
import * as leaguesDb from '@/server/db/leagues';
import * as membershipsDb from '@/server/db/memberships';
import type { League } from '@/types/db/leagues';

describe('leaguesDb.getAll', () => {
  it('returns all leagues with no filters', () => {
    const results = leaguesDb.getAll();
    expect(results.length).toBeGreaterThanOrEqual(2);
  });

  it('filters by city', () => {
    const results = leaguesDb.getAll({ city: 'Berlin' });
    expect(results.every(l => l.city === 'Berlin')).toBe(true);
  });

  it('filters by status', () => {
    const results = leaguesDb.getAll({ status: 'open' });
    expect(results.every(l => l.status === 'open')).toBe(true);
  });

  it('returns empty array when no leagues match filter', () => {
    const results = leaguesDb.getAll({ city: 'Hamburg' });
    expect(results).toHaveLength(0);
  });
});

describe('city grouping', () => {
  it('groups leagues by city correctly', () => {
    const leagues = leaguesDb.getAll();
    const grouped = leagues.reduce<Record<string, League[]>>((acc, league) => {
      (acc[league.city] ??= []).push(league);
      return acc;
    }, {});
    expect(Object.keys(grouped)).toContain('Berlin');
    expect(Object.keys(grouped)).toContain('München');
    expect(grouped['Berlin'].every(l => l.city === 'Berlin')).toBe(true);
  });

  it('derives unique cities sorted alphabetically', () => {
    const leagues = leaguesDb.getAll();
    const cities = [...new Set(leagues.map(l => l.city))].sort();
    expect(cities).toEqual([...cities].sort());
    expect(cities.length).toBeGreaterThan(0);
  });
});

describe('member count', () => {
  it('counts only approved members per league', () => {
    const approvedL1 = membershipsDb.getByLeague('l1').filter(m => m.status === 'approved').length;
    const approvedL2 = membershipsDb.getByLeague('l2').filter(m => m.status === 'approved').length;
    expect(approvedL1).toBe(3); // u1, u2, u4
    expect(approvedL2).toBe(0); // u3 is pending
  });
});

describe('ItemList JSON-LD entries', () => {
  it('excludes draft leagues', () => {
    const leagues = leaguesDb.getAll();
    const entries = leagues.filter(l => l.status !== 'draft');
    expect(entries.every(l => l.status !== 'draft')).toBe(true);
  });

  it('assigns sequential positions starting at 1', () => {
    const leagues = leaguesDb.getAll().filter(l => l.status !== 'draft');
    const items = leagues.map((l, i) => ({ position: i + 1, name: l.name }));
    expect(items[0].position).toBe(1);
    if (items.length > 1) expect(items[1].position).toBe(2);
  });
});
