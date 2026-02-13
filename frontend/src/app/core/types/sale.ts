import z, { nullable } from 'zod';

// Schema para item de venta
export const saleItemSchema = z.object({
  productId: z.string(),
  productNameSnapshot: z.string(),
  quantity: z.number(),
  unitPriceSnapshot: z.number(),
  lineTotal: z.number(),
});

// Schema para venta completa 
export const saleSchema = z.object({
  saleId: z.string(),
  customerId: z.string().nullable(),
  customerName: z.string().optional().nullable(), 
  customerEmail: z.string().optional().nullable(), 
  paymentMethod: z.string(),
  items: z.array(saleItemSchema),
  subtotal: z.number(),
  discountPercent: z.number(),
  discountAmount: z.number(),
  total: z.number(),
  soldBy: z.string(),
  soldByName: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type Sale = z.infer<typeof saleSchema>;