'use server';

import { redirect } from 'next/navigation';
import { requireRole } from '@/server/auth/guards';
import * as leaguesDb from '@/server/db/leagues';
import { createLeagueSchema } from '@/lib/validation/leagues';
import type { ActionResult } from '@/types/action';

export async function createLeague(
  _prevState: ActionResult<null> | null,
  formData: FormData
): Promise<ActionResult<null>> {
  const session = await requireRole('admin');

  const optStr = (key: string): string | undefined => {
    const v = formData.get(key);
    if (!v) return undefined;
    const s = String(v).trim();
    return s || undefined;
  };

  const levelMinRaw = optStr('levelMin');
  const levelMaxRaw = optStr('levelMax');

  const raw = {
    name: formData.get('name'),
    city: formData.get('city'),
    levelRange: levelMinRaw && levelMaxRaw ? { min: Number(levelMinRaw), max: Number(levelMaxRaw) } : undefined,
    regularSeasonRounds: Number(formData.get('regularSeasonRounds') || 8),
    hasPlayoffs: formData.get('hasPlayoffs') === 'true',
    regularSeasonEnd: formData.get('regularSeasonEnd'),
    playoffsEnd: optStr('playoffsEnd'),
    maxParticipants: optStr('maxParticipants') ? Number(formData.get('maxParticipants')) : undefined,
    description: optStr('description'),
  };

  const result = createLeagueSchema.safeParse(raw);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[issue.path.length - 1]?.toString() ?? 'root';
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      error: { code: 'VALIDATION', message: 'Please check the highlighted fields.', fieldErrors },
    };
  }

  const id = crypto.randomUUID();
  leaguesDb.create({
    id,
    name: result.data.name,
    city: result.data.city,
    levelRange: result.data.levelRange ?? null,
    level: null,
    regularSeasonRounds: result.data.regularSeasonRounds,
    hasPlayoffs: result.data.hasPlayoffs,
    regularSeasonEnd: result.data.regularSeasonEnd,
    playoffsEnd: result.data.playoffsEnd ?? null,
    maxParticipants: result.data.maxParticipants ?? null,
    description: result.data.description ?? null,
    status: 'draft',
    createdBy: session.userId,
  });

  redirect(`/leagues/${id}`);
}
