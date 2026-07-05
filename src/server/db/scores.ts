import { createClient } from '@/lib/supabase/server';
import type { MatchScore } from '@/types/db/matches';

function fromRow(row: Record<string, unknown>): MatchScore {
  return {
    id: row.id as string,
    matchId: row.match_id as string,
    set1A: row.set1_a as number,
    set1B: row.set1_b as number,
    set2A: row.set2_a as number,
    set2B: row.set2_b as number,
    superTiebreakA: row.super_tiebreak_a as number | null,
    superTiebreakB: row.super_tiebreak_b as number | null,
    winnerId: row.winner_id as string,
    submittedAt: new Date(row.submitted_at as string),
    disputeWindowEndsAt: new Date(row.dispute_window_ends_at as string),
    disputedAt: row.disputed_at ? new Date(row.disputed_at as string) : null,
    disputeReason: row.dispute_reason as string | null,
  };
}

export async function getByMatch(matchId: string): Promise<MatchScore | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('match_scores').select('*').eq('match_id', matchId).single();
  return data ? fromRow(data as Record<string, unknown>) : null;
}

export async function getById(id: string): Promise<MatchScore | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('match_scores').select('*').eq('id', id).single();
  return data ? fromRow(data as Record<string, unknown>) : null;
}

export async function create(data: MatchScore): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('match_scores').insert({
    id: data.id,
    match_id: data.matchId,
    set1_a: data.set1A,
    set1_b: data.set1B,
    set2_a: data.set2A,
    set2_b: data.set2B,
    super_tiebreak_a: data.superTiebreakA,
    super_tiebreak_b: data.superTiebreakB,
    winner_id: data.winnerId,
    submitted_at: data.submittedAt.toISOString(),
    dispute_window_ends_at: data.disputeWindowEndsAt.toISOString(),
    disputed_at: data.disputedAt?.toISOString() ?? null,
    dispute_reason: data.disputeReason,
  });
  if (error) throw error;
}

export async function update(
  id: string,
  data: Partial<Pick<MatchScore, 'disputedAt' | 'disputeReason'>>
): Promise<MatchScore | null> {
  const supabase = await createClient();
  const patch: Record<string, unknown> = {};
  if (data.disputedAt !== undefined) patch.disputed_at = data.disputedAt?.toISOString() ?? null;
  if (data.disputeReason !== undefined) patch.dispute_reason = data.disputeReason;

  const { data: row } = await supabase.from('match_scores').update(patch).eq('id', id).select().single();
  return row ? fromRow(row as Record<string, unknown>) : null;
}
