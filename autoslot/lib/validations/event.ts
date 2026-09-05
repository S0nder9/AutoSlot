import { z } from 'zod'

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Укажите название события.')
      .max(200, 'Название не должно превышать 200 символов.'),
    description: z.string().trim().max(1000, 'Описание слишком длинное.'),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Выберите корректный цвет.'),
    startTime: z.string().min(1, 'Укажите время начала.'),
    endTime: z.string().min(1, 'Укажите время окончания.'),
    isPaid: z.boolean(),
  })
  .refine((value) => new Date(value.endTime) > new Date(value.startTime), {
    message: 'Окончание должно быть позже начала.',
    path: ['endTime'],
  })

export type EventFormValues = z.infer<typeof eventFormSchema>
