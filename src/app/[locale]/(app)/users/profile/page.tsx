import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { requireSession } from '@/server/auth/guards';
import { updateProfile } from '@/server/actions/users';
import * as usersDb from '@/server/db/users';
import UserProfileForm, { type RegistrationLabels, type DefaultValues } from '@/components/forms/user-profile-form';
import { DeleteAccountForm } from '@/components/forms/delete-account-form';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Profile' });
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireSession();
  const user = usersDb.getById('u1');
  // const user = usersDb.getById(session.userId);

  const tReg = await getTranslations({ locale, namespace: 'Register' });
  const tPro = await getTranslations({ locale, namespace: 'Profile' });

  const labels: RegistrationLabels = {
    emailLabel: tReg('emailLabel'),
    nameLabel: tReg('nameLabel'),
    namePlaceholder: tReg('namePlaceholder'),
    genderLabel: tReg('genderLabel'),
    genderFemale: tReg('genderFemale'),
    genderMale: tReg('genderMale'),
    lkLevelLabel: tReg('lkLevelLabel'),
    lkLevelPlaceholder: tReg('lkLevelPlaceholder'),
    lkLevelHint: tReg('lkLevelHint'),
    levelLabel: tReg('levelLabel'),
    levelPlaceholder: tReg('levelPlaceholder'),
    levelBeginner: tReg('levelBeginner'),
    levelIntermediate: tReg('levelIntermediate'),
    levelAdvanced: tReg('levelAdvanced'),
    levelPro: tReg('levelPro'),
    levelHint: tReg('levelHint'),
    cityLabel: tReg('cityLabel'),
    cityPlaceholder: tReg('cityPlaceholder'),
    dominantHandLabel: tReg('dominantHandLabel'),
    dominantHandPlaceholder: tReg('dominantHandPlaceholder'),
    dominantHandRight: tReg('dominantHandRight'),
    dominantHandLeft: tReg('dominantHandLeft'),
    homeClubLabel: tReg('homeClubLabel'),
    homeClubPlaceholder: tReg('homeClubPlaceholder'),
    submitLabel: tReg('submitLabel'),
    privacyNote: tReg('privacyNote'),
    errorInvalid: tReg('errorInvalid'),
    successMessage: tPro('successMessage'),
  };

  const defaultValues: DefaultValues | undefined = user
    ? {
        email: user.email,
        name: user.name,
        gender: user.gender,
        lkLevel: user.lkLevel,
        level: user.level,
        city: user.city,
        dominantHand: user.dominantHand,
        homeClub: user.homeClub,
      }
    : undefined;

  const deleteLabels = {
    title: tPro('deleteTitle'),
    description: tPro('deleteDescription'),
    button: tPro('deleteButton'),
    successMessage: tPro('deleteSuccessMessage'),
  };

  return (
    <main className="flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center p-4 gap-8">
      <h1 className="text-3xl font-bold">{tPro('pageTitle')}</h1>
      <UserProfileForm labels={labels} action={updateProfile} mode="edit" defaultValues={defaultValues} />
      <DeleteAccountForm labels={deleteLabels} />
    </main>
  );
}
