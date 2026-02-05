import z from 'zod';

// Schema para usuario autenticado
export const authUserSchema = z.object({
  userId: z.string(),
  email: z.string(),
  role: z.enum(['admin', 'seller']),
});

// Schema para respuesta de login
export const loginResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string().optional(),
  user: authUserSchema,
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;