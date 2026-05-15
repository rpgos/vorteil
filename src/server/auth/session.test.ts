import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock next/headers before importing the module under test
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

import { cookies } from 'next/headers';
import { getOptionalSession } from './session';

const mockCookies = (value: string | undefined) => {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name === 'vorteil_session' && value ? { name, value } : undefined),
  } as ReturnType<typeof cookies> extends Promise<infer T> ? T : never);
};

describe('getOptionalSession', () => {
  beforeEach(() => {
    delete process.env.VORTEIL_DEV_SESSION;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no cookie and no env var', async () => {
    mockCookies(undefined);
    expect(await getOptionalSession()).toBeNull();
  });

  it('returns session from valid cookie', async () => {
    const session = { userId: '1', email: 'a@b.com', registrationComplete: true };
    mockCookies(JSON.stringify(session));
    expect(await getOptionalSession()).toEqual(session);
  });

  it('returns null for malformed cookie', async () => {
    mockCookies('not-valid-json');
    expect(await getOptionalSession()).toBeNull();
  });

  it('returns session from VORTEIL_DEV_SESSION env var', async () => {
    const session = { userId: 'dev', email: 'dev@local.com', registrationComplete: false };
    process.env.VORTEIL_DEV_SESSION = JSON.stringify(session);
    mockCookies(undefined);
    expect(await getOptionalSession()).toEqual(session);
  });

  it('falls through to cookie when VORTEIL_DEV_SESSION is malformed', async () => {
    process.env.VORTEIL_DEV_SESSION = 'bad-json';
    mockCookies(undefined);
    expect(await getOptionalSession()).toBeNull();
  });
});
