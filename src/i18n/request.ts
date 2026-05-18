import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const [home, header, notFound, auth, register, footer, profile] = await Promise.all([
    import(`../../messages/${locale}/home.json`),
    import(`../../messages/${locale}/header.json`),
    import(`../../messages/${locale}/not-found.json`),
    import(`../../messages/${locale}/auth.json`),
    import(`../../messages/${locale}/register.json`),
    import(`../../messages/${locale}/footer.json`),
    import(`../../messages/${locale}/profile.json`),
  ]);

  return {
    locale,
    messages: {
      Home: home.default,
      Header: header.default,
      NotFound: notFound.default,
      Auth: auth.default,
      Register: register.default,
      Footer: footer.default,
      Profile: profile.default,
    },
  };
});
