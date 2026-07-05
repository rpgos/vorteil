import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@heroui/react';
import { Plus } from 'lucide-react';
import { getOptionalSession } from '@/server/auth/session';
import * as leaguesDb from '@/server/db/leagues';
import * as membershipsDb from '@/server/db/memberships';
import { buildMetadata } from '@/lib/seo/metadata';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/lib/seo/jsonld';
import { LeagueFilters } from '@/components/league-filters';
import { LeagueCard } from '@/components/league-card';
import type { League } from '@/types/db/leagues';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ city?: string; status?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Leagues' });
  return buildMetadata({
    title: t('pageTitle'),
    description: t('pageDescription'),
    locale,
    path: '/leagues',
  });
}

export default async function LeaguesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { city, status } = await searchParams;
  setRequestLocale(locale);

  const session = await getOptionalSession();
  const isAdmin = session?.roles?.includes('admin') ?? false;

  const t = await getTranslations({ locale, namespace: 'Leagues' });

  const allLeagues = await leaguesDb.getAll();
  const cities = [...new Set(allLeagues.map(l => l.city))].sort();

  const filtered = await leaguesDb.getAll({
    city: city || undefined,
    status: (status as League['status']) || undefined,
  });

  // Group by city
  const grouped = filtered.reduce<Record<string, League[]>>((acc, league) => {
    (acc[league.city] ??= []).push(league);
    return acc;
  }, {});

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  // Build ItemList JSON-LD from visible non-draft leagues
  const itemListEntries = filtered
    .filter(l => l.status !== 'draft')
    .map((l, i) => ({ name: l.name, url: `${baseUrl}/${locale}/leagues/${l.id}`, position: i + 1 }));

  const filterLabels = {
    filterCity: t('filterCity'),
    filterStatus: t('filterStatus'),
    filterAllCities: t('filterAllCities'),
    filterAllStatuses: t('filterAllStatuses'),
    statusOpen: t('statusOpen'),
    statusInSeason: t('statusInSeason'),
    statusPlayoffs: t('statusPlayoffs'),
    statusFinished: t('statusFinished'),
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Vorteil', url: `${baseUrl}/${locale}` },
          { name: t('heading'), url: `${baseUrl}/${locale}/leagues` },
        ]}
      />
      {itemListEntries.length > 0 && <ItemListJsonLd items={itemListEntries} />}

      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">{t('heading')}</h1>
          {isAdmin && (
            <Link href="/leagues/create" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
              <Plus size={16} />
              {t('createLeague')}
            </Link>
          )}
        </div>

        <LeagueFilters cities={cities} labels={filterLabels} />

        {Object.keys(grouped).length === 0 ? (
          <p className="mt-10 text-center text-sm text-foreground/60">{t('emptyState')}</p>
        ) : (
          <div className="mt-8 flex flex-col gap-10">
            {Object.entries(grouped).map(([city, cityLeagues]) => (
              <section key={city}>
                <h2 className="mb-4 text-xl font-semibold">{city}</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cityLeagues.map(league => {
                    // TODO: get member count for each league. This is currently commented out because it would require multiple database queries, which could be inefficient. Consider optimizing this by fetching member counts in bulk or caching them.
                    // const memberCount = membershipsDb
                    //   .getByLeague(league.id)
                    //   .filter(m => m.status === 'approved').length;

                    const STATUS_LABELS: Record<League['status'], Parameters<typeof t>[0]> = {
                      draft: 'statusDraft',
                      open: 'statusOpen',
                      in_season: 'statusInSeason',
                      playoffs: 'statusPlayoffs',
                      finished: 'statusFinished',
                    };

                    return (
                      <LeagueCard
                        key={league.id}
                        league={league}
                        memberCount={0}
                        labels={{
                          statusLabel: t(STATUS_LABELS[league.status]),
                          level: league.level,
                          levelRange: league.levelRange
                            ? t('levelRange', { min: league.levelRange.min, max: league.levelRange.max })
                            : t('levelRangeOpen'),
                          regularSeasonEnd: t('regularSeasonEnd', {
                            date: league.regularSeasonEnd.toLocaleDateString(locale, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }),
                          }),
                          members: t('members', { count: 0 }),
                        }}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
