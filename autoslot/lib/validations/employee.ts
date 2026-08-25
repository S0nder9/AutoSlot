import { z } from 'zod'

export const employeeFormSchema = z.object({
  firstName: z.string().trim().min(1, 'Укажите имя сотрудника.'),
  middleName: z.string().trim(),
  lastName: z.string().trim(),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>
