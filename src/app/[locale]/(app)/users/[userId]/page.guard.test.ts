import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Role } from '@/types/auth';

vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation(() => {
    throw new Error('NEXT_REDIRECT');
  }),
  notFound: vi.fn().mockImplementation(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/server/auth/guards', () => ({
  requireSession: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: vi.fn(),
}));

vi.mock('@/server/db/users', () => ({ getById: vi.fn() }));
vi.mock('@/server/db/matches', () => ({ getByPlayer: vi.fn().mockReturnValue([]) }));
vi.mock('@/server/db/scores', () => ({ getByMatch: vi.fn().mockReturnValue(null) }));
vi.mock('@/server/db/leagues', () => ({ getById: vi.fn().mockReturnValue(null) }));
vi.mock('@/server/db/memberships', () => ({
  getByUser: vi.fn().mockReturnValue([]),
  getByLeague: vi.fn().mockReturnValue([]),
}));

import { redirect, notFound } from 'next/navigation';
import { requireSession } from '@/server/auth/guards';
import * as usersDb from '@/server/db/users';
import UserPublicProfilePage from './page';

const makeParams = (userId = 'u1') => Promise.resolve({ locale: 'en', userId });

const mockSession = { userId: 'u2', email: 'viewer@example.com', registrationComplete: true, roles: [] as Role[] };

const mockUser = {
  id: 'u1',
  name: 'Anna Schmidt',
  email: 'anna@example.com',
  city: 'Berlin',
  lkLevel: 8.1,
  level: 'advanced' as const,
  gender: 'female' as const,
  dominantHand: 'right' as const,
  homeClub: null,
  roles: ['player'] as Role[],
  createdAt: new Date('2026-01-10'),
  updatedAt: new Date('2026-01-10'),
};

describe('UserPublicProfilePage access control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usersDb.getById).mockReturnValue(mockUser);
  });

  it('redirects to /login when there is no session', async () => {
    vi.mocked(requireSession).mockImplementation(async () => {
      redirect('/login');
      return undefined as never;
    });

    await expect(UserPublicProfilePage({ params: makeParams() })).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('calls notFound() for an unknown userId', async () => {
    vi.mocked(requireSession).mockResolvedValue(mockSession);
    vi.mocked(usersDb.getById).mockReturnValue(null);

    await expect(UserPublicProfilePage({ params: makeParams('unknown') })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('renders successfully for an authenticated user viewing another profile', async () => {
    vi.mocked(requireSession).mockResolvedValue(mockSession);

    const result = await UserPublicProfilePage({ params: makeParams() });
    expect(result).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('renders successfully for an authenticated user viewing their own profile', async () => {
    vi.mocked(requireSession).mockResolvedValue({ ...mockSession, userId: 'u1' });

    const result = await UserPublicProfilePage({ params: makeParams('u1') });
    expect(result).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });
});
