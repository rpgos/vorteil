import { getTranslations } from 'next-intl/server';
import NextLink from 'next/link';
import { buttonVariants } from '@heroui/react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { getOptionalSession } from '@/server/auth/session';
import { signOut } from '@/server/actions/auth';

export async function Header() {
  const t = await getTranslations('Header');
  const session = await getOptionalSession();

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
        {session ? (
          <form action={signOut}>
            <button type="submit" className={buttonVariants({ variant: 'ghost' })}>
              {t('logout')}
            </button>
          </form>
        ) : (
          <NextLink href="/login" className={buttonVariants({ variant: 'primary' })}>
            {t('login')}
          </NextLink>
        )}
      </nav>
    </header>
  );
}
