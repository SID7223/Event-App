import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  avatarId: z.string().optional(),
  bio: z.string().max(500).optional(),
  username: z.string().min(3).max(50).regex(/^[a-z0-9._]+$/, 'Username can only contain lowercase letters, numbers, dots and underscores').optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
});

export const updatePreferencesSchema = z.object({
  preferences: z.array(z.string()).min(1, 'At least one preference required'),
});

export const updateLocationSchema = z.object({
  city: z.string().min(1, 'City is required'),
  neighborhood: z.string().min(1, 'Neighborhood is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  country: z.string().optional(),
  fullAddress: z.string().optional(),
});
