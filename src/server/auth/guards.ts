import { redirect } from 'next/navigation';
import { getOptionalSession } from './session';
import type { Session } from './session';

/**
 * Asserts a session exists. Redirects to /login if not.
 * Use in server components and server actions that require authentication.
 */
export async function requireSession(): Promise<Session> {
  const session = await getOptionalSession();
  if (!session) redirect('/login');
  return session;
}
