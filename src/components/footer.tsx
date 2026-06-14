import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function Footer() {
  const t = await getTranslations('Footer');

  return (
    <footer className="mt-auto border-t border-border/40 py-8 px-6">
      <div className="grid grid-cols-3 items-center">
        <div />
        <div className="flex flex-col items-center gap-2">
          <NextLink href="/" className="font-groovello text-2xl">
            Vorteil
          </NextLink>
          <p className="text-sm text-foreground/50">
            &copy; {new Date().getFullYear()} {t('copyright')}
          </p>
        </div>
        <nav className="flex flex-col md:flex-row items-end gap-6 text-sm text-foreground/60 justify-end">
          <NextLink href="/about" className="hover:text-foreground transition-colors">
            {t('howItWorks')}
          </NextLink>
          <NextLink href="/contact" className="hover:text-foreground transition-colors">
            {t('contact')}
          </NextLink>
          <NextLink href="/privacy" className="hover:text-foreground transition-colors">
            {t('privacyPolicy')}
          </NextLink>
        </nav>
      </div>
    </footer>
  );
}
