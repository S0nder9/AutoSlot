import { z } from 'zod'

const optionalNumber = z.union([z.number(), z.null()])

export const jobFormSchema = z.object({
  name: z.string().trim().min(1, 'Укажите название работы.'),
  description: z.string().trim(),
  basePrice: z
    .number({ error: 'Укажите корректную базовую цену.' })
    .min(0, 'Базовая цена не может быть отрицательной.'),
  estimatedHours: optionalNumber.refine(
    (value) => value === null || value >= 0,
    'Оценочное время не может быть отрицательным.',
  ),
})

export type JobFormValues = {
  name: string
  description: string
  basePrice: string
  estimatedHours: string
}
