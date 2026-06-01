import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z.string()
    .email('Please provide a valid email address')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters'),
  role: z.enum(['buyer', 'artisan']).optional().default('buyer'),
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number')
    .optional()
});

export const loginSchema = z.object({
  email: z.string()
    .email('Please provide a valid email address')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim()
    .optional(),
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number')
    .optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
});

export const addressSchema = z.object({
  fullName: z.string().min(1, 'Recipient full name is required').trim(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit phone number'),
  street: z.string().min(1, 'Street address is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.string().min(1, 'State is required').trim(),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  isDefault: z.boolean().optional().default(false)
});
