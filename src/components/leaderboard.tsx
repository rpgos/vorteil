import { PlayerStats } from '@/lib/ranking/leagueRanking';
import Link from 'next/link';

interface LeaderboardProps {
  leaderboard: PlayerStats[];
  session?: { userId: string };
}

export function Leaderboard({ leaderboard, session }: LeaderboardProps) {
  return (
    <div>
      {leaderboard.length === 0 ? (
        <p className="text-center text-sm text-foreground/60">no matches yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider text-left text-xs text-foreground/50">
                <th className="pb-2 pr-4 font-medium">#</th>
                <th className="pb-2 pr-4 font-medium">player</th>
                <th className="pb-2 pr-4 text-center font-medium">P</th>
                <th className="pb-2 pr-4 text-center font-medium">W</th>
                <th className="pb-2 pr-4 text-center font-medium">L</th>
                <th className="pb-2 pr-4 text-center font-medium">Sets</th>
                <th className="pb-2 pr-4 text-center font-medium">Games</th>
                <th className="pb-2 text-center font-medium">Pts</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => {
                const isCurrentUser = session?.userId === row.userId;
                return (
                  <tr
                    key={row.userId}
                    className={['border-b border-divider/50 last:border-0', isCurrentUser ? 'bg-primary/5' : ''].join(
                      ' '
                    )}
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
  );
}
