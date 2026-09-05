import { z } from 'zod'

export const employeeFormSchema = z.object({
  firstName: z.string().trim().min(1, 'Укажите имя сотрудника.').max(50, 'Не более 50 символов.'),
  middleName: z.string().trim().max(50, 'Не более 50 символов.'),
  lastName: z.string().trim().max(50, 'Не более 50 символов.'),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>
