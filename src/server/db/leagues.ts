import { createClient } from '@/lib/supabase/server';
import type { League, LeagueStatus } from '@/types/db/leagues';

function fromRow(row: Record<string, unknown>): League {
  return {
    id: row.id as string,
    name: row.name as string,
    city: row.city as string,
    countryCode: row.country_code as string,
    levelRange:
      row.level_range_min != null && row.level_range_max != null
        ? { min: row.level_range_min as number, max: row.level_range_max as number }
        : null,
    level: row.level as string | null,
    regularSeasonRounds: row.regular_season_rounds as number,
    matchmakingType: row.matchmaking_type as League['matchmakingType'],
    hasPlayoffs: row.has_playoffs as boolean,
    regularSeasonEnd: new Date(row.regular_season_end as string),
    playoffsEnd: row.playoffs_end ? new Date(row.playoffs_end as string) : null,
    maxParticipants: row.max_participants as number | null,
    description: row.description as string | null,
    status: row.status as LeagueStatus,
    createdBy: row.created_by as string,
    createdAt: new Date(row.created_at as string),
  };
}

export type LeagueFilters = {
  city?: string;
  status?: LeagueStatus;
  levelMin?: number;
  levelMax?: number;
};

export async function getAll(filters?: LeagueFilters): Promise<League[]> {
  const supabase = await createClient();
  let query = supabase.from('leagues').select('*');

  if (filters?.city) query = query.eq('city', filters.city);
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.levelMin != null) query = query.or(`level_range_max.gte.${filters.levelMin},level_range_max.is.null`);
  if (filters?.levelMax != null) query = query.or(`level_range_min.lte.${filters.levelMax},level_range_min.is.null`);

  const { data } = await query;
  return (data ?? []).map(row => fromRow(row as Record<string, unknown>));
}

export async function getById(id: string): Promise<League | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('leagues').select('*').eq('id', id).single();
  return data ? fromRow(data as Record<string, unknown>) : null;
}

export async function create(data: Omit<League, 'createdAt'>): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('leagues').insert({
    id: data.id,
    name: data.name,
    city: data.city,
    country_code: data.countryCode,
    level_range_min: data.levelRange?.min ?? null,
    level_range_max: data.levelRange?.max ?? null,
    level: data.level,
    regular_season_rounds: data.regularSeasonRounds,
    matchmaking_type: data.matchmakingType,
    has_playoffs: data.hasPlayoffs,
    regular_season_end: data.regularSeasonEnd.toISOString(),
    playoffs_end: data.playoffsEnd?.toISOString() ?? null,
    max_participants: data.maxParticipants,
    description: data.description,
    status: data.status,
    created_by: data.createdBy,
  });
  if (error) throw error;
}

export async function update(id: string, data: Partial<Omit<League, 'id' | 'createdAt'>>): Promise<League | null> {
  const supabase = await createClient();
  const patch: Record<string, unknown> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.city !== undefined) patch.city = data.city;
  if (data.countryCode !== undefined) patch.country_code = data.countryCode;
  if (data.levelRange !== undefined) {
    patch.level_range_min = data.levelRange?.min ?? null;
    patch.level_range_max = data.levelRange?.max ?? null;
  }
  if (data.level !== undefined) patch.level = data.level;
  if (data.regularSeasonRounds !== undefined) patch.regular_season_rounds = data.regularSeasonRounds;
  if (data.matchmakingType !== undefined) patch.matchmaking_type = data.matchmakingType;
  if (data.hasPlayoffs !== undefined) patch.has_playoffs = data.hasPlayoffs;
  if (data.regularSeasonEnd !== undefined) patch.regular_season_end = data.regularSeasonEnd.toISOString();
  if (data.playoffsEnd !== undefined) patch.playoffs_end = data.playoffsEnd?.toISOString() ?? null;
  if (data.maxParticipants !== undefined) patch.max_participants = data.maxParticipants;
  if (data.description !== undefined) patch.description = data.description;
  if (data.status !== undefined) patch.status = data.status;

  const { data: row } = await supabase.from('leagues').update(patch).eq('id', id).select().single();
  return row ? fromRow(row as Record<string, unknown>) : null;
}
