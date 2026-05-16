'use client';

import { useActionState } from 'react';
import { Button, Input, Label, Surface, Separator, Select, Description, ListBox } from '@heroui/react';
import { Mail } from 'lucide-react';
import { completeRegistration } from '@/server/actions/users';
import type { ActionResult } from '@/types/action';

export type RegistrationLabels = {
  emailLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  genderLabel: string;
  genderFemale: string;
  genderMale: string;
  genderNonBinary: string;
  genderPreferNotToSay: string;
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

const selectClass =
  'w-full rounded-xl border border-divider bg-content2 px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-danger">{message}</p>;
}

export default function UserProfileForm({ labels }: { labels: RegistrationLabels }) {
  const [state, formAction, pending] = useActionState<ActionResult<null> | null, FormData>(completeRegistration, null);

  if (state?.ok) {
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
          <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
          <FieldError message={err('email')} />
        </div>

        <div className="flex flex-col gap-1">
          <Label isRequired htmlFor="name">
            {labels.nameLabel}
          </Label>
          <Input id="name" name="name" type="text" placeholder={labels.namePlaceholder} autoComplete="name" />
          <FieldError message={err('name')} />
        </div>

        <div className="flex flex-col gap-1">
          <Label isRequired htmlFor="gender">
            {labels.genderLabel}
          </Label>
          <Select id="gender" name="gender">
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
            type="number"
            placeholder={labels.lkLevelPlaceholder}
            min={1}
            max={23}
            step={0.1}
          />
          <p className="text-xs text-foreground-400">{labels.lkLevelHint}</p>
          <FieldError message={err('lkLevel')} />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="level">{labels.levelLabel}</Label>
          <Select id="level" name="level">
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
          <Label htmlFor="city">{labels.cityLabel}</Label>
          <Input id="city" name="city" type="text" placeholder={labels.cityPlaceholder} autoComplete="address-level2" />
          <FieldError message={err('city')} />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="dominantHand">{labels.dominantHandLabel}</Label>
          <Select id="dominantHand" name="dominantHand">
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
          <Input id="homeClub" name="homeClub" type="text" placeholder={labels.homeClubPlaceholder} />
        </div>

        <Button type="submit" variant="primary" fullWidth isDisabled={pending}>
          {pending ? '…' : labels.submitLabel}
        </Button>
      </form>
    </Surface>
  );
}
