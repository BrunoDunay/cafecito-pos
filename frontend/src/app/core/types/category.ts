import z from 'zod';

export const categorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  image: z.string().optional(),
});

export const categoryArraySchema = z.array(categorySchema);

export type Category = z.infer<typeof categorySchema>;
