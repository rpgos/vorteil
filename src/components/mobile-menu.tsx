'use client';

import { useState } from 'react';
import { Button, buttonVariants } from '@heroui/react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './locale-switcher';
import type { Session } from '@/server/auth/session';

interface MobileMenuProps {
  session?: Session | null;
}

export function MobileMenu({ session }: MobileMenuProps) {
  const t = useTranslations('Header');
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        isIconOnly
        onPress={() => setOpen(prev => !prev)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="md:hidden"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {open && (
        <nav className="md:hidden absolute top-full left-0 right-0 flex flex-col items-center gap-1 py-4 bg-background/95 backdrop-blur-sm border-b border-border/40">
          <Link href="/leagues" className={buttonVariants({ variant: 'ghost' })} onClick={() => setOpen(false)}>
            {t('leagues')}
          </Link>
          {session && (
            <Link href="/users/profile" className={buttonVariants({ variant: 'ghost' })} onClick={() => setOpen(false)}>
              {t('profile')}
            </Link>
          )}
          <Link href="/about" className={buttonVariants({ variant: 'ghost' })} onClick={() => setOpen(false)}>
            {t('howItWorks')}
          </Link>
          <div className="pt-2">
            <LocaleSwitcher />
          </div>
        </nav>
      )}
    </>
  );
}
