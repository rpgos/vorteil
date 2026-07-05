import { createClient } from '@/lib/supabase/server';
import type { LeagueMembership, MembershipStatus } from '@/types/db/leagues';

function fromRow(row: Record<string, unknown>): LeagueMembership {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    leagueId: row.league_id as string,
    status: row.status as MembershipStatus,
    requestedAt: new Date(row.requested_at as string),
    decidedAt: row.decided_at ? new Date(row.decided_at as string) : null,
  };
}

export async function getByLeague(leagueId: string): Promise<LeagueMembership[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('league_memberships').select('*').eq('league_id', leagueId);
  return (data ?? []).map(row => fromRow(row as Record<string, unknown>));
}

export async function getByUser(userId: string): Promise<LeagueMembership[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('league_memberships').select('*').eq('user_id', userId);
  return (data ?? []).map(row => fromRow(row as Record<string, unknown>));
}

export async function getById(id: string): Promise<LeagueMembership | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('league_memberships').select('*').eq('id', id).single();
  return data ? fromRow(data as Record<string, unknown>) : null;
}

export async function getActiveByUser(userId: string): Promise<LeagueMembership | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('league_memberships')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['approved', 'pending'])
    .limit(1)
    .single();
  return data ? fromRow(data as Record<string, unknown>) : null;
}

export async function create(data: Omit<LeagueMembership, 'requestedAt' | 'decidedAt'>): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('league_memberships').insert({
    id: data.id,
    user_id: data.userId,
    league_id: data.leagueId,
    status: data.status,
  });
  if (error) throw error;
}

export async function update(
  id: string,
  data: Partial<Omit<LeagueMembership, 'id' | 'userId' | 'leagueId' | 'requestedAt'>>
): Promise<LeagueMembership | null> {
  const supabase = await createClient();
  const patch: Record<string, unknown> = {};
  if (data.status !== undefined) patch.status = data.status;
  if (data.decidedAt !== undefined) patch.decided_at = data.decidedAt?.toISOString() ?? null;

  const { data: row } = await supabase.from('league_memberships').update(patch).eq('id', id).select().single();
  return row ? fromRow(row as Record<string, unknown>) : null;
}
