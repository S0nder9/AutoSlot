import { z } from 'zod'

export const scheduleNameSchema = z
  .string()
  .trim()
  .min(2, 'Название должно содержать не менее 2 символов.')
  .max(100, 'Название не должно превышать 100 символов.')

