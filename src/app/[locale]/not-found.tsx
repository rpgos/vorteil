import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import NextLink from 'next/link';
import { buttonVariants } from '@heroui/react';

export default async function NotFound() {
  const t = await getTranslations('NotFound');

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1658530190197-29f63baaa460"
        alt="Tennis ball out of bounds"
        fill
        className="object-cover brightness-50"
        priority
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-10 py-12 text-center rounded-2xl bg-black/40 backdrop-blur-sm max-w-md mx-6">
        <h1 className="font-groovello text-4xl font-bold text-white sm:text-5xl">{t('heading')}</h1>
        <NextLink href="/" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
          {t('cta')}
        </NextLink>
      </div>
    </main>
  );
}
