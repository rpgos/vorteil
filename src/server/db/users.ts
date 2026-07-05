import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { User, Gender, SkillLevel, DominantHand } from '@/types/db/users';
import type { Role } from '@/types/auth';

function fromRow(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    gender: row.gender as Gender,
    lkLevel: row.lk_level as number | null,
    level: row.level as SkillLevel,
    dominantHand: row.dominant_hand as DominantHand | null,
    homeClub: row.home_club as string | null,
    roles: row.roles as Role[],
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export async function getAll(): Promise<User[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('users').select('*');
  return (data ?? []).map(row => fromRow(row as Record<string, unknown>));
}

export async function getById(id: string): Promise<User | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('users').select('*').eq('id', id).single();
  return data ? fromRow(data as Record<string, unknown>) : null;
}

export async function getByEmail(email: string): Promise<User | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('users').select('*').eq('email', email).single();
  return data ? fromRow(data as Record<string, unknown>) : null;
}

export async function create(data: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from('users')
    .insert({
      id: data.id,
      email: data.email,
      name: data.name,
      gender: data.gender,
      lk_level: data.lkLevel,
      level: data.level,
      dominant_hand: data.dominantHand,
      home_club: data.homeClub,
      roles: data.roles,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(row as Record<string, unknown>);
}

export async function update(
  id: string,
  data: Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>>
): Promise<User | null> {
  const supabase = await createClient();
  const patch: Record<string, unknown> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.gender !== undefined) patch.gender = data.gender;
  if (data.lkLevel !== undefined) patch.lk_level = data.lkLevel;
  if (data.level !== undefined) patch.level = data.level;
  if (data.dominantHand !== undefined) patch.dominant_hand = data.dominantHand;
  if (data.homeClub !== undefined) patch.home_club = data.homeClub;
  if (data.roles !== undefined) patch.roles = data.roles;

  const { data: row } = await supabase.from('users').update(patch).eq('id', id).select().single();
  return row ? fromRow(row as Record<string, unknown>) : null;
}

/**
 * Deletes the user from auth.users, which cascades to public.users.
 * Requires the service-role key — never call from client-side code.
 */
export async function remove(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw error;
}
