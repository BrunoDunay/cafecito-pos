import z from 'zod';

// Schema para cliente
export const customerSchema = z.object({
  customerId: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  purchasesCount: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const customerArraySchema = z.array(customerSchema);

export type Customer = z.infer<typeof customerSchema>;