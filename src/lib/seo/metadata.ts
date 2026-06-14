import type { Metadata } from 'next';

type BuildMetadataOptions = {
  title: string;
  description: string;
  locale: string;
  path: string;
  image?: string;
  noindex?: boolean;
};

/**
 * Builds a Next.js Metadata object with consistent OG and Twitter card defaults.
 * `metadataBase` is set once in the root layout so relative paths work correctly.
 */
export function buildMetadata({ title, description, locale, path, image, noindex }: BuildMetadataOptions): Metadata {
  const canonicalUrl = `/${locale}${path}`;
  const ogImage = image ?? '/og-default.jpg';

  return {
    title,
    description,
    ...(noindex && { robots: { index: false, follow: false } }),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Vorteil',
      locale,
      type: 'website',
      images: [{ url: ogImage, width: 640, height: 480, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
