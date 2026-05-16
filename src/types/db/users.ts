import type { Role } from '@/types/auth';

export type Gender = 'female' | 'male';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';
export type DominantHand = 'right' | 'left';

export type User = {
  id: string;
  email: string;
  name: string;
  gender: Gender;
  /** German LK ranking 1.0–25.0; null if not provided */
  lkLevel: number | null;
  /** Required when lkLevel is null */
  level: SkillLevel;
  city: string;
  dominantHand: DominantHand | null;
  homeClub: string | null;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
};
