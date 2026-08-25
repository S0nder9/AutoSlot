import { z } from 'zod'

export const partFormSchema = z.object({
  name: z.string().trim().min(1, 'Укажите название запчасти.').max(200, 'Название не должно превышать 200 символов.'),
  article: z.string().trim().max(100, 'Артикул не должен превышать 100 символов.'),
  description: z.string().trim().max(500, 'Описание не должно превышать 500 символов.'),
  purchasePrice: z.number({ error: 'Укажите корректную закупочную цену.' }).min(0, 'Закупочная цена не может быть отрицательной.'),
  basePrice: z.number({ error: 'Укажите корректную базовую цену.' }).min(0, 'Базовая цена не может быть отрицательной.'),
})

export type PartFormValues = {
  name: string
  article: string
  description: string
  purchasePrice: string
  basePrice: string
}
