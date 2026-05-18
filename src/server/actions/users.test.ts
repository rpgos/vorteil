import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/server/auth/guards', () => ({
  requireSession: vi
    .fn()
    .mockResolvedValue({ userId: 'u1', email: 'anna@example.com', registrationComplete: true, roles: [] }),
}));

import { redirect } from 'next/navigation';
import { completeRegistration, updateProfile, requestAccountDeletion } from './users';

function makeFormData(values: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

const validData = {
  email: 'anna@example.com',
  name: 'Anna Schmidt',
  gender: 'female',
  lkLevel: '8.1',
  city: 'Berlin',
};

describe('completeRegistration', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects to / on valid input', async () => {
    await completeRegistration(null, makeFormData(validData));
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('accepts input with level instead of lkLevel', async () => {
    await completeRegistration(null, makeFormData({ ...validData, lkLevel: '', level: 'intermediate' }));
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('returns VALIDATION error when name is missing', async () => {
    const result = await completeRegistration(null, makeFormData({ ...validData, name: '' }));
    expect(result?.ok).toBe(false);
    if (result?.ok === false) {
      expect(result.error.code).toBe('VALIDATION');
      expect(result.error.fieldErrors?.name).toBeDefined();
    }
  });

  it('returns VALIDATION error when neither lkLevel nor level provided', async () => {
    const fd = makeFormData({
      email: 'anna@example.com',
      name: 'Anna',
      gender: 'female',
      city: 'Berlin',
      lkLevel: '',
      level: '',
    });
    const result = await completeRegistration(null, fd);
    expect(result?.ok).toBe(false);
    if (result?.ok === false) {
      expect(result.error.code).toBe('VALIDATION');
      expect(result.error.fieldErrors?.level).toBeDefined();
    }
  });

  it('returns VALIDATION error for invalid gender', async () => {
    const result = await completeRegistration(null, makeFormData({ ...validData, gender: 'unknown' }));
    expect(result?.ok).toBe(false);
  });

  it('returns VALIDATION error for lkLevel out of range', async () => {
    const result = await completeRegistration(null, makeFormData({ ...validData, lkLevel: '30' }));
    expect(result?.ok).toBe(false);
    if (result?.ok === false) {
      expect(result.error.fieldErrors?.lkLevel).toBeDefined();
    }
  });

  it('returns VALIDATION error for invalid email', async () => {
    const result = await completeRegistration(null, makeFormData({ ...validData, email: 'not-an-email' }));
    expect(result?.ok).toBe(false);
    if (result?.ok === false) {
      expect(result.error.fieldErrors?.email).toBeDefined();
    }
  });
});

const validEditData = {
  name: 'Anna Schmidt',
  gender: 'female',
  lkLevel: '8.1',
  city: 'Berlin',
};

describe('updateProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns ok on valid input', async () => {
    const result = await updateProfile(null, makeFormData(validEditData));
    expect(result?.ok).toBe(true);
  });

  it('returns VALIDATION error when name is missing', async () => {
    const result = await updateProfile(null, makeFormData({ ...validEditData, name: '' }));
    expect(result?.ok).toBe(false);
    if (result?.ok === false) {
      expect(result.error.code).toBe('VALIDATION');
      expect(result.error.fieldErrors?.name).toBeDefined();
    }
  });

  it('returns VALIDATION error for invalid gender', async () => {
    const result = await updateProfile(null, makeFormData({ ...validEditData, gender: 'unknown' }));
    expect(result?.ok).toBe(false);
  });
});

describe('requestAccountDeletion', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns ok', async () => {
    const result = await requestAccountDeletion();
    expect(result?.ok).toBe(true);
  });
});
