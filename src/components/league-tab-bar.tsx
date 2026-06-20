import { Link } from '@/i18n/navigation';
import { PlayerStats } from '@/lib/ranking/leagueRanking';
import { Tabs } from '@heroui/react';
import { Leaderboard } from './leaderboard';

export const LEAGUE_TABS = ['leaderboard', 'matches', 'schedule', 'players', 'info'] as const;
export type LeagueTab = (typeof LEAGUE_TABS)[number];

interface Props {
  leagueId: string;
  labels: Record<LeagueTab, string>;
  leaderboard: PlayerStats[];
  session?: { userId: string };
}

export function LeagueTabBar({ leagueId, leaderboard, labels, session }: Props) {
  return (
    <Tabs className="w-full max-w-md" variant="secondary">
      <Tabs.ListContainer>
        <Tabs.List aria-label="Options">
          {LEAGUE_TABS.map(tab => (
            <Tabs.Tab key={tab} id={tab}>
              {labels[tab]}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel className="pt-4" id="leaderboard">
        <Leaderboard leaderboard={leaderboard} session={session} />
      </Tabs.Panel>
      <Tabs.Panel className="pt-4" id="analytics">
        <p>Track your metrics and analyze performance data.</p>
      </Tabs.Panel>
      <Tabs.Panel className="pt-4" id="reports">
        <p>Generate and download detailed reports.</p>
      </Tabs.Panel>
    </Tabs>
  );
}
