import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Privacy' });
  return buildMetadata({
    title: t('pageTitle'),
    description: t('pageDescription'),
    locale,
    path: '/privacy',
  });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Privacy' });

  const sections = [
    { title: t('dataCollectedTitle'), body: t('dataCollectedBody') },
    { title: t('dataUseTitle'), body: t('dataUseBody') },
    { title: t('dataStorageTitle'), body: t('dataStorageBody') },
    { title: t('dataRetentionTitle'), body: t('dataRetentionBody') },
    { title: t('cookiesTitle'), body: t('cookiesBody') },
    { title: t('contactTitle'), body: t('contactBody') },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t('heading')}</h1>
      <p className="mt-2 text-sm text-foreground/50">{t('lastUpdated')}</p>
      <p className="mt-6 text-foreground/80">{t('intro')}</p>

      {sections.map(({ title, body }) => (
        <section key={title} className="mt-8">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-foreground/80">{body}</p>
        </section>
      ))}
    </main>
  );
}
