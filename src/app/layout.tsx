import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Vorteil',
    template: '%s · Vorteil',
  },
  description: 'Competitive amateur tennis leagues.',
  openGraph: {
    siteName: 'Vorteil',
    type: 'website',
    images: [{ url: '/og-default.jpg', width: 640, height: 480, alt: 'Vorteil' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
