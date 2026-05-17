'use client';

import { usePathname } from '@/i18n/navigation';
import { locales } from '@/i18n/routing';
import { Button, Dropdown, Link } from '@heroui/react';
import { useLocale } from 'next-intl';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-0.5">
      <Dropdown>
        <Button aria-label="Menu" variant="outline">
          {locale.toUpperCase()}
        </Button>
        <Dropdown.Popover>
          <Dropdown.Menu aria-label="Select language">
            {locales.map(code => (
              <Dropdown.Item key={code} id={code} textValue={code}>
                <Link
                  key={code}
                  href={`/${code}${pathname}`}
                  className={`min-w-0 w-full px-1.5 h-7 no-underline text-xs font-medium ${locale === code ? 'text-foreground' : 'text-foreground/50'}`}
                  aria-label={`Switch to ${code} locale`}
                  aria-current={locale === code ? 'true' : undefined}
                >
                  {code.toUpperCase()}
                </Link>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}
