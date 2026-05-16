'use server';

import { redirect } from 'next/navigation';
import { createUserSchema } from '@/lib/validation/users';
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
