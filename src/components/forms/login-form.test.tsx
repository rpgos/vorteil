import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginForm, { type LoginFormLabels } from './login-form';

vi.mock('@/server/actions/auth', () => ({
  requestMagicLink: vi.fn(),
  signInWithOAuth: vi.fn(),
}));

const labels: LoginFormLabels = {
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  submitLabel: 'Send magic link',
  successMessage: 'Check your email',
  continueWithGoogle: 'Continue with Google',
  continueWithApple: 'Continue with Apple',
  orDivider: 'or',
  errorInvalidEmail: 'Invalid email',
  errorGeneric: 'Something went wrong',
  noAccount: "Don't have an account?",
  registerLink: 'Register',
};

describe('LoginForm', () => {
  it('renders the email input and submit button', () => {
    render(<LoginForm labels={labels} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send magic link' })).toBeInTheDocument();
  });

  it('renders the OAuth buttons', () => {
    render(<LoginForm labels={labels} />);
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Apple' })).toBeInTheDocument();
  });

  it('renders the or divider', () => {
    render(<LoginForm labels={labels} />);
    expect(screen.getByText('or')).toBeInTheDocument();
  });

  it('renders the register link', () => {
    render(<LoginForm labels={labels} />);
    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute('href', 'register');
  });
});
