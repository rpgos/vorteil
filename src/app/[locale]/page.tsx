import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Image from 'next/image';
import NextLink from 'next/link';
import { buttonVariants } from '@heroui/react';

type Props = {
  params: Promise<{ locale: string }>;
};

const heroImagePaths = [
  'photo-1777996625863-8f9713811fb5',
  'photo-1777996625814-028201238572',
  'photo-1777996625750-b934896792b9',
  'photo-1604259011171-2343696f776b',
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Home' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Home');
  const heroImage = heroImagePaths[Math.floor(Math.random() * heroImagePaths.length)];

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
      <Image
        src={`https://images.unsplash.com/${heroImage}`}
        alt="Tennis court"
        fill
        className="object-cover brightness-50"
        priority
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <h1 className="whitespace-pre-line text-white text-5xl md:text-6xl">{t('title')}</h1>
        <p className="max-w-xl text-lg text-white">{t('description')}</p>
        <NextLink href="/leagues" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
          {t('cta')}
        </NextLink>
      </div>
    </main>
  );
}
