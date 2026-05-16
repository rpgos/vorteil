import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('next/navigation', () => ({ redirect: vi.fn(), notFound: vi.fn() }));
vi.mock('./session', () => ({
  getOptionalSession: vi.fn(),
}));

import { redirect, notFound } from 'next/navigation';
import { getOptionalSession } from './session';
import { requireSession, requireRole } from './guards';
import type { Role } from '@/types/auth';

const sessionWithRole = (roles: Role[]) => ({
  userId: 'u1',
  email: 'a@b.com',
  registrationComplete: true,
  roles,
});

describe('requireSession', () => {
  afterEach(() => vi.clearAllMocks());

  it('returns the session when one exists', async () => {
    const session = sessionWithRole(['player']);
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

describe('requireRole', () => {
  afterEach(() => vi.clearAllMocks());

  it('returns the session when the user has the required role', async () => {
    const session = sessionWithRole(['admin']);
    vi.mocked(getOptionalSession).mockResolvedValue(session);
    const result = await requireRole('admin');
    expect(result).toEqual(session);
    expect(notFound).not.toHaveBeenCalled();
  });

  it('calls notFound() when the user lacks the required role', async () => {
    const session = sessionWithRole(['player']);
    vi.mocked(getOptionalSession).mockResolvedValue(session);
    await requireRole('admin').catch(() => {});
    expect(notFound).toHaveBeenCalled();
  });

  it('redirects to /login when there is no session', async () => {
    vi.mocked(getOptionalSession).mockResolvedValue(null);
    await requireRole('admin').catch(() => {});
    expect(redirect).toHaveBeenCalledWith('/login');
  });
});
