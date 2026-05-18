import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getOptionalSession } from '@/server/auth/session';
import { completeRegistration } from '@/server/actions/users';
import UserProfileForm, { type RegistrationLabels } from '@/components/forms/user-profile-form';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Register' });
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getOptionalSession();
  if (session) redirect('/');

  const t = await getTranslations({ locale, namespace: 'Register' });

  const labels: RegistrationLabels = {
    emailLabel: t('emailLabel'),
    nameLabel: t('nameLabel'),
    namePlaceholder: t('namePlaceholder'),
    genderLabel: t('genderLabel'),
    genderFemale: t('genderFemale'),
    genderMale: t('genderMale'),
    lkLevelLabel: t('lkLevelLabel'),
    lkLevelPlaceholder: t('lkLevelPlaceholder'),
    lkLevelHint: t('lkLevelHint'),
    levelLabel: t('levelLabel'),
    levelPlaceholder: t('levelPlaceholder'),
    levelBeginner: t('levelBeginner'),
    levelIntermediate: t('levelIntermediate'),
    levelAdvanced: t('levelAdvanced'),
    levelPro: t('levelPro'),
    levelHint: t('levelHint'),
    cityLabel: t('cityLabel'),
    cityPlaceholder: t('cityPlaceholder'),
    dominantHandLabel: t('dominantHandLabel'),
    dominantHandPlaceholder: t('dominantHandPlaceholder'),
    dominantHandRight: t('dominantHandRight'),
    dominantHandLeft: t('dominantHandLeft'),
    homeClubLabel: t('homeClubLabel'),
    homeClubPlaceholder: t('homeClubPlaceholder'),
    submitLabel: t('submitLabel'),
    privacyNote: t('privacyNote'),
    errorInvalid: t('errorInvalid'),
    successMessage: t('successMessage'),
  };

  return (
    <main className="flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center p-4 gap-4">
      <h1 className="text-3xl font-bold">{t('pageTitle')}</h1>
      <div className="flex w-full max-w-xl flex-col gap-4">
        <UserProfileForm labels={labels} action={completeRegistration} mode="register" />
        <p className="text-center text-xs text-foreground-400">{t('privacyNote')}</p>
      </div>
    </main>
  );
}
