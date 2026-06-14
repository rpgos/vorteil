import { describe, it, expect } from 'vitest';
import nextConfig from '../../../next.config';
import type { NextConfig } from 'next';

// Unwrap the next-intl plugin wrapper to get the raw config
// The plugin wraps the config but headers() is still callable
async function getHeaders() {
  const config = nextConfig as NextConfig;
  const result = await config.headers?.();
  return result ?? [];
}

function findHeader(headers: Array<{ key: string; value: string }>, key: string) {
  return headers.find(h => h.key === key)?.value;
}

describe('security headers', () => {
  it('applies headers to all routes', async () => {
    const routes = await getHeaders();
    expect(routes[0].source).toBe('/(.*)');
  });

  it('sets X-Frame-Options to DENY', async () => {
    const [{ headers }] = await getHeaders();
    expect(findHeader(headers, 'X-Frame-Options')).toBe('DENY');
  });

  it('sets X-Content-Type-Options to nosniff', async () => {
    const [{ headers }] = await getHeaders();
    expect(findHeader(headers, 'X-Content-Type-Options')).toBe('nosniff');
  });

  it('sets Referrer-Policy', async () => {
    const [{ headers }] = await getHeaders();
    expect(findHeader(headers, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('sets Strict-Transport-Security with preload', async () => {
    const [{ headers }] = await getHeaders();
    const hsts = findHeader(headers, 'Strict-Transport-Security');
    expect(hsts).toContain('max-age=63072000');
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).toContain('preload');
  });

  it('sets Permissions-Policy denying camera and microphone', async () => {
    const [{ headers }] = await getHeaders();
    const pp = findHeader(headers, 'Permissions-Policy');
    expect(pp).toContain('camera=()');
    expect(pp).toContain('microphone=()');
  });

  it('sets Content-Security-Policy', async () => {
    const [{ headers }] = await getHeaders();
    const csp = findHeader(headers, 'Content-Security-Policy');
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain('https://images.unsplash.com');
  });
});
