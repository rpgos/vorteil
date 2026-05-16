import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserProfileForm, { type RegistrationLabels } from './user-profile-form';

vi.mock('@/server/actions/users', () => ({
  completeRegistration: vi.fn(),
}));

const labels: RegistrationLabels = {
  emailLabel: 'Email',
  nameLabel: 'Full name',
  namePlaceholder: 'Anna Schmidt',
  genderLabel: 'Gender',
  genderFemale: 'Female',
  genderMale: 'Male',
  genderNonBinary: 'Non-binary',
  genderPreferNotToSay: 'Prefer not to say',
  lkLevelLabel: 'LK level',
  lkLevelPlaceholder: 'e.g. 8.1',
  lkLevelHint: 'Your LK ranking.',
  levelLabel: 'Skill level',
  levelPlaceholder: 'Select a level',
  levelBeginner: 'Beginner',
  levelIntermediate: 'Intermediate',
  levelAdvanced: 'Advanced',
  levelPro: 'Pro',
  levelHint: 'Required if no LK level.',
  cityLabel: 'City',
  cityPlaceholder: 'Berlin',
  dominantHandLabel: 'Dominant hand',
  dominantHandPlaceholder: 'Select (optional)',
  dominantHandRight: 'Right',
  dominantHandLeft: 'Left',
  homeClubLabel: 'Home club',
  homeClubPlaceholder: 'TC Rot-Weiß Berlin',
  submitLabel: 'Save profile',
  privacyNote: 'Visible to logged-in players only.',
  errorInvalid: 'Please check the highlighted fields.',
  successMessage: 'Check your email to confirm.',
};

describe('UserProfileForm', () => {
  it('renders the email field as read-only pre-filled', () => {
    render(<UserProfileForm labels={labels} />);
    const input = screen.getByLabelText('Email') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.readOnly).toBe(false);
  });

  it('renders the name input', () => {
    render(<UserProfileForm labels={labels} />);
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
  });

  it('renders the gender select with all options', () => {
    render(<UserProfileForm labels={labels} />);
    expect(screen.getByLabelText('Gender')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Female' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Non-binary' })).toBeInTheDocument();
  });

  it('renders the skill level select', () => {
    render(<UserProfileForm labels={labels} />);
    expect(screen.getByLabelText('Skill level')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Intermediate' })).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<UserProfileForm labels={labels} />);
    expect(screen.getByRole('button', { name: 'Save profile' })).toBeInTheDocument();
  });
});
