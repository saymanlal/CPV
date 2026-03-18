import { z } from 'zod';

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters long.')
  .max(20, 'Username must be 20 characters or fewer.')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only include letters, numbers, and underscores.');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .max(72, 'Password must be 72 characters or fewer.')
  .regex(/(?=.*[A-Za-z])(?=.*\d)/, 'Password must include at least one letter and one number.');

export const registerInputSchema = z.object({
  email: z.email('Enter a valid email address.').max(255),
  username: usernameSchema,
  password: passwordSchema,
});

export const loginInputSchema = z.object({
  email: z.email('Enter a valid email address.').max(255),
  password: z.string().min(1, 'Password is required.'),
});

export const authUserSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  username: usernameSchema,
  rating: z.number().int(),
  role: z.enum(['USER', 'ADMIN']),
  createdAt: z.string().datetime(),
});

export const authResponseSchema = z.object({
  token: z.string().min(1),
  user: authUserSchema,
});

export const meResponseSchema = z.object({
  user: authUserSchema,
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
