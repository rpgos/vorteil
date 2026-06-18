'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Spinner } from '@heroui/react';
import { requestJoinLeague } from '@/server/actions/leagues';

interface Props {
  leagueId: string;
  label: string;
}

export function LeagueJoinButton({ leagueId, label }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const result = await requestJoinLeague(leagueId);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <Button variant="primary" isDisabled={isPending} onClick={handleClick}>
      {isPending ? <Spinner size="sm" color="current" /> : label}
    </Button>
  );
}
