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
import { Surface } from '@heroui/react';
import { Calendar1, Gauge, Hand, MapPin } from 'lucide-react';

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
        if (score.superTiebreakA != null) scoreStr += `, ${score.superTiebreakA}–${score.superTiebreakB}`;
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
    <main className="flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center p-4 gap-8">
      <h1 className="text-3xl font-bold">{user.name}</h1>
      <section className="w-full max-w-2xl">
        <div className="flex flex-row w-full gap-4 justify-evenly items-center text-center">
          <div className="flex flex-col items-center justify-center p-4 gap-3">
            <Hand />
            {dominantHandLabel}
          </div>
          <div className="flex flex-col items-center justify-center p-4 gap-3">
            <Gauge />
            {user.lkLevel || levelLabels[user.level] || t('notAvailable')}
          </div>
          <div className="flex flex-col items-center justify-center p-4 gap-3">
            <Calendar1 />
            {user.createdAt.toLocaleDateString(locale, { year: 'numeric', month: 'long' })}
          </div>
          <div className="flex flex-col items-center justify-center p-4 gap-3">
            <MapPin />
            {user.city}
          </div>
        </div>
      </section>

      <section className="w-full max-w-2xl">
        <h2 className="mb-3 text-lg font-semibold">{t('statsTitle')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t('matchesPlayed'), value: playedMatches.length },
            { label: t('wins'), value: wins },
            { label: t('losses'), value: losses },
            { label: t('winRate'), value: `${winRate}%` },
          ].map(({ label, value }) => (
            <Surface
              key={label}
              className="flex flex-col items-center justify-center rounded-3xl border border-accent p-4"
            >
              <span className="text-2xl font-bold">{value}</span>
              <span className="mt-1 text-xs text-foreground/60">{label}</span>
            </Surface>
          ))}
        </div>
      </section>

      <div className={`grid w-full max-w-2xl gap-4 ${isOwnProfile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        {/* Recent matches */}
        <section className={isOwnProfile ? 'col-span-1' : 'md:col-span-2 md:order-1 order-2'}>
          <h2 className="mb-3 text-lg font-semibold">{t('recentMatchesTitle')}</h2>
          {recentMatches.length === 0 ? (
            <p className="text-sm text-foreground/60">{t('noRecentMatches')}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {recentMatches.map(({ match, opponent, league, won, scoreStr }) => (
                <Surface
                  key={match.id}
                  variant="secondary"
                  className={`flex items-center rounded-3xl p-4 border ${won ? 'border-success' : 'border-danger/70'}`}
                >
                  <div className="flex flex-col gap-0.5 flex-1">
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
                </Surface>
              ))}
            </ul>
          )}
        </section>

        {!isOwnProfile && (
          <section className="col-span-1 flex flex-col md:order-2 order-1">
            <h2 className="mb-3 text-lg font-semibold">{t('headToHeadTitle')}</h2>
            <Surface className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-accent p-4 text-center">
              {hasH2H ? (
                <p className="text-2xl font-bold">{t('headToHeadRecord', { wins: h2hWins, losses: h2hLosses })}</p>
              ) : (
                <p className="text-sm text-foreground/60">{t('noHeadToHead')}</p>
              )}
            </Surface>
          </section>
        )}
      </div>
    </main>
  );
}
