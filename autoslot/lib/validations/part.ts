import { z } from 'zod'
import { moneySchema } from '@/lib/validations/money'

export const partFormSchema = z.object({
  name: z.string().trim().min(1, 'Укажите название запчасти.').max(200, 'Название не должно превышать 200 символов.'),
  article: z.string().trim().max(100, 'Артикул не должен превышать 100 символов.'),
  description: z.string().trim().max(500, 'Описание не должно превышать 500 символов.'),
  purchasePrice: moneySchema,
  basePrice: moneySchema,
})

export type PartFormValues = {
  name: string
  article: string
  description: string
  purchasePrice: string
  basePrice: string
}
