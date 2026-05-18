'use client';

import { useActionState, useEffect } from 'react';
import { Button, toast, Input, Label, Surface, Separator, Select, Description, ListBox, Spinner } from '@heroui/react';
import { Mail } from 'lucide-react';
import type { ActionResult } from '@/types/action';

type FormAction = (prevState: ActionResult<null> | null, formData: FormData) => Promise<ActionResult<null>>;

export type DefaultValues = {
  email?: string;
  name?: string;
  gender?: string;
  lkLevel?: number | null;
  level?: string | null;
  city?: string;
  dominantHand?: string | null;
  homeClub?: string | null;
};

export type RegistrationLabels = {
  emailLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  genderLabel: string;
  genderFemale: string;
  genderMale: string;
  lkLevelLabel: string;
  lkLevelPlaceholder: string;
  lkLevelHint: string;
  levelLabel: string;
  levelPlaceholder: string;
  levelBeginner: string;
  levelIntermediate: string;
  levelAdvanced: string;
  levelPro: string;
  levelHint: string;
  cityLabel: string;
  cityPlaceholder: string;
  dominantHandLabel: string;
  dominantHandPlaceholder: string;
  dominantHandRight: string;
  dominantHandLeft: string;
  homeClubLabel: string;
  homeClubPlaceholder: string;
  submitLabel: string;
  privacyNote: string;
  errorInvalid: string;
  successMessage: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-danger">{message}</p>;
}

interface UserProfileFormProps {
  labels: RegistrationLabels;
  action: FormAction;
  mode?: 'register' | 'edit';
  defaultValues?: DefaultValues;
}

export default function UserProfileForm({ labels, action, mode = 'register', defaultValues }: UserProfileFormProps) {
  const [state, formAction, pending] = useActionState<ActionResult<null> | null, FormData>(action, null);

  useEffect(() => {
    if (state?.ok && mode === 'edit') {
      toast.success(labels.successMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state?.ok && mode === 'register') {
    return (
      <div className="w-full max-w-xl rounded-2xl border border-divider bg-content1 p-8 text-center">
        <Mail className="mx-auto mb-4 text-primary" size={32} />
        <p>{labels.successMessage}</p>
      </div>
    );
  }

  const err = (field: string) => (state?.ok === false ? state.error.fieldErrors?.[field] : undefined);

  return (
    <Surface className="w-full max-w-xl dark:bg-border rounded-3xl border p-8">
      <form action={formAction} className="space-y-5">
        <div className="flex flex-col gap-1">
          <Label isRequired htmlFor="email">
            {labels.emailLabel}
          </Label>
          <Input
            id="email"
            aria-label={labels.emailLabel}
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            defaultValue={defaultValues?.email ?? ''}
            readOnly={mode === 'edit'}
            className={mode === 'edit' ? 'opacity-60' : undefined}
          />
          <FieldError message={err('email')} />
        </div>

        <div className="flex flex-col gap-1">
          <Label isRequired htmlFor="name">
            {labels.nameLabel}
          </Label>
          <Input
            id="name"
            aria-label={labels.nameLabel}
            name="name"
            type="text"
            placeholder={labels.namePlaceholder}
            autoComplete="name"
            defaultValue={defaultValues?.name ?? ''}
          />
          <FieldError message={err('name')} />
        </div>

        <div className="flex flex-col gap-1">
          <Label isRequired htmlFor="gender">
            {labels.genderLabel}
          </Label>
          <Select
            id="gender"
            name="gender"
            aria-label={labels.genderLabel}
            defaultSelectedKey={defaultValues?.gender ?? undefined}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="female" textValue="female">
                  {labels.genderFemale}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="male" textValue="male">
                  {labels.genderMale}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <FieldError message={err('gender')} />
        </div>

        <Separator />

        <div className="flex flex-col gap-1">
          <Label htmlFor="lkLevel">{labels.lkLevelLabel}</Label>
          <Input
            id="lkLevel"
            name="lkLevel"
            aria-label={labels.lkLevelLabel}
            type="number"
            placeholder={labels.lkLevelPlaceholder}
            min={1}
            max={23}
            step={0.1}
            defaultValue={defaultValues?.lkLevel != null ? String(defaultValues.lkLevel) : ''}
          />
          <p className="text-xs text-foreground-400">{labels.lkLevelHint}</p>
          <FieldError message={err('lkLevel')} />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="level">{labels.levelLabel}</Label>
          <Select
            id="level"
            name="level"
            aria-label={labels.levelLabel}
            defaultSelectedKey={defaultValues?.level ?? undefined}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="beginner" textValue="beginner">
                  {labels.levelBeginner}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="intermediate" textValue="intermediate">
                  {labels.levelIntermediate}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="advanced" textValue="advanced">
                  {labels.levelAdvanced}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="pro" textValue="pro">
                  {labels.levelPro}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
            <Description>{labels.levelHint}</Description>
          </Select>
          <FieldError message={err('level')} />
        </div>

        <Separator />

        <div className="flex flex-col gap-1">
          <Label isRequired htmlFor="city">
            {labels.cityLabel}
          </Label>
          <Input
            id="city"
            aria-label={labels.cityLabel}
            name="city"
            type="text"
            placeholder={labels.cityPlaceholder}
            autoComplete="address-level2"
            defaultValue={defaultValues?.city ?? ''}
          />
          <FieldError message={err('city')} />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="dominantHand">{labels.dominantHandLabel}</Label>
          <Select
            id="dominantHand"
            name="dominantHand"
            aria-label={labels.dominantHandLabel}
            defaultSelectedKey={defaultValues?.dominantHand ?? undefined}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="right" textValue="right">
                  {labels.dominantHandRight}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="left" textValue="left">
                  {labels.dominantHandLeft}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="homeClub">{labels.homeClubLabel}</Label>
          <Input
            id="homeClub"
            aria-label={labels.homeClubLabel}
            name="homeClub"
            type="text"
            placeholder={labels.homeClubPlaceholder}
            defaultValue={defaultValues?.homeClub ?? ''}
          />
        </div>

        <Button type="submit" variant="primary" isPending={pending} fullWidth isDisabled={pending}>
          {pending ? <Spinner color="current" size="sm" /> : labels.submitLabel}
        </Button>
      </form>
    </Surface>
  );
}
