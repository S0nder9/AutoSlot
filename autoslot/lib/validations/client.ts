import { z } from 'zod'

export const clientFormSchema = z.object({
  name: z.string().trim().min(1, 'Укажите имя клиента.'),
  phone: z.string().trim(),
})

export type ClientFormValues = z.infer<typeof clientFormSchema>
