import { z } from 'zod'

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Имя пользователя должно содержать не менее 3 символов.')
    .max(30, 'Имя пользователя не должно превышать 30 символов.')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Используйте только латинские буквы, цифры и символ подчёркивания.',
    ),
  password: z
    .string()
    .min(8, 'Пароль должен содержать не менее 8 символов.')
    .max(128, 'Пароль не должен превышать 128 символов.'),
})

export type RegisterPayload = z.infer<typeof registerSchema>

export const loginSchema = registerSchema

export type LoginPayload = z.infer<typeof loginSchema>
