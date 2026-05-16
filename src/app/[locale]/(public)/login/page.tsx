import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import LoginForm, { type LoginFormLabels } from '@/components/forms/login-form';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth' });
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Auth' });

  const labels: LoginFormLabels = {
    emailLabel: t('emailLabel'),
    emailPlaceholder: t('emailPlaceholder'),
    submitLabel: t('magicLinkCta'),
    successMessage: t('checkEmail'),
    continueWithGoogle: t('continueWithGoogle'),
    continueWithApple: t('continueWithApple'),
    orDivider: t('orDivider'),
    errorInvalidEmail: t('errorInvalidEmail'),
    errorGeneric: t('errorGeneric'),
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <LoginForm labels={labels} />
    </main>
  );
}
