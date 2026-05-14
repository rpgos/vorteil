import { getTranslations } from 'next-intl/server';
import NextLink from 'next/link';
import { buttonVariants } from '@heroui/react';
import { ThemeSwitcher } from '@/components/theme-switcher';

export async function Header() {
  const t = await getTranslations('Header');

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-border/40 bg-background/80">
      <NextLink href="/" className="font-groovello text-2xl">
        Vorteil
      </NextLink>

      <nav className="flex items-center gap-2">
        <ThemeSwitcher />
        <NextLink href="/about" className={buttonVariants({ variant: 'ghost' })}>
          {t('about')}
        </NextLink>
        <NextLink href="/login" className={buttonVariants({ variant: 'primary' })}>
          {t('login')}
        </NextLink>
      </nav>
    </header>
  );
}
