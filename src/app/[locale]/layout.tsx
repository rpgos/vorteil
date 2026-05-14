import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/header';
import '../globals.css';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const groovello = localFont({
  src: '../../../public/fonts/Groovello.ttf',
  variable: '--font-groovello',
});

const bricolage = localFont({
  src: '../../../public/fonts/BricolageGrotesque.ttf',
  variable: '--font-bricolage-grotesque',
});

export const metadata: Metadata = {
  title: 'Vorteil - Amateur League',
  description: 'A competitive amateur league for the sport of your choice.',
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${bricolage.variable} ${geistMono.variable} ${groovello.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
