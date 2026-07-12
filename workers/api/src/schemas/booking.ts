import { z } from 'zod';

export const ticketInputSchema = z.object({
  type: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
  seat: z.string().optional(),
});

export const createBookingSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  tickets: z.array(ticketInputSchema).min(1, 'At least one ticket required'),
  paymentMethod: z.string().optional().default('credit_card'),
  totalAmount: z.number().min(0),
});
