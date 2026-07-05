import { createClient } from '@/lib/supabase/server';
import type { Role } from '@/types/auth';

export type Session = {
  userId: string;
  email: string;
  registrationComplete: boolean;
  roles: Role[];
};

/**
 * Returns the current session or null. Safe to call on public pages.
 * Reads the Supabase session and looks up the user's profile to determine
 * registration completeness and roles.
 */
export async function getOptionalSession(): Promise<Session | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user?.email) return null;

  const { data: profile } = await supabase.from('users').select('roles').eq('id', user.id).single();

  return {
    userId: user.id,
    email: user.email,
    registrationComplete: profile != null,
    roles: (profile?.roles as Role[]) ?? [],
  };
}

export async function clearSession(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
