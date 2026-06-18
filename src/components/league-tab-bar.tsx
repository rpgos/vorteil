import { Link } from '@/i18n/navigation';

export const LEAGUE_TABS = ['leaderboard', 'matches', 'schedule', 'players', 'info'] as const;
export type LeagueTab = (typeof LEAGUE_TABS)[number];

interface Props {
  leagueId: string;
  activeTab: LeagueTab;
  labels: Record<LeagueTab, string>;
}

export function LeagueTabBar({ leagueId, activeTab, labels }: Props) {
  return (
    <div className="flex overflow-x-auto border-b border-divider" role="tablist" aria-label="League sections">
      {LEAGUE_TABS.map(tab => (
        <Link
          key={tab}
          href={`/leagues/${leagueId}?tab=${tab}`}
          role="tab"
          aria-selected={tab === activeTab}
          className={[
            'whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors',
            tab === activeTab
              ? '-mb-px border-b-2 border-primary text-primary'
              : 'text-foreground/60 hover:text-foreground',
          ].join(' ')}
        >
          {labels[tab]}
        </Link>
      ))}
    </div>
  );
}
