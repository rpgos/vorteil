import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import CreateLeagueForm, { type CreateLeagueLabels } from '@/components/forms/create-league-form';
import { createLeague } from '@/server/actions/leagues';
import { requireRole } from '@/server/auth/guards';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Leagues' });
  return {
    title: t('createPageTitle'),
    description: t('createPageDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function CreateLeaguePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireRole('admin');

  const t = await getTranslations({ locale, namespace: 'Leagues' });

  const labels: CreateLeagueLabels = {
    formName: t('formName'),
    formNamePlaceholder: t('formNamePlaceholder'),
    formCity: t('formCity'),
    formCityPlaceholder: t('formCityPlaceholder'),
    formLevelRangeSection: t('formLevelRangeSection'),
    formLevelMin: t('formLevelMin'),
    formLevelMax: t('formLevelMax'),
    formLevelRangeHint: t('formLevelRangeHint'),
    formRegularSeasonRounds: t('formRegularSeasonRounds'),
    formHasPlayoffs: t('formHasPlayoffs'),
    formHasPlayoffsHint: t('formHasPlayoffsHint'),
    formRegularSeasonEnd: t('formRegularSeasonEnd'),
    formPlayoffsEnd: t('formPlayoffsEnd'),
    formPlayoffsEndHint: t('formPlayoffsEndHint'),
    formMaxParticipants: t('formMaxParticipants'),
    formMaxParticipantsHint: t('formMaxParticipantsHint'),
    formDescription: t('formDescription'),
    formDescriptionPlaceholder: t('formDescriptionPlaceholder'),
    formSubmit: t('formSubmit'),
    formErrorInvalid: t('formErrorInvalid'),
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold">{t('createLeague')}</h1>
      <CreateLeagueForm action={createLeague} labels={labels} />
    </main>
  );
}
