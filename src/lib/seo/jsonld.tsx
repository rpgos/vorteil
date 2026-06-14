import type { JSX } from 'react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function JsonLdScript(data: object): JSX.Element {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

export type OrganizationJsonLdProps = {
  name: string;
  url: string;
  logo?: string;
};

export function buildOrganizationJsonLd({ name, url, logo }: OrganizationJsonLdProps): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    ...(logo && { logo }),
  };
}

export function OrganizationJsonLd(props: OrganizationJsonLdProps): JSX.Element {
  return JsonLdScript(buildOrganizationJsonLd(props));
}

// ---------------------------------------------------------------------------
// SportsEvent
// ---------------------------------------------------------------------------

export type SportsEventJsonLdProps = {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  url?: string;
};

export function buildSportsEventJsonLd({ name, location, startDate, endDate, url }: SportsEventJsonLdProps): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name,
    location: { '@type': 'Place', name: location },
    startDate,
    endDate,
    ...(url && { url }),
  };
}

export function SportsEventJsonLd(props: SportsEventJsonLdProps): JSX.Element {
  return JsonLdScript(buildSportsEventJsonLd(props));
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------

export type BreadcrumbItem = { name: string; url: string };

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }): JSX.Element {
  return JsonLdScript(buildBreadcrumbJsonLd(items));
}

// ---------------------------------------------------------------------------
// ItemList (for leagues index)
// ---------------------------------------------------------------------------

export type ItemListEntry = { name: string; url: string; position: number };

export function buildItemListJsonLd(items: ItemListEntry[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  };
}

export function ItemListJsonLd({ items }: { items: ItemListEntry[] }): JSX.Element {
  return JsonLdScript(buildItemListJsonLd(items));
}
