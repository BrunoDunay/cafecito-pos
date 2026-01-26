import z from 'zod';

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(['admin', 'seller']),
});

export const loginResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string().optional(),
  user: authUserSchema,
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
