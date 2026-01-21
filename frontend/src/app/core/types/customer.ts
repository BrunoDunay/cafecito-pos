import z from 'zod';

export const customerSchema = z.object({
  _id: z.string(),
  name: z.string(),
  phone_or_email: z.string(),
  purchases_count: z.number(),
});

export const customerArraySchema = z.array(customerSchema);

export type Customer = z.infer<typeof customerSchema>;
