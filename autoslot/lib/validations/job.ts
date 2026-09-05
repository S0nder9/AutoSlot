import { z } from 'zod'
import { hasCentPrecision, moneySchema } from '@/lib/validations/money'

const optionalNumber = z.union([z.number(), z.null()])

export const jobFormSchema = z.object({
  name: z.string().trim().min(1, 'Укажите название работы.').max(200, 'Не более 200 символов.'),
  description: z.string().trim().max(500, 'Не более 500 символов.'),
  basePrice: moneySchema,
  estimatedHours: optionalNumber.refine(
    (value) => value === null || (value > 0 && value <= 999.99 && hasCentPrecision(value)),
    'Укажите время от 0,01 до 999,99 часа или оставьте поле пустым.',
  ),
})

export type JobFormValues = {
  name: string
  description: string
  basePrice: string
  estimatedHours: string
}
