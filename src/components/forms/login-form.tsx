'use client';

import { useActionState } from 'react';
import { Button } from '@heroui/react';
import { Mail } from 'lucide-react';
import { requestMagicLink, signInWithOAuth } from '@/server/actions/auth';
import type { ActionResult } from '@/types/action';
import { Input, Label, Separator, Surface } from '@heroui/react';
import { GoogleIcon } from '@/components/icons/google';
import { AppleIcon } from '@/components/icons/apple';

export type LoginFormLabels = {
  emailLabel: string;
  emailPlaceholder: string;
  submitLabel: string;
  successMessage: string;
  continueWithGoogle: string;
  continueWithApple: string;
  orDivider: string;
  errorInvalidEmail: string;
  errorGeneric: string;
};

export default function LoginForm({ labels }: { labels: LoginFormLabels }) {
  const [state, formAction, pending] = useActionState<ActionResult<null> | null, FormData>(requestMagicLink, null);

  if (state?.ok) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-divider bg-content1 p-8 text-center">
        <Mail className="mx-auto mb-4 text-primary" size={32} />
        <p>{labels.successMessage}</p>
      </div>
    );
  }

  const fieldError =
    state?.ok === false
      ? state.error.code === 'VALIDATION'
        ? labels.errorInvalidEmail
        : labels.errorGeneric
      : undefined;

  return (
    <Surface className="w-full max-w-md dark:bg-border rounded-3xl border border-divider p-8">
      <form action={formAction} className="space-y-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="email">{labels.emailLabel}</Label>
          <Input
            aria-label="email"
            id="email"
            name="email"
            type="email"
            placeholder={labels.emailPlaceholder}
            autoComplete="email"
          />
          {fieldError && <p className="text-xs text-danger">{fieldError}</p>}
        </div>

        <Button type="submit" variant="primary" fullWidth isDisabled={pending}>
          {pending ? '…' : labels.submitLabel}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-sm text-foreground-400 uppercase">{labels.orDivider}</span>
        <Separator className="flex-1" />
      </div>

      <div className="space-y-3">
        <form action={signInWithOAuth.bind(null, 'google')}>
          <Button type="submit" variant="outline" fullWidth>
            <GoogleIcon />
            {labels.continueWithGoogle}
          </Button>
        </form>
        <form action={signInWithOAuth.bind(null, 'apple')}>
          <Button type="submit" variant="outline" fullWidth>
            <AppleIcon />
            {labels.continueWithApple}
          </Button>
        </form>
      </div>
    </Surface>
  );
}
