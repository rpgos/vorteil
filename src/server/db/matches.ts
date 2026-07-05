import { createClient } from '@/lib/supabase/server';
import type { Match, MatchStatus } from '@/types/db/matches';

function fromRow(row: Record<string, unknown>): Match {
  return {
    id: row.id as string,
    leagueId: row.league_id as string,
    playerAId: row.player_a_id as string,
    playerBId: row.player_b_id as string,
    status: row.status as MatchStatus,
    submittedById: row.submitted_by_id as string | null,
    createdAt: new Date(row.created_at as string),
  };
}

export async function getByLeague(leagueId: string): Promise<Match[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('matches').select('*').eq('league_id', leagueId);
  return (data ?? []).map(row => fromRow(row as Record<string, unknown>));
}

export async function getByPlayer(userId: string): Promise<Match[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('matches')
    .select('*')
    .or(`player_a_id.eq.${userId},player_b_id.eq.${userId}`)
    .eq('status', 'played');
  return (data ?? []).map(row => fromRow(row as Record<string, unknown>));
}

export async function getById(id: string): Promise<Match | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('matches').select('*').eq('id', id).single();
  return data ? fromRow(data as Record<string, unknown>) : null;
}

export async function create(data: Omit<Match, 'createdAt'>): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('matches').insert({
    id: data.id,
    league_id: data.leagueId,
    player_a_id: data.playerAId,
    player_b_id: data.playerBId,
    status: data.status,
    submitted_by_id: data.submittedById,
  });
  if (error) throw error;
}

export async function update(
  id: string,
  data: Partial<Omit<Match, 'id' | 'leagueId' | 'playerAId' | 'playerBId' | 'createdAt'>>
): Promise<Match | null> {
  const supabase = await createClient();
  const patch: Record<string, unknown> = {};
  if (data.status !== undefined) patch.status = data.status;
  if (data.submittedById !== undefined) patch.submitted_by_id = data.submittedById;

  const { data: row } = await supabase.from('matches').update(patch).eq('id', id).select().single();
  return row ? fromRow(row as Record<string, unknown>) : null;
}
