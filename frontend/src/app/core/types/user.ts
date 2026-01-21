import z from 'zod';

export const userSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(['admin', 'seller']),
  is_active: z.boolean(),
});

export type User = z.infer<typeof userSchema>;

export type UserCredentials = {
  email: string;
  password: string;
};
