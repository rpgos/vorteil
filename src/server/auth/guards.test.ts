import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('./session', () => ({
  getOptionalSession: vi.fn(),
}));

import { redirect } from 'next/navigation';
import { getOptionalSession } from './session';
import { requireSession } from './guards';

describe('requireSession', () => {
  afterEach(() => vi.clearAllMocks());

  it('returns the session when one exists', async () => {
    const session = { userId: 'u1', email: 'a@b.com', registrationComplete: true };
    vi.mocked(getOptionalSession).mockResolvedValue(session);
    const result = await requireSession();
    expect(result).toEqual(session);
    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirects to /login when no session', async () => {
    vi.mocked(getOptionalSession).mockResolvedValue(null);
    await requireSession().catch(() => {});
    expect(redirect).toHaveBeenCalledWith('/login');
  });
});
