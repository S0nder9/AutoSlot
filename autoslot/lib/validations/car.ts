import { z } from 'zod'

export const carFormSchema = z.object({ clientId: z.string().uuid('Выберите клиента.'), brand: z.string().trim().min(1, 'Укажите марку.'), model: z.string().trim(), licensePlate: z.string().trim(), vin: z.string().trim() })
export type CarFormValues = z.infer<typeof carFormSchema>
