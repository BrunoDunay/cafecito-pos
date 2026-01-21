import z from 'zod';

export const cartItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  stock: z.number(),
});

export const cartItemArraySchema = z.array(cartItemSchema);

export type CartItem = z.infer<typeof cartItemSchema>;
