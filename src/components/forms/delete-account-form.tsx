'use client';

import { useActionState, useEffect } from 'react';
import { Button, Modal, toast } from '@heroui/react';
import { Trash2 } from 'lucide-react';
import { deleteAccount } from '@/server/actions/users';
import type { ActionResult } from '@/types/action';

interface DeleteAccountFormProps {
  labels: {
    title: string;
    description: string;
    button: string;
  };
}

export function DeleteAccountForm({ labels }: DeleteAccountFormProps) {
  const [state, formAction, pending] = useActionState<ActionResult<null> | null, FormData>(
    deleteAccount as (prev: ActionResult<null> | null, data: FormData) => Promise<ActionResult<null>>,
    null
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success(labels.successMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="flex flex-col items-center rounded-3xl max-w-xl border border-danger/30 p-6">
      <h2 className="text-lg font-semibold text-danger">{labels.title}</h2>
      <p className="mt-1 text-sm text-foreground/60">{labels.description}</p>

      <Modal>
        <Button variant="danger-soft">{labels.button}</Button>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-[360px]">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Are you sure?</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p>{labels.toastMessage}</p>
              </Modal.Body>
              <Modal.Footer>
                <form action={formAction} className="mt-4">
                  <Button type="submit" variant="danger" isPending={pending} isDisabled={pending} className="w-full">
                    <Trash2 size={16} />
                    {labels.button}
                  </Button>
                </form>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
