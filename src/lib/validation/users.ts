import { z } from 'zod';

export const genderSchema = z.enum(['female', 'male']);
export const skillLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'pro']);
export const dominantHandSchema = z.enum(['right', 'left']);

export const createUserSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    gender: genderSchema,
    /** LK ranking 1.0–25.0, one decimal place */
    lkLevel: z.number().min(1, 'LK level must be at least 1.0').max(25, 'LK level must be at most 25.0').optional(),
    level: skillLevelSchema.optional(),
    city: z.string().min(1, 'City is required').max(100, 'City is too long'),
    dominantHand: dominantHandSchema.optional(),
    homeClub: z.string().max(200, 'Home club name is too long').optional(),
  })
  .refine(data => data.lkLevel != null || data.level != null, {
    message: 'At least one of LK level or skill level must be provided',
    path: ['level'],
  });

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  gender: genderSchema.optional(),
  lkLevel: z.number().min(1).max(25).optional(),
  level: skillLevelSchema.optional(),
  city: z.string().min(1).max(100).optional(),
  dominantHand: dominantHandSchema.optional(),
  homeClub: z.string().max(200).optional(),
});

/** Schema for the edit-profile form: same rules as createUserSchema minus email. */
export const editUserSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    gender: genderSchema,
    lkLevel: z.number().min(1, 'LK level must be at least 1.0').max(25, 'LK level must be at most 25.0').optional(),
    level: skillLevelSchema.optional(),
    city: z.string().min(1, 'City is required').max(100, 'City is too long'),
    dominantHand: dominantHandSchema.optional(),
    homeClub: z.string().max(200, 'Home club name is too long').optional(),
  })
  .refine(data => data.lkLevel != null || data.level != null, {
    message: 'At least one of LK level or skill level must be provided',
    path: ['level'],
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type EditUserInput = z.infer<typeof editUserSchema>;
