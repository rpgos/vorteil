import { getTranslations } from 'next-intl/server';
import NextLink from 'next/link';
import { buttonVariants } from '@heroui/react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { getOptionalSession } from '@/server/auth/session';
import { signOut } from '@/server/actions/auth';

export async function Header() {
  const t = await getTranslations('Header');
  const session = await getOptionalSession();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-border/40 bg-background/80">
      <NextLink href="/" className="font-groovello text-2xl shrink-0">
        Vorteil
      </NextLink>

      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
        <NextLink href="/leagues" className={buttonVariants({ variant: 'ghost' })}>
          {t('leagues')}
        </NextLink>
        {session && (
          <NextLink href="/users/profile" className={buttonVariants({ variant: 'ghost' })}>
            {t('profile')}
          </NextLink>
        )}
        <NextLink href="/about" className={buttonVariants({ variant: 'ghost' })}>
          {t('howItWorks')}
        </NextLink>
      </nav>

      <div className="flex items-center gap-2 shrink-0">
        <LocaleSwitcher />
        <ThemeSwitcher />
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
      </div>
    </header>
  );
}
