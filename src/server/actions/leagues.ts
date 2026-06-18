'use server';

import { redirect } from 'next/navigation';
import { requireSession, requireRole } from '@/server/auth/guards';
import * as leaguesDb from '@/server/db/leagues';
import * as membershipsDb from '@/server/db/memberships';
import * as matchesDb from '@/server/db/matches';
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

export async function requestJoinLeague(leagueId: string): Promise<ActionResult<null>> {
  const session = await requireSession();

  const league = leaguesDb.getById(leagueId);
  if (!league) return { ok: false, error: { code: 'NOT_FOUND', message: 'League not found.' } };
  if (league.status !== 'open') {
    return { ok: false, error: { code: 'CONFLICT', message: 'This league is not accepting new members.' } };
  }

  const existing = membershipsDb.getActiveByUser(session.userId);
  if (existing) {
    return { ok: false, error: { code: 'CONFLICT', message: 'You are already in an active league.' } };
  }

  membershipsDb.create({ id: crypto.randomUUID(), userId: session.userId, leagueId, status: 'pending' });
  return { ok: true, data: null };
}

export async function decideMembership(
  membershipId: string,
  decision: 'approved' | 'rejected'
): Promise<ActionResult<null>> {
  await requireRole('admin');

  const ms = membershipsDb.getById(membershipId);
  if (!ms) return { ok: false, error: { code: 'NOT_FOUND', message: 'Membership not found.' } };

  membershipsDb.update(membershipId, { status: decision, decidedAt: new Date() });
  // TODO: trigger membership decision notification (Section 19)
  return { ok: true, data: null };
}

export async function startSeason(leagueId: string): Promise<ActionResult<null>> {
  await requireRole('admin');

  const league = leaguesDb.getById(leagueId);
  if (!league) return { ok: false, error: { code: 'NOT_FOUND', message: 'League not found.' } };
  if (league.status !== 'open') {
    return { ok: false, error: { code: 'CONFLICT', message: 'League must be open to start the season.' } };
  }

  const approvedMembers = membershipsDb.getByLeague(leagueId).filter(m => m.status === 'approved');
  if (approvedMembers.length < 2) {
    return { ok: false, error: { code: 'CONFLICT', message: 'At least 2 approved players are needed.' } };
  }

  // Generate round-robin matches idempotently
  const existingMatches = matchesDb.getByLeague(leagueId);
  const existingPairs = new Set(existingMatches.map(m => [m.playerAId, m.playerBId].sort().join(':')));

  for (let i = 0; i < approvedMembers.length; i++) {
    for (let j = i + 1; j < approvedMembers.length; j++) {
      const playerA = approvedMembers[i].userId;
      const playerB = approvedMembers[j].userId;
      const pairKey = [playerA, playerB].sort().join(':');
      if (!existingPairs.has(pairKey)) {
        matchesDb.create({
          id: crypto.randomUUID(),
          leagueId,
          playerAId: playerA,
          playerBId: playerB,
          status: 'scheduled',
          submittedById: null,
        });
      }
    }
  }

  leaguesDb.update(leagueId, { status: 'in_season' });
  return { ok: true, data: null };
}
