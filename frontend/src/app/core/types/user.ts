import z from 'zod';

// Schema para usuario
export const userSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(['admin', 'seller']),
  isActive: z.boolean(),
});

// Credenciales para login
export type UserCredentials = {
  email: string;
  password: string;
};

export type User = z.infer<typeof userSchema>;