import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { requireSession } from '@/server/auth/guards';
import * as usersDb from '@/server/db/users';
import * as matchesDb from '@/server/db/matches';
import * as scoresDb from '@/server/db/scores';
import * as leaguesDb from '@/server/db/leagues';
import * as membershipsDb from '@/server/db/memberships';

type Props = { params: Promise<{ locale: string; userId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, userId } = await params;
  const user = usersDb.getById(userId);
  if (!user) return {};
  const t = await getTranslations({ locale, namespace: 'UserProfile' });
  return {
    title: `${user.name} · Vorteil`,
    description: `${user.name} — ${t('cityLabel')}: ${user.city}`,
    robots: { index: false, follow: false },
  };
}

function initials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default async function UserPublicProfilePage({ params }: Props) {
  const { locale, userId } = await params;
  setRequestLocale(locale);

  const session = await requireSession();
  const user = usersDb.getById(userId);
  if (!user) notFound();

  const t = await getTranslations({ locale, namespace: 'UserProfile' });

  // Played matches for this user
  const playedMatches = matchesDb.getByPlayer(userId);

  // Compute stats
  const wins = playedMatches.filter(m => {
    const score = scoresDb.getByMatch(m.id);
    return score?.winnerId === userId;
  }).length;
  const losses = playedMatches.length - wins;
  const winRate = playedMatches.length > 0 ? Math.round((wins / playedMatches.length) * 100) : 0;

  // Active league rank (stub: count approved members with more wins)
  const activeMembership = membershipsDb.getByUser(userId).find(m => m.status === 'approved');
  let rankLabel: string | null = null;
  if (activeMembership) {
    const league = leaguesDb.getById(activeMembership.leagueId);
    if (league) {
      const members = membershipsDb.getByLeague(league.id).filter(m => m.status === 'approved');
      const memberWins = members.map(m => {
        const memberMatches = matchesDb.getByPlayer(m.userId);
        const w = memberMatches.filter(match => {
          const score = scoresDb.getByMatch(match.id);
          return score?.winnerId === m.userId;
        }).length;
        return { userId: m.userId, wins: w };
      });
      memberWins.sort((a, b) => b.wins - a.wins);
      const rank = memberWins.findIndex(e => e.userId === userId) + 1;
      rankLabel = t('rankInLeague', { rank, league: league.name });
    }
  }

  // Recent played matches (last 5), most recent first
  const recentMatches = [...playedMatches]
    .sort((a, b) => {
      const sa = scoresDb.getByMatch(a.id)?.submittedAt?.getTime() ?? 0;
      const sb = scoresDb.getByMatch(b.id)?.submittedAt?.getTime() ?? 0;
      return sb - sa;
    })
    .slice(0, 5)
    .map(m => {
      const score = scoresDb.getByMatch(m.id);
      const opponentId = m.playerAId === userId ? m.playerBId : m.playerAId;
      const opponent = usersDb.getById(opponentId);
      const league = leaguesDb.getById(m.leagueId);
      const won = score?.winnerId === userId;
      let scoreStr = '';
      if (score) {
        scoreStr = `${score.set1A}–${score.set1B}, ${score.set2A}–${score.set2B}`;
        if (score.superTiebreakA != null) scoreStr += `, [${score.superTiebreakA}–${score.superTiebreakB}]`;
      }
      return { match: m, score, opponent, league, won, scoreStr };
    });

  // Head-to-head (only when viewer ≠ profile user)
  const isOwnProfile = session.userId === userId;
  let h2hWins = 0;
  let h2hLosses = 0;
  let hasH2H = false;
  if (!isOwnProfile) {
    const viewerId = session.userId;
    const h2hMatches = playedMatches.filter(
      m => (m.playerAId === userId && m.playerBId === viewerId) || (m.playerBId === userId && m.playerAId === viewerId)
    );
    hasH2H = h2hMatches.length > 0;
    h2hWins = h2hMatches.filter(m => {
      const score = scoresDb.getByMatch(m.id);
      return score?.winnerId === viewerId;
    }).length;
    h2hLosses = h2hMatches.length - h2hWins;
  }

  const levelLabels: Record<string, string> = {
    beginner: t('levelBeginner'),
    intermediate: t('levelIntermediate'),
    advanced: t('levelAdvanced'),
    pro: t('levelPro'),
  };

  const dominantHandLabel =
    user.dominantHand === 'right'
      ? t('dominantHandRight')
      : user.dominantHand === 'left'
        ? t('dominantHandLeft')
        : t('notAvailable');

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
      {/* Header card */}
      <div className="flex items-center gap-5 rounded-3xl border border-divider bg-content1 p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
          {initials(user.name)}
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-foreground/60">
            <span>{user.city}</span>
            {user.lkLevel != null ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {t('lkLevelLabel')} {user.lkLevel}
              </span>
            ) : (
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                {levelLabels[user.level]}
              </span>
            )}
            {user.dominantHand && (
              <span>
                {t('dominantHandLabel')}: {dominantHandLabel}
              </span>
            )}
            {user.homeClub && (
              <span>
                {t('homeClubLabel')}: {user.homeClub}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">{t('statsTitle')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t('matchesPlayed'), value: playedMatches.length },
            { label: t('wins'), value: wins },
            { label: t('losses'), value: losses },
            { label: t('winRate'), value: `${winRate}%` },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center rounded-2xl border border-divider bg-content1 p-4">
              <span className="text-2xl font-bold">{value}</span>
              <span className="mt-1 text-xs text-foreground/60">{label}</span>
            </div>
          ))}
        </div>
        {rankLabel && (
          <p className="mt-3 text-sm text-foreground/60">
            {t('currentRank')}: <span className="font-medium text-foreground">{rankLabel}</span>
          </p>
        )}
        {!rankLabel && <p className="mt-3 text-sm text-foreground/60">{t('noActiveLeague')}</p>}
      </section>

      {/* Head-to-head */}
      {!isOwnProfile && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t('headToHeadTitle')}</h2>
          {hasH2H ? (
            <p className="text-2xl font-bold">{t('headToHeadRecord', { wins: h2hWins, losses: h2hLosses })}</p>
          ) : (
            <p className="text-sm text-foreground/60">{t('noHeadToHead')}</p>
          )}
        </section>
      )}

      {/* Recent matches */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">{t('recentMatchesTitle')}</h2>
        {recentMatches.length === 0 ? (
          <p className="text-sm text-foreground/60">{t('noRecentMatches')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentMatches.map(({ match, opponent, league, won, scoreStr }) => (
              <li
                key={match.id}
                className="flex items-center justify-between rounded-2xl border border-divider bg-content1 px-4 py-3 text-sm"
              >
                <div className="flex flex-col gap-0.5">
                  <span>
                    {t('vs')}{' '}
                    {opponent ? (
                      <Link href={`/users/${opponent.id}`} className="font-medium hover:underline">
                        {opponent.name}
                      </Link>
                    ) : (
                      t('notAvailable')
                    )}
                  </span>
                  {league && <span className="text-xs text-foreground/50">{league.name}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs">{scoreStr}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      won ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {won ? t('won') : t('lost')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
