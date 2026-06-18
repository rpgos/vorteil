'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Spinner } from '@heroui/react';
import { startSeason } from '@/server/actions/leagues';

interface Props {
  leagueId: string;
  label: string;
}

export function LeagueStartSeasonButton({ leagueId, label }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const result = await startSeason(leagueId);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <Button variant="secondary" isDisabled={isPending} onClick={handleClick}>
      {isPending ? <Spinner size="sm" color="current" /> : label}
    </Button>
  );
}
