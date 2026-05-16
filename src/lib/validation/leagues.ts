import { z } from 'zod';

export const levelRangeSchema = z
  .object({
    min: z.number().min(1).max(23),
    max: z.number().min(1).max(23),
  })
  .refine(r => r.max >= r.min, { message: 'max must be >= min', path: ['max'] });

export const createLeagueSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
    city: z.string().min(1, 'City is required').max(100, 'City is too long'),
    levelRange: levelRangeSchema.optional(),
    regularSeasonRounds: z.number().int().positive().default(8),
    hasPlayoffs: z.boolean().default(true),
    regularSeasonEnd: z.coerce.date(),
    playoffsEnd: z.coerce.date().optional(),
    maxParticipants: z.number().int().positive().optional(),
    description: z.string().max(2000).optional(),
  })
  .refine(data => !data.hasPlayoffs || data.playoffsEnd != null, {
    message: 'Playoffs end date is required when playoffs are enabled',
    path: ['playoffsEnd'],
  })
  .refine(data => data.playoffsEnd == null || data.playoffsEnd > data.regularSeasonEnd, {
    message: 'Playoffs end date must be after regular season end date',
    path: ['playoffsEnd'],
  });

export const updateLeagueSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  city: z.string().min(1).max(100).optional(),
  levelRange: levelRangeSchema.optional(),
  regularSeasonRounds: z.number().int().positive().optional(),
  hasPlayoffs: z.boolean().optional(),
  regularSeasonEnd: z.coerce.date().optional(),
  playoffsEnd: z.coerce.date().optional(),
  maxParticipants: z.number().int().positive().optional(),
  description: z.string().max(2000).optional(),
});

export type CreateLeagueInput = z.infer<typeof createLeagueSchema>;
export type UpdateLeagueInput = z.infer<typeof updateLeagueSchema>;
