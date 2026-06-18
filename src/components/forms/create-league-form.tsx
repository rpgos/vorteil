'use client';

import { useActionState, useState } from 'react';
import { Button, Checkbox, Input, Label, Separator, Spinner, Surface, TextArea } from '@heroui/react';
import type { ActionResult } from '@/types/action';

type FormAction = (prevState: ActionResult<null> | null, formData: FormData) => Promise<ActionResult<null>>;

export type CreateLeagueLabels = {
  formName: string;
  formNamePlaceholder: string;
  formCity: string;
  formCityPlaceholder: string;
  formLevelRangeSection: string;
  formLevelMin: string;
  formLevelMax: string;
  formLevelRangeHint: string;
  formRegularSeasonRounds: string;
  formHasPlayoffs: string;
  formHasPlayoffsHint: string;
  formRegularSeasonEnd: string;
  formPlayoffsEnd: string;
  formPlayoffsEndHint: string;
  formMaxParticipants: string;
  formMaxParticipantsHint: string;
  formDescription: string;
  formDescriptionPlaceholder: string;
  formSubmit: string;
  formErrorInvalid: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-danger">{message}</p>;
}

interface Props {
  action: FormAction;
  labels: CreateLeagueLabels;
}

export default function CreateLeagueForm({ action, labels }: Props) {
  const [state, formAction, pending] = useActionState<ActionResult<null> | null, FormData>(action, null);
  const [hasPlayoffs, setHasPlayoffs] = useState(true);

  const err = (field: string): string | undefined =>
    state?.ok === false ? state.error.fieldErrors?.[field] : undefined;

  return (
    <Surface className="w-full rounded-3xl border border-divider p-6 md:p-8">
      <form action={formAction} className="space-y-5">
        {/* Basic info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label isRequired htmlFor="name">
              {labels.formName}
            </Label>
            <Input
              id="name"
              aria-label={labels.formName}
              name="name"
              type="text"
              placeholder={labels.formNamePlaceholder}
            />
            <FieldError message={err('name')} />
          </div>
          <div className="flex flex-col gap-1">
            <Label isRequired htmlFor="city">
              {labels.formCity}
            </Label>
            <Input
              id="city"
              aria-label={labels.formCity}
              name="city"
              type="text"
              placeholder={labels.formCityPlaceholder}
            />
            <FieldError message={err('city')} />
          </div>
        </div>

        <Separator />

        {/* Level range */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{labels.formLevelRangeSection}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="levelMin">{labels.formLevelMin}</Label>
              <Input id="levelMin" aria-label={labels.formLevelMin} name="levelMin" type="number" min={1} max={23} />
              <FieldError message={err('min')} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="levelMax">{labels.formLevelMax}</Label>
              <Input id="levelMax" aria-label={labels.formLevelMax} name="levelMax" type="number" min={1} max={23} />
              <FieldError message={err('max')} />
            </div>
          </div>
          <p className="text-xs text-foreground/60">{labels.formLevelRangeHint}</p>
        </div>

        <Separator />

        {/* Format */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label isRequired htmlFor="regularSeasonRounds">
              {labels.formRegularSeasonRounds}
            </Label>
            <Input
              id="regularSeasonRounds"
              aria-label={labels.formRegularSeasonRounds}
              name="regularSeasonRounds"
              type="number"
              defaultValue="8"
              min={1}
            />
            <FieldError message={err('regularSeasonRounds')} />
          </div>
          <div className="flex flex-col gap-1">
            <input type="hidden" name="hasPlayoffs" value={String(hasPlayoffs)} />
            <Checkbox isSelected={hasPlayoffs} onChange={setHasPlayoffs}>
              {labels.formHasPlayoffs}
            </Checkbox>
            <p className="text-xs text-foreground/60">{labels.formHasPlayoffsHint}</p>
          </div>
        </div>

        <Separator />

        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label isRequired htmlFor="regularSeasonEnd">
              {labels.formRegularSeasonEnd}
            </Label>
            <Input id="regularSeasonEnd" aria-label={labels.formRegularSeasonEnd} name="regularSeasonEnd" type="date" />
            <FieldError message={err('regularSeasonEnd')} />
          </div>
          {hasPlayoffs && (
            <div className="flex flex-col gap-1">
              <Label isRequired htmlFor="playoffsEnd">
                {labels.formPlayoffsEnd}
              </Label>
              <Input id="playoffsEnd" aria-label={labels.formPlayoffsEnd} name="playoffsEnd" type="date" />
              <p className="text-xs text-foreground/60">{labels.formPlayoffsEndHint}</p>
              <FieldError message={err('playoffsEnd')} />
            </div>
          )}
        </div>

        <Separator />

        {/* Participants + Description */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="maxParticipants">{labels.formMaxParticipants}</Label>
            <Input
              id="maxParticipants"
              aria-label={labels.formMaxParticipants}
              name="maxParticipants"
              type="number"
              min={2}
            />
            <p className="text-xs text-foreground/60">{labels.formMaxParticipantsHint}</p>
            <FieldError message={err('maxParticipants')} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="description">{labels.formDescription}</Label>
            <TextArea
              id="description"
              aria-label={labels.formDescription}
              name="description"
              placeholder={labels.formDescriptionPlaceholder}
              rows={4}
            />
            <FieldError message={err('description')} />
          </div>
        </div>

        {state?.ok === false && state.error.code !== 'VALIDATION' && (
          <p className="text-sm text-danger">{labels.formErrorInvalid}</p>
        )}

        <Button type="submit" variant="primary" isPending={pending} isDisabled={pending} fullWidth>
          {pending ? <Spinner color="current" size="sm" /> : labels.formSubmit}
        </Button>
      </form>
    </Surface>
  );
}
