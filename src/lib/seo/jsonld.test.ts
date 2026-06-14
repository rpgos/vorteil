import { describe, it, expect } from 'vitest';
import { buildOrganizationJsonLd, buildSportsEventJsonLd, buildBreadcrumbJsonLd, buildItemListJsonLd } from './jsonld';

describe('buildOrganizationJsonLd', () => {
  it('sets @context and @type', () => {
    const data = buildOrganizationJsonLd({ name: 'Vorteil', url: 'https://vorteil.app' }) as Record<string, unknown>;
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('Organization');
  });

  it('includes name and url', () => {
    const data = buildOrganizationJsonLd({ name: 'Vorteil', url: 'https://vorteil.app' }) as Record<string, unknown>;
    expect(data.name).toBe('Vorteil');
    expect(data.url).toBe('https://vorteil.app');
  });

  it('omits logo when not provided', () => {
    const data = buildOrganizationJsonLd({ name: 'Vorteil', url: 'https://vorteil.app' }) as Record<string, unknown>;
    expect(data.logo).toBeUndefined();
  });

  it('includes logo when provided', () => {
    const data = buildOrganizationJsonLd({ name: 'Vorteil', url: 'https://vorteil.app', logo: '/logo.png' }) as Record<
      string,
      unknown
    >;
    expect(data.logo).toBe('/logo.png');
  });
});

describe('buildSportsEventJsonLd', () => {
  const base = {
    name: 'Berlin Summer League 2026',
    location: 'Berlin',
    startDate: '2026-03-01',
    endDate: '2026-09-30',
  };

  it('sets @context, @type, name, location, startDate, endDate', () => {
    const data = buildSportsEventJsonLd(base) as Record<string, unknown>;
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('SportsEvent');
    expect(data.name).toBe(base.name);
    expect((data.location as Record<string, unknown>).name).toBe('Berlin');
    expect(data.startDate).toBe(base.startDate);
    expect(data.endDate).toBe(base.endDate);
  });
});

describe('buildBreadcrumbJsonLd', () => {
  const items = [
    { name: 'Home', url: 'https://vorteil.app/en' },
    { name: 'Leagues', url: 'https://vorteil.app/en/leagues' },
    { name: 'Berlin Summer League', url: 'https://vorteil.app/en/leagues/l1' },
  ];

  it('sets @context and @type', () => {
    const data = buildBreadcrumbJsonLd(items) as Record<string, unknown>;
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('BreadcrumbList');
  });

  it('includes all items with correct positions', () => {
    const data = buildBreadcrumbJsonLd(items) as Record<string, unknown>;
    const list = data.itemListElement as Array<Record<string, unknown>>;
    expect(list).toHaveLength(3);
    expect(list[0].position).toBe(1);
    expect(list[0].name).toBe('Home');
    expect(list[2].position).toBe(3);
    expect(list[2].name).toBe('Berlin Summer League');
  });
});

describe('buildItemListJsonLd', () => {
  const items = [
    { name: 'Berlin Summer League', url: 'https://vorteil.app/en/leagues/l1', position: 1 },
    { name: 'München Open', url: 'https://vorteil.app/en/leagues/l2', position: 2 },
  ];

  it('sets @type to ItemList', () => {
    const data = buildItemListJsonLd(items) as Record<string, unknown>;
    expect(data['@type']).toBe('ItemList');
  });

  it('maps all entries with position, name, url', () => {
    const data = buildItemListJsonLd(items) as Record<string, unknown>;
    const list = data.itemListElement as Array<Record<string, unknown>>;
    expect(list[1].position).toBe(2);
    expect(list[1].name).toBe('München Open');
    expect(list[1].url).toBe('https://vorteil.app/en/leagues/l2');
  });
});
