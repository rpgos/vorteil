import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserProfileForm, { type RegistrationLabels } from './user-profile-form';

const mockAction = vi.fn();

const labels: RegistrationLabels = {
  emailLabel: 'Email',
  nameLabel: 'Full name',
  namePlaceholder: 'Anna Schmidt',
  genderLabel: 'Gender',
  genderFemale: 'Female',
  genderMale: 'Male',
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
  it('renders the email field', () => {
    render(<UserProfileForm labels={labels} action={mockAction} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders email as editable in register mode', () => {
    render(<UserProfileForm labels={labels} action={mockAction} mode="register" />);
    const input = screen.getByLabelText('Email') as HTMLInputElement;
    expect(input.readOnly).toBe(false);
  });

  it('renders email as read-only in edit mode', () => {
    render(<UserProfileForm labels={labels} action={mockAction} mode="edit" />);
    const input = screen.getByLabelText('Email') as HTMLInputElement;
    expect(input.readOnly).toBe(true);
  });

  it('pre-fills inputs with defaultValues', () => {
    render(
      <UserProfileForm
        labels={labels}
        action={mockAction}
        mode="edit"
        defaultValues={{ email: 'anna@example.com', name: 'Anna Schmidt', city: 'Berlin' }}
      />
    );
    expect((screen.getByLabelText('Email') as HTMLInputElement).defaultValue).toBe('anna@example.com');
    expect((screen.getByLabelText('Full name') as HTMLInputElement).defaultValue).toBe('Anna Schmidt');
    expect((screen.getByLabelText('City') as HTMLInputElement).defaultValue).toBe('Berlin');
  });

  it('renders the name input', () => {
    render(<UserProfileForm labels={labels} action={mockAction} />);
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<UserProfileForm labels={labels} action={mockAction} />);
    expect(screen.getByRole('button', { name: 'Save profile' })).toBeInTheDocument();
  });
});
