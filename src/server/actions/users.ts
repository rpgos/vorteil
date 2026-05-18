'use server';

import { redirect } from 'next/navigation';
import { createUserSchema, editUserSchema } from '@/lib/validation/users';
import { requireSession } from '@/server/auth/guards';
import * as usersDb from '@/server/db/users';
import type { ActionResult } from '@/types/action';

export async function completeRegistration(
  _prevState: ActionResult<null> | null,
  formData: FormData
): Promise<ActionResult<null>> {
  const lkLevelRaw = formData.get('lkLevel');
  const raw = {
    email: formData.get('email'),
    name: formData.get('name'),
    gender: formData.get('gender'),
    lkLevel: lkLevelRaw && String(lkLevelRaw).trim() !== '' ? Number(lkLevelRaw) : undefined,
    level: formData.get('level') || undefined,
    city: formData.get('city'),
    dominantHand: formData.get('dominantHand') || undefined,
    homeClub: formData.get('homeClub') || undefined,
  };

  const result = createUserSchema.safeParse(raw);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[issue.path.length - 1]?.toString() ?? 'root';
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      error: { code: 'VALIDATION', message: 'Please check the highlighted fields.', fieldErrors },
    };
  }

  // TODO: send confirmation email (Section 19)
  console.log(`[DB STUB] Would send confirmation email to ${result.data.email}`);

  redirect('/');
}

export async function updateProfile(
  _prevState: ActionResult<null> | null,
  formData: FormData
): Promise<ActionResult<null>> {
  const session = await requireSession();

  const lkLevelRaw = formData.get('lkLevel');
  const raw = {
    name: formData.get('name'),
    gender: formData.get('gender'),
    lkLevel: lkLevelRaw && String(lkLevelRaw).trim() !== '' ? Number(lkLevelRaw) : undefined,
    level: formData.get('level') || undefined,
    city: formData.get('city'),
    dominantHand: formData.get('dominantHand') || undefined,
    homeClub: formData.get('homeClub') || undefined,
  };

  const result = editUserSchema.safeParse(raw);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[issue.path.length - 1]?.toString() ?? 'root';
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: { code: 'VALIDATION', message: 'Please check the highlighted fields.', fieldErrors } };
  }

  usersDb.update(session.userId, result.data);
  return { ok: true, data: null };
}

export async function requestAccountDeletion(): Promise<ActionResult<null>> {
  const session = await requireSession();
  console.log(`[DB STUB] Would request account deletion for ${session.userId}`);
  return { ok: true, data: null };
}
