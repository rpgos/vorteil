import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Image from 'next/image';
import NextLink from 'next/link';
import { buttonVariants } from '@heroui/react';
import ContentSection from '@/components/content-section';

type Props = {
  params: Promise<{ locale: string }>;
};

const heroImagePaths = [
  'https://images.unsplash.com/photo-1777996625863-8f9713811fb5',
  'https://images.unsplash.com/photo-1777996625814-028201238572',
  'https://images.unsplash.com/photo-1777996625750-b934896792b9',
  'https://images.unsplash.com/photo-1604259011171-2343696f776b',
  'https://images.unsplash.com/photo-1627314387807-df615e8567de',
];

const sectionImages = [
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8',
  'https://images.unsplash.com/photo-1750858285407-069e874245d4',
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
    <main>
      <section className="relative flex h-screen flex-col items-center justify-center overflow-hidden">
        <Image src={heroImage} alt="Tennis court" fill className="object-cover brightness-50" priority />

        <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
          <h1 className="whitespace-pre-line text-white text-5xl md:text-6xl">{t('title')}</h1>
          <p className="max-w-xl text-lg text-white">{t('description')}</p>
          <NextLink href="/leagues" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
            {t('cta')}
          </NextLink>
        </div>
      </section>

      <ContentSection
        title={t('section1Title')}
        subtitle={t('section1Subtitle')}
        imageUrl={sectionImages[0]}
        imageSide="left"
      >
        <NextLink href="/leagues" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
          {t('cta_leagues')}
        </NextLink>
      </ContentSection>

      <ContentSection
        title={t('section2Title')}
        subtitle={t('section2Subtitle')}
        imageUrl={sectionImages[1]}
        imageSide="right"
        variant="secondary"
      >
        <NextLink href="/leagues" className={buttonVariants({ variant: 'tertiary', size: 'lg' })}>
          {t('cta')}
        </NextLink>
      </ContentSection>

      <ContentSection title={t('section3Title')} subtitle={t('section3Subtitle')}>
        <NextLink href="/leagues" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
          {t('cta_register')}
        </NextLink>
        <NextLink href="/leagues" className={buttonVariants({ variant: 'tertiary', size: 'lg' })}>
          {t('cta_leagues')}
        </NextLink>
      </ContentSection>
    </main>
  );
}
