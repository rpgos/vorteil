import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { buttonVariants, Surface } from '@heroui/react';
import { MapPin, Trophy, Calendar, Users, Info } from 'lucide-react';
import { getOptionalSession } from '@/server/auth/session';
import * as leaguesDb from '@/server/db/leagues';
import * as membershipsDb from '@/server/db/memberships';
import * as matchesDb from '@/server/db/matches';
import * as scoresDb from '@/server/db/scores';
import * as usersDb from '@/server/db/users';
import { buildMetadata } from '@/lib/seo/metadata';
import { BreadcrumbJsonLd, buildSportsEventJsonLd } from '@/lib/seo/jsonld';
import { LeagueTabBar, LEAGUE_TABS } from '@/components/league-tab-bar';
import { LeagueJoinButton } from '@/components/league-join-button';
import { LeagueStartSeasonButton } from '@/components/league-start-season-button';
import { computeLeaderboard, formatScore } from '@/lib/ranking/leagueRanking';
import type { League } from '@/types/db/leagues';

type Props = {
  params: Promise<{ locale: string; leagueId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, leagueId } = await params;
  const league = leaguesDb.getById(leagueId);
  if (!league) return {};
  const t = await getTranslations({ locale, namespace: 'Leagues' });
  return buildMetadata({
    title: `${league.name} · Vorteil`,
    description: t('leagueMetaDescription', { name: league.name, city: league.city }),
    locale,
    path: `/leagues/${leagueId}`,
  });
}

export default async function LeaguePage({ params, searchParams }: Props) {
  const { locale, leagueId } = await params;
  const { tab } = await searchParams;
  setRequestLocale(locale);

  const league = leaguesDb.getById(leagueId);
  if (!league) notFound();

  const session = await getOptionalSession();
  const isAdmin = session?.roles?.includes('admin') ?? false;

  const t = await getTranslations({ locale, namespace: 'Leagues' });

  // Data
  const memberships = membershipsDb.getByLeague(leagueId);
  const approvedMemberships = memberships.filter(m => m.status === 'approved');
  const allUsers = usersDb.getAll();
  const usersMap = new Map(allUsers.map(u => [u.id, u]));
  const approvedMembers = approvedMemberships.map(m => usersMap.get(m.userId)).filter(Boolean) as NonNullable<
    ReturnType<typeof usersDb.getById>
  >[];
  const createdByUser = usersDb.getById(league.createdBy);

  const matches = matchesDb.getByLeague(leagueId);
  const playedMatches = matches
    .filter(m => m.status === 'played')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const leaderboard = computeLeaderboard(memberships, allUsers, matches, scoresDb.getByMatch);

  const currentMembership = session ? (memberships.find(m => m.userId === session.userId) ?? null) : null;

  // Validate and resolve active tab
  const activeTab = LEAGUE_TABS.includes(tab as (typeof LEAGUE_TABS)[number])
    ? (tab as (typeof LEAGUE_TABS)[number])
    : 'leaderboard';

  const tabLabels: Record<(typeof LEAGUE_TABS)[number], string> = {
    leaderboard: t('tabLeaderboard'),
    matches: t('tabMatches'),
    schedule: t('tabSchedule'),
    players: t('tabPlayers'),
    info: t('tabInfo'),
  };

  const STATUS_LABELS: Record<League['status'], Parameters<typeof t>[0]> = {
    draft: 'statusDraft',
    open: 'statusOpen',
    in_season: 'statusInSeason',
    playoffs: 'statusPlayoffs',
    finished: 'statusFinished',
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const leagueUrl = `${baseUrl}/${locale}/leagues/${leagueId}`;

  const sportsEventData = {
    ...buildSportsEventJsonLd({
      name: league.name,
      location: league.city,
      startDate: league.createdAt.toISOString(),
      endDate: (league.playoffsEnd ?? league.regularSeasonEnd).toISOString(),
      url: leagueUrl,
    }),
    competitor: approvedMembers.map(u => ({ '@type': 'Person', name: u.name })),
  };

  function daysUntil(date: Date): number {
    return Math.max(0, Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }

  const regularSeasonDaysLeft = daysUntil(league.regularSeasonEnd);
  const playoffsDaysLeft = league.playoffsEnd ? daysUntil(league.playoffsEnd) : null;

  const userScheduledMatches = session
    ? matches.filter(
        m => m.status === 'scheduled' && (m.playerAId === session.userId || m.playerBId === session.userId)
      )
    : [];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Vorteil', url: `${baseUrl}/${locale}` },
          { name: t('heading'), url: `${baseUrl}/${locale}/leagues` },
          { name: league.name, url: leagueUrl },
        ]}
      />
      {league.status !== 'draft' && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventData) }} />
      )}

      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{league.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-foreground/60">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {league.city}
              </span>
              <span className="rounded-full border border-divider px-2 py-0.5 text-xs font-medium">
                {t(STATUS_LABELS[league.status])}
              </span>
              {league.levelRange && (
                <span className="text-xs">
                  {t('levelRange', { min: league.levelRange.min, max: league.levelRange.max })}
                </span>
              )}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex shrink-0 items-center gap-2">
            {!session && (
              <Link
                href={`/login?next=/leagues/${leagueId}`}
                className={buttonVariants({ variant: 'primary', size: 'sm' })}
              >
                {t('ctaSignInToJoin')}
              </Link>
            )}
            {session && !isAdmin && !currentMembership && league.status === 'open' && (
              <LeagueJoinButton leagueId={leagueId} label={t('ctaRequestToJoin')} />
            )}
            {session && currentMembership?.status === 'pending' && (
              <span
                className={buttonVariants({ variant: 'secondary', size: 'sm', isDisabled: true } as Parameters<
                  typeof buttonVariants
                >[0])}
              >
                {t('ctaRequestPending')}
              </span>
            )}
            {session && currentMembership?.status === 'approved' && !isAdmin && (
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                {t('ctaMemberPill')}
              </span>
            )}
            {isAdmin && league.status === 'open' && (
              <LeagueStartSeasonButton leagueId={leagueId} label={t('ctaStartSeason')} />
            )}
            {isAdmin && (
              <Link
                href={`/leagues/${leagueId}/manage`}
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                {t('ctaManageLeague')}
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <LeagueTabBar leagueId={leagueId} activeTab={activeTab} labels={tabLabels} />

        {/* Tab content */}
        <div className="mt-6">
          {/* ─── Leaderboard ─── */}
          {activeTab === 'leaderboard' && (
            <div>
              {leaderboard.length === 0 ? (
                <p className="text-center text-sm text-foreground/60">{t('leaderboardEmpty')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-divider text-left text-xs text-foreground/50">
                        <th className="pb-2 pr-4 font-medium">{t('leaderboardRank')}</th>
                        <th className="pb-2 pr-4 font-medium">{t('leaderboardPlayer')}</th>
                        <th className="pb-2 pr-4 text-center font-medium">{t('leaderboardPlayed')}</th>
                        <th className="pb-2 pr-4 text-center font-medium">{t('leaderboardWon')}</th>
                        <th className="pb-2 pr-4 text-center font-medium">{t('leaderboardLost')}</th>
                        <th className="pb-2 pr-4 text-center font-medium">{t('leaderboardSets')}</th>
                        <th className="pb-2 pr-4 text-center font-medium">{t('leaderboardGames')}</th>
                        <th className="pb-2 text-center font-medium">{t('leaderboardPoints')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((row, i) => {
                        const isCurrentUser = session?.userId === row.userId;
                        return (
                          <tr
                            key={row.userId}
                            className={[
                              'border-b border-divider/50 last:border-0',
                              isCurrentUser ? 'bg-primary/5' : '',
                            ].join(' ')}
                          >
                            <td className="py-3 pr-4 text-foreground/50">{i + 1}</td>
                            <td className="py-3 pr-4">
                              <Link href={`/users/${row.userId}`} className="font-medium hover:underline">
                                {row.name}
                              </Link>
                            </td>
                            <td className="py-3 pr-4 text-center">{row.played}</td>
                            <td className="py-3 pr-4 text-center">{row.won}</td>
                            <td className="py-3 pr-4 text-center">{row.lost}</td>
                            <td className="py-3 pr-4 text-center">
                              {row.setsWon}–{row.setsLost}
                            </td>
                            <td className="py-3 pr-4 text-center">
                              {row.gamesWon}–{row.gamesLost}
                            </td>
                            <td className="py-3 text-center font-semibold">{row.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─── Matches ─── */}
          {activeTab === 'matches' && (
            <div>
              {playedMatches.length === 0 ? (
                <p className="text-center text-sm text-foreground/60">{t('matchesEmpty')}</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {playedMatches.map(match => {
                    const playerA = usersMap.get(match.playerAId);
                    const playerB = usersMap.get(match.playerBId);
                    const score = scoresDb.getByMatch(match.id);
                    const scoreStr = score ? formatScore(score) : '';
                    return (
                      <Surface
                        key={match.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-divider p-4"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <Link
                            href={`/users/${match.playerAId}`}
                            className={score?.winnerId === match.playerAId ? 'font-semibold' : 'text-foreground/70'}
                          >
                            {playerA?.name ?? match.playerAId}
                          </Link>
                          <span className="text-foreground/40">{t('scheduleVs')}</span>
                          <Link
                            href={`/users/${match.playerBId}`}
                            className={score?.winnerId === match.playerBId ? 'font-semibold' : 'text-foreground/70'}
                          >
                            {playerB?.name ?? match.playerBId}
                          </Link>
                        </div>
                        <span className="shrink-0 font-mono text-sm text-foreground/80">{scoreStr}</span>
                      </Surface>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── Schedule ─── */}
          {activeTab === 'schedule' && (
            <div className="flex flex-col gap-6">
              {/* Countdown cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Surface className="flex flex-col items-center gap-1 rounded-2xl border border-divider p-6 text-center">
                  <Calendar size={20} className="text-foreground/40" />
                  <p className="mt-1 text-3xl font-bold">{regularSeasonDaysLeft}</p>
                  <p className="text-sm text-foreground/60">
                    {t('scheduleRegularSeasonEnds', { days: regularSeasonDaysLeft })}
                  </p>
                </Surface>
                {league.hasPlayoffs && playoffsDaysLeft !== null && (
                  <Surface className="flex flex-col items-center gap-1 rounded-2xl border border-divider p-6 text-center">
                    <Trophy size={20} className="text-foreground/40" />
                    <p className="mt-1 text-3xl font-bold">{playoffsDaysLeft}</p>
                    <p className="text-sm text-foreground/60">{t('schedulePlayoffsEnd', { days: playoffsDaysLeft })}</p>
                  </Surface>
                )}
              </div>

              {/* Current user's upcoming matches */}
              {session && (
                <div>
                  <h2 className="mb-3 text-base font-semibold">{t('scheduleYourMatches')}</h2>
                  {userScheduledMatches.length === 0 ? (
                    <p className="text-sm text-foreground/60">{t('scheduleNoMatches')}</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {userScheduledMatches.map(match => {
                        const opponentId = match.playerAId === session.userId ? match.playerBId : match.playerAId;
                        const opponent = usersMap.get(opponentId);
                        return (
                          <Surface
                            key={match.id}
                            className="flex items-center justify-between gap-4 rounded-xl border border-divider p-4"
                          >
                            <div className="flex items-center gap-2 text-sm">
                              <span>{t('scheduleVs')}</span>
                              <Link href={`/users/${opponentId}`} className="font-medium hover:underline">
                                {opponent?.name ?? opponentId}
                              </Link>
                            </div>
                            <Link
                              href={`/leagues/${leagueId}/matches/${match.id}/submit`}
                              className={buttonVariants({ variant: 'primary', size: 'sm' })}
                            >
                              {t('scheduleSubmitScore')}
                            </Link>
                          </Surface>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─── Players ─── */}
          {activeTab === 'players' && (
            <div>
              {approvedMembers.length === 0 ? (
                <p className="text-center text-sm text-foreground/60">{t('playersEmpty')}</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {approvedMembers.map(user => {
                    const initials = user.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <Surface key={user.id} className="flex items-center gap-4 rounded-xl border border-divider p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={`/users/${user.id}`} className="block truncate font-medium hover:underline">
                            {user.name}
                          </Link>
                          <p className="truncate text-xs text-foreground/60">{user.city}</p>
                        </div>
                        {session && session.userId !== user.id && (
                          <Link href={`/users/${user.id}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                            {t('playersProposeMatch')}
                          </Link>
                        )}
                      </Surface>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── Info ─── */}
          {activeTab === 'info' && (
            <div className="flex flex-col gap-6">
              {league.description && (
                <section>
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/50">
                    {t('infoDescription')}
                  </h2>
                  <p className="text-sm leading-relaxed">{league.description}</p>
                </section>
              )}

              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">
                  {t('infoFormat')}
                </h2>
                <dl className="grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
                  <dt className="text-foreground/60">{t('infoFormat')}</dt>
                  <dd>{t('infoFormatValue')}</dd>
                  <dt className="text-foreground/60">{t('infoRounds')}</dt>
                  <dd>{league.regularSeasonRounds}</dd>
                  <dt className="text-foreground/60">{t('infoCity')}</dt>
                  <dd>{league.city}</dd>
                  {league.levelRange && (
                    <>
                      <dt className="text-foreground/60">{t('infoLevelRange')}</dt>
                      <dd>{t('levelRange', { min: league.levelRange.min, max: league.levelRange.max })}</dd>
                    </>
                  )}
                  {!league.levelRange && (
                    <>
                      <dt className="text-foreground/60">{t('infoLevelRange')}</dt>
                      <dd>{t('infoLevelRangeOpen')}</dd>
                    </>
                  )}
                  <dt className="text-foreground/60">{t('infoMaxParticipants')}</dt>
                  <dd>{league.maxParticipants ?? t('infoMaxParticipantsUnlimited')}</dd>
                </dl>
              </section>

              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">
                  {t('infoKeyDates')}
                </h2>
                <dl className="grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
                  <dt className="text-foreground/60">{t('infoRegularSeasonEnd')}</dt>
                  <dd>
                    {league.regularSeasonEnd.toLocaleDateString(locale, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </dd>
                  {league.hasPlayoffs && league.playoffsEnd && (
                    <>
                      <dt className="text-foreground/60">{t('infoPlayoffsEnd')}</dt>
                      <dd>
                        {league.playoffsEnd.toLocaleDateString(locale, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </dd>
                    </>
                  )}
                  {createdByUser && (
                    <>
                      <dt className="text-foreground/60">{t('infoCreatedBy')}</dt>
                      <dd>
                        <Link href={`/users/${createdByUser.id}`} className="hover:underline">
                          {createdByUser.name}
                        </Link>
                      </dd>
                    </>
                  )}
                </dl>
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
