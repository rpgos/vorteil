import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileMenu } from './mobile-menu';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock('./locale-switcher', () => ({
  LocaleSwitcher: () => <div data-testid="locale-switcher" />,
}));

import type { Role } from '@/types/auth';
const session = { userId: 'u1', email: 'a@b.com', registrationComplete: true, roles: ['player' as Role] };

describe('MobileMenu', () => {
  it('renders the toggle button', () => {
    render(<MobileMenu />);
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  it('does not show nav links before opening', () => {
    render(<MobileMenu />);
    expect(screen.queryByRole('link', { name: 'leagues' })).not.toBeInTheDocument();
  });

  it('shows nav links after clicking the toggle', async () => {
    render(<MobileMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('link', { name: 'leagues' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'howItWorks' })).toBeInTheDocument();
  });

  it('toggles to close icon when open', async () => {
    render(<MobileMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();
  });

  it('hides nav links after closing', async () => {
    render(<MobileMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(screen.queryByRole('link', { name: 'leagues' })).not.toBeInTheDocument();
  });

  it('does not show profile link when no session', async () => {
    render(<MobileMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.queryByRole('link', { name: 'profile' })).not.toBeInTheDocument();
  });

  it('shows profile link when session is present', async () => {
    render(<MobileMenu session={session} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('link', { name: 'profile' })).toBeInTheDocument();
  });

  it('closes the menu when a link is clicked', async () => {
    render(<MobileMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    await userEvent.click(screen.getByRole('link', { name: 'leagues' }));
    expect(screen.queryByRole('link', { name: 'leagues' })).not.toBeInTheDocument();
  });

  it('renders the locale switcher when open', async () => {
    render(<MobileMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByTestId('locale-switcher')).toBeInTheDocument();
  });
});
