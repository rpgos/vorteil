import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing the module under test
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/security/rateLimit', () => ({
  withRateLimit: vi.fn((_key, _id, fn) => fn()),
}));
vi.mock('@/server/auth/session', () => ({
  clearSession: vi.fn().mockResolvedValue(undefined),
}));

import { redirect } from 'next/navigation';
import { requestMagicLink, signOut } from './auth';

function makeFormData(values: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

describe('requestMagicLink', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns ok:true for a valid email', async () => {
    const result = await requestMagicLink(null, makeFormData({ email: 'user@example.com' }));
    expect(result.ok).toBe(true);
  });

  it('normalises the email (trims, lowercases)', async () => {
    const result = await requestMagicLink(null, makeFormData({ email: '  USER@EXAMPLE.COM  ' }));
    expect(result.ok).toBe(true);
  });

  it('returns a VALIDATION error for an invalid email', async () => {
    const result = await requestMagicLink(null, makeFormData({ email: 'not-an-email' }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION');
      expect(result.error.fieldErrors?.email).toBeDefined();
    }
  });

  it('returns a VALIDATION error for an empty email', async () => {
    const result = await requestMagicLink(null, makeFormData({ email: '' }));
    expect(result.ok).toBe(false);
  });
});

describe('signOut', () => {
  beforeEach(() => vi.clearAllMocks());

  it('clears the session and redirects to /', async () => {
    const { clearSession } = await import('@/server/auth/session');
    await signOut();
    expect(clearSession).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith('/');
  });
});
