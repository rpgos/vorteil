'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { withRateLimit } from '@/lib/security/rateLimit';
import { clearSession } from '@/server/auth/session';
import type { ActionResult } from '@/types/action';

const emailSchema = z.string().trim().toLowerCase().email('Invalid email address');

export async function requestMagicLink(
  _prevState: ActionResult<null> | null,
  formData: FormData
): Promise<ActionResult<null>> {
  const result = emailSchema.safeParse(formData.get('email'));

  if (!result.success) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION',
        message: 'Invalid email address',
        fieldErrors: { email: result.error.issues[0]?.message ?? 'Invalid email' },
      },
    };
  }

  const email = result.data;

  await withRateLimit('magic-link', email, async () => {
    console.log(`[DB STUB] Would send magic link to ${email}`);
  });

  return { ok: true, data: null };
}

export async function signInWithOAuth(provider: 'google' | 'apple'): Promise<void> {
  console.log(`[DB STUB] OAuth sign-in with ${provider}`);
  redirect(`/auth/callback?provider=${provider}`);
}

export async function signOut(): Promise<void> {
  await clearSession();
  redirect('/');
}
