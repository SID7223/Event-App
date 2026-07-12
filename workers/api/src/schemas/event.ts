import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  category: z.string().optional(),
  price: z.number().min(0).optional().default(0),
  location: z.string().optional().default(''),
  date: z.string().min(1, 'Date is required'),
  time: z.string().optional().default(''),
  organizerId: z.string().optional(),
  venueId: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional().default('lahore'),
  bookingType: z.enum(['external_link', 'whatsapp', 'in_app']).optional().default('in_app'),
  externalLink: z.string().url().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  dataSource: z.enum(['ticketwala', 'bookme', 'manual_entry', 'user_host']).optional().default('manual_entry'),
  image: z.string().optional(),
  featured: z.boolean().optional().default(false),
  featuredUntil: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const eventQuerySchema = z.object({
  category: z.string().optional(),
  city: z.string().optional(),
  q: z.string().optional(),
  neighborhood: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: z.enum(['date', 'popular', 'rating']).optional().default('date'),
});
