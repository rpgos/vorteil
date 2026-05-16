import { cookies } from 'next/headers';

const COOKIE_NAME = 'vorteil_session';

export type Session = {
  userId: string;
  email: string;
  registrationComplete: boolean;
};

/**
 * Returns the current session or null. Safe to call on public pages.
 * Stub implementation: reads a dev cookie or the VORTEIL_DEV_SESSION env var.
 * Replace with real Supabase session lookup in Section 8.
 */
export async function getOptionalSession(): Promise<Session | null> {
  // Allow a dev session injected via env var for UI development without auth flow.
  if (process.env.VORTEIL_DEV_SESSION) {
    try {
      return JSON.parse(process.env.VORTEIL_DEV_SESSION) as Session;
    } catch {
      console.warn('[AUTH STUB] Invalid VORTEIL_DEV_SESSION env var — ignoring.');
    }
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function setSession(session: Session): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
