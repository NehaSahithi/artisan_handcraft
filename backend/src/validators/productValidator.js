import { z } from 'zod';
import { CRAFT_CATEGORIES } from '../constants/categories.js';

export const createProductSchema = z.object({
  name: z.string()
    .min(2, 'Product name must be at least 2 characters')
    .max(200, 'Product name cannot exceed 200 characters')
    .trim(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description cannot exceed 5000 characters')
    .trim(),
  category: z.enum(CRAFT_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid craft category' })
  }),
  price: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().positive('Price must be a positive number')
  ),
  discount: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0).max(99).optional().default(0)
  ),
  stock: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.number().int().nonnegative('Stock cannot be negative').default(0)
  ),
  materials: z.union([z.string(), z.array(z.string())]).optional().transform((val) => {
    if (!val) return [];
    if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
    return val;
  }),
  technique: z.string().trim().optional(),
  craftingTime: z.string().trim().optional(),
  dimensions: z.object({
    length: z.preprocess((val) => (typeof val === 'string' ? parseFloat(val) : val), z.number().positive().optional()),
    width: z.preprocess((val) => (typeof val === 'string' ? parseFloat(val) : val), z.number().positive().optional()),
    height: z.preprocess((val) => (typeof val === 'string' ? parseFloat(val) : val), z.number().positive().optional()),
    weight: z.preprocess((val) => (typeof val === 'string' ? parseFloat(val) : val), z.number().positive().optional()),
    unit: z.string().default('cm')
  }).optional(),
  originState: z.string().trim().optional(),
  originDistrict: z.string().trim().optional(),
  giCertified: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional().default(false)),
  customizable: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional().default(false)),
  tags: z.union([z.string(), z.array(z.string())]).optional().transform((val) => {
    if (!val) return [];
    if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
    return val;
  })
});

// For update schema, everything is optional
export const updateProductSchema = createProductSchema.partial();

export const reviewSchema = z.object({
  rating: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5')
  ),
  title: z.string().max(100, 'Title cannot exceed 100 characters').trim().optional(),
  comment: z.string()
    .min(5, 'Comment must be at least 5 characters')
    .max(2000, 'Comment cannot exceed 2000 characters')
    .trim()
});
