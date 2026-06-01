import { z } from 'zod';
import { ORDER_STATUSES } from '../constants/categories.js';

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(1, 'Recipient full name is required').trim(),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit phone number'),
    street: z.string().min(1, 'Street address is required').trim(),
    city: z.string().min(1, 'City is required').trim(),
    state: z.string().min(1, 'State is required').trim(),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits')
  }),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').trim().optional()
});

export const updateItemStatusSchema = z.object({
  status: z.enum([
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.PROCESSING,
    ORDER_STATUSES.SHIPPED,
    ORDER_STATUSES.DELIVERED,
    ORDER_STATUSES.CANCELLED
  ], {
    errorMap: () => ({ message: 'Please provide a valid order item status' })
  })
});
