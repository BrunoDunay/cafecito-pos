import z from 'zod';

// Schema para item de venta
export const saleItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  lineTotal: z.number(),
});

// Schema para venta completa
export const saleSchema = z.object({
  saleId: z.string(),
  saleNumber: z.string(),
  customerId: z.string().nullable(),
  paymentMethod: z.string(),
  items: z.array(saleItemSchema),
  subtotal: z.number(),
  discountPercent: z.number(),
  discountAmount: z.number(),
  total: z.number(),
  soldBy: z.string(),
  createdAt: z.string(),
});

export type Sale = z.infer<typeof saleSchema>;