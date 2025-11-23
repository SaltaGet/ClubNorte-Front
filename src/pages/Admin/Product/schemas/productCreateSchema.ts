import { z } from 'zod';

export const createProductSchema = z.object({
  category_id: z.number().min(1, 'La categoría es requerida'),
  code: z.string().min(1, 'El código es requerido'),
  description: z.string().optional(),
  min_amount: z.number().min(0, 'La cantidad mínima debe ser mayor o igual a 0'),
  name: z.string().min(1, 'El nombre es requerido'),
  notifier: z.boolean(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0')
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;