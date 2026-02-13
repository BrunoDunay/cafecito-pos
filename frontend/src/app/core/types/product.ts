import z from 'zod';

export const productSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  stock: z.number(),
  isActive: z.boolean(),
  image: z.string().optional(),

  category: z
    .object({
      categoryId: z.string(),
      name: z.string(),
    })
    .nullable()
    .optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const productArraySchema = z.array(productSchema);

export type Product = z.infer<typeof productSchema>;