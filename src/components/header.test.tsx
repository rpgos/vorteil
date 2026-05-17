import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './header';

vi.mock('next-intl/server', () => ({
  getTranslations: () => Promise.resolve((key: string) => key),
}));

vi.mock('@/server/auth/session', () => ({
  getOptionalSession: vi.fn(),
}));

vi.mock('@/server/actions/auth', () => ({
  signOut: vi.fn(),
}));

vi.mock('./mobile-menu', () => ({
  MobileMenu: () => <div data-testid="mobile-menu" />,
}));

vi.mock('./theme-switcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher" />,
}));

vi.mock('./locale-switcher', () => ({
  LocaleSwitcher: () => <div data-testid="locale-switcher" />,
}));

import { getOptionalSession } from '@/server/auth/session';
import type { Role } from '@/types/auth';

const session = { userId: 'u1', email: 'a@b.com', registrationComplete: true, roles: ['player' as Role] };

async function renderHeader() {
  render(await Header());
}

describe('Header', () => {
  it('renders the logo linking to /', async () => {
    vi.mocked(getOptionalSession).mockResolvedValue(null);
    await renderHeader();
    const logo = screen.getByRole('link', { name: 'Vorteil' });
    expect(logo).toHaveAttribute('href', '/');
  });

  it('renders the Leagues and How it Works nav links', async () => {
    vi.mocked(getOptionalSession).mockResolvedValue(null);
    await renderHeader();
    expect(screen.getByRole('link', { name: 'leagues' })).toHaveAttribute('href', '/leagues');
    expect(screen.getByRole('link', { name: 'howItWorks' })).toHaveAttribute('href', '/about');
  });

  it('renders the login link when no session', async () => {
    vi.mocked(getOptionalSession).mockResolvedValue(null);
    await renderHeader();
    expect(screen.getByRole('link', { name: 'login' })).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('button', { name: 'logout' })).not.toBeInTheDocument();
  });

  it('renders the logout button when session is present', async () => {
    vi.mocked(getOptionalSession).mockResolvedValue(session);
    await renderHeader();
    expect(screen.getByRole('button', { name: 'logout' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'login' })).not.toBeInTheDocument();
  });

  it('renders the profile link only when logged in', async () => {
    vi.mocked(getOptionalSession).mockResolvedValue(session);
    await renderHeader();
    expect(screen.getByRole('link', { name: 'profile' })).toHaveAttribute('href', '/users/profile');
  });

  it('does not render the profile link when logged out', async () => {
    vi.mocked(getOptionalSession).mockResolvedValue(null);
    await renderHeader();
    expect(screen.queryByRole('link', { name: 'profile' })).not.toBeInTheDocument();
  });
});
