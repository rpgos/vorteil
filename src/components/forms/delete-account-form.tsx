'use client';

import { useActionState } from 'react';
import { Button } from '@heroui/react';
import { Trash2, CheckCircle } from 'lucide-react';
import { requestAccountDeletion } from '@/server/actions/users';
import type { ActionResult } from '@/types/action';

interface DeleteAccountFormProps {
  labels: {
    title: string;
    description: string;
    button: string;
    successMessage: string;
  };
}

export function DeleteAccountForm({ labels }: DeleteAccountFormProps) {
  const [state, formAction, pending] = useActionState<ActionResult<null> | null, FormData>(
    requestAccountDeletion as (prev: ActionResult<null> | null, data: FormData) => Promise<ActionResult<null>>,
    null
  );

  return (
    <div className="flex flex-col items-center rounded-3xl max-w-xl border border-danger/30 p-6">
      <h2 className="text-lg font-semibold text-danger">{labels.title}</h2>
      <p className="mt-1 text-sm text-foreground/60">{labels.description}</p>
      {state?.ok ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-success">
          <CheckCircle size={16} />
          {labels.successMessage}
        </p>
      ) : (
        <form action={formAction} className="mt-4">
          <Button
            type="submit"
            variant="outline"
            isPending={pending}
            isDisabled={pending}
            className="border-danger text-danger hover:bg-danger/10"
          >
            <Trash2 size={16} />
            {labels.button}
          </Button>
        </form>
      )}
    </div>
  );
}
