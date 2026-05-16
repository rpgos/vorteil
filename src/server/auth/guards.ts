import { notFound, redirect } from 'next/navigation';
import { getOptionalSession } from './session';
import type { Session } from './session';
import type { Role } from '@/types/auth';

/**
 * Asserts a session exists. Redirects to /login if not.
 * Use in server components and server actions that require authentication.
 */
export async function requireSession(): Promise<Session> {
  const session = await getOptionalSession();
  if (!session) redirect('/login');
  return session;
}

/**
 * Asserts a session exists and the user has the given role.
 * Redirects to /login if no session; calls notFound() if the role is missing
 * (404 not 403, to avoid leaking the existence of admin routes).
 */
export async function requireRole(role: Role): Promise<Session> {
  const session = await requireSession();
  if (!session.roles?.includes(role)) notFound();
  return session;
}
