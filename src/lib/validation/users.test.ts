import { describe, it, expect } from 'vitest';
import { createUserSchema, updateUserSchema } from './users';

describe('createUserSchema', () => {
  const valid = {
    email: '  Anna.Schmidt@Example.COM  ',
    name: 'Anna Schmidt',
    gender: 'female' as const,
    lkLevel: 8.1,
    city: 'Berlin',
  };

  it('accepts a valid input and normalises email', () => {
    const result = createUserSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('anna.schmidt@example.com');
    }
  });

  it('accepts when only level is provided (no lkLevel)', () => {
    const result = createUserSchema.safeParse({ ...valid, lkLevel: undefined, level: 'intermediate' });
    expect(result.success).toBe(true);
  });

  it('rejects when neither lkLevel nor level is provided', () => {
    const result = createUserSchema.safeParse({ ...valid, lkLevel: undefined, level: undefined });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('level'))).toBe(true);
    }
  });

  it('rejects an invalid email', () => {
    const result = createUserSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects lkLevel below 1', () => {
    const result = createUserSchema.safeParse({ ...valid, lkLevel: 0.5 });
    expect(result.success).toBe(false);
  });

  it('rejects lkLevel above 23', () => {
    const result = createUserSchema.safeParse({ ...valid, lkLevel: 24 });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = createUserSchema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty city', () => {
    const result = createUserSchema.safeParse({ ...valid, city: '' });
    expect(result.success).toBe(false);
  });

  it('accepts optional fields when provided', () => {
    const result = createUserSchema.safeParse({
      ...valid,
      dominantHand: 'left',
      homeClub: 'TC Berlin',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid gender', () => {
    const result = createUserSchema.safeParse({ ...valid, gender: 'unknown' });
    expect(result.success).toBe(false);
  });
});

describe('updateUserSchema', () => {
  it('accepts empty object (no fields to update)', () => {
    expect(updateUserSchema.safeParse({}).success).toBe(true);
  });

  it('accepts partial update', () => {
    expect(updateUserSchema.safeParse({ city: 'München' }).success).toBe(true);
  });

  it('rejects invalid level', () => {
    expect(updateUserSchema.safeParse({ level: 'expert' }).success).toBe(false);
  });
});
