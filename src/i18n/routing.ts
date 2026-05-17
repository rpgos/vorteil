import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'pt', 'de'] as const;

export const routing = defineRouting({
  locales: locales,
  defaultLocale: 'en',
});
