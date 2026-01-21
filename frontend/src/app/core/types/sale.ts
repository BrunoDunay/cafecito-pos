import z from 'zod';

export const saleItemSchema = z.object({
  product_id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});

export const saleSchema = z.object({
  sale_number: z.string(),
  items: z.array(saleItemSchema),
  subtotal: z.number(),
  discount_percent: z.number(),
  discount_amount: z.number(),
  total: z.number(),
  sold_by: z.string(),
  created_at: z.string(),
});

export type Sale = z.infer<typeof saleSchema>;
