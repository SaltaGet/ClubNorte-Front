import { z } from 'zod';

export const editProductSchema = z.object({
  category_id: z.number().min(1, 'La categoría es requerida'),
  code: z.string().min(1, 'El código es requerido').max(20, 'El código no puede exceder los 20 caracteres'),
  description: z.string().optional(),
  min_amount: z.number().min(0, 'La cantidad mínima debe ser mayor o igual a 0'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder los 100 caracteres'),
  notifier: z.boolean(),
  price: z.number().min(0.01, 'El precio debe ser mayor a 0').max(999999.99, 'El precio no puede exceder 999999.99')
});

export type EditProductFormData = z.infer<typeof editProductSchema>;