import { describe, it, expect } from 'vitest';
import { buildMetadata } from './metadata';

describe('buildMetadata', () => {
  const base = {
    title: 'Berlin Summer League · Vorteil',
    description: 'The premier amateur tennis league in Berlin.',
    locale: 'en',
    path: '/leagues/l1',
  };

  it('sets title and description', () => {
    const meta = buildMetadata(base);
    expect(meta.title).toBe(base.title);
    expect(meta.description).toBe(base.description);
  });

  it('sets canonical alternate URL from locale + path', () => {
    const meta = buildMetadata(base);
    expect(meta.alternates?.canonical).toBe('/en/leagues/l1');
  });

  it('uses default OG image when none provided', () => {
    const meta = buildMetadata(base);
    const images = meta.openGraph?.images as Array<{ url: string }>;
    expect(images[0].url).toBe('/og-default.jpg');
  });

  it('uses custom image when provided', () => {
    const meta = buildMetadata({ ...base, image: '/custom.png' });
    const images = meta.openGraph?.images as Array<{ url: string }>;
    expect(images[0].url).toBe('/custom.png');
    const twitterImages = meta.twitter?.images as string[];
    expect(twitterImages[0]).toBe('/custom.png');
  });

  it('does not set robots when noindex is false', () => {
    const meta = buildMetadata({ ...base, noindex: false });
    expect(meta.robots).toBeUndefined();
  });

  it('sets noindex robots when noindex is true', () => {
    const meta = buildMetadata({ ...base, noindex: true });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it('sets openGraph siteName to Vorteil', () => {
    const meta = buildMetadata(base);
    expect(meta.openGraph?.siteName).toBe('Vorteil');
  });

  it('sets openGraph locale', () => {
    const meta = buildMetadata({ ...base, locale: 'de' });
    expect(meta.openGraph?.locale).toBe('de');
  });

  it('sets twitter card to summary_large_image', () => {
    const meta = buildMetadata(base);
    const twitter = meta.twitter as { card?: string };
    expect(twitter?.card).toBe('summary_large_image');
  });
});
