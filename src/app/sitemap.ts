import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/routing';
import * as leaguesDb from '@/server/db/leagues';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

const staticPaths: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacy', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/leagues', changeFrequency: 'daily', priority: 0.9 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    // Static pages
    for (const { path, changeFrequency, priority } of staticPaths) {
      entries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: now,
        changeFrequency,
        priority,
      });
    }

    // Non-draft league detail pages
    const leagues = leaguesDb.getAll().filter(l => l.status !== 'draft');
    for (const league of leagues) {
      entries.push({
        url: `${baseUrl}/${locale}/leagues/${league.id}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }
  }

  return entries;
}
