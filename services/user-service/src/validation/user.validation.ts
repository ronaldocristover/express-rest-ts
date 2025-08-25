import { z } from 'zod';

export const CreateUserSchema = z.object({
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .trim(),
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one lowercase letter, one uppercase letter, and one number')
});

export const UpdateUserSchema = z.object({
  first_name: z.string()
    .min(1, 'First name cannot be empty')
    .max(50, 'First name must be less than 50 characters')
    .trim()
    .optional(),
  last_name: z.string()
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name must be less than 50 characters')
    .trim()
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim()
    .optional(),
  is_active: z.boolean().optional()
});

export const UserParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID format')
});

export const UserQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).default('10'),
  sort_by: z.enum(['first_name', 'last_name', 'email', 'created_at', 'updated_at'])
    .default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  q: z.string().trim().optional()
}).refine((data) => data.page > 0, {
  message: 'Page must be greater than 0',
  path: ['page']
}).refine((data) => data.limit > 0 && data.limit <= 100, {
  message: 'Limit must be between 1 and 100',
  path: ['limit']
});