import { Link } from '@/i18n/navigation';
import { Surface } from '@heroui/react';
import { Calendar, Users } from 'lucide-react';
import type { League } from '@/types/db/leagues';

const STATUS_COLORS: Record<League['status'], string> = {
  draft: 'bg-foreground/10 text-foreground/60',
  open: 'bg-success/60',
  in_season: 'bg-primary/60',
  playoffs: 'bg-warning/60',
  finished: 'bg-foreground/10',
};

type Props = {
  league: League;
  memberCount: number;
  labels: {
    statusLabel: string;
    level: string | null;
    levelRange: string;
    regularSeasonEnd: string;
    members: string;
  };
};

export function LeagueCard({ league, labels }: Props) {
  return (
    <Link href={`/leagues/${league.id}`} className="block">
      <Surface className="flex cursor-pointer flex-col gap-4 rounded-3xl border border-divider p-5 transition-transform duration-200 hover:scale-[1.03]">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-snug">{league.name}</h3>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[league.status]}`}>
            {labels.statusLabel}
          </span>
        </div>

        <p className="text-sm text-foreground/60 capitalize">
          {labels.level ? `${labels.level} · ` : ''}
          {labels.levelRange}
        </p>

        <div className="flex flex-wrap gap-4 text-xs text-foreground/60">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            {labels.regularSeasonEnd}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={13} />
            {labels.members}
          </span>
        </div>
      </Surface>
    </Link>
  );
}
