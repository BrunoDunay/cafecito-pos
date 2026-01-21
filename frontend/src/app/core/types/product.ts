import z from 'zod';

export const productSchema = z.object({
  _id: z.string(),
  name: z.string(),
  price: z.number(),
  stock: z.number(),
});

export const productArraySchema = z.array(productSchema);

export type Product = z.infer<typeof productSchema>;
