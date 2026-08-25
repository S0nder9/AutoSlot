'use client'

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useRef,
  useState,
} from 'react'
import type { Employee, EmployeePayload } from '@/lib/employee-types'
import {
  employeeFormSchema,
  type EmployeeFormValues,
} from '@/lib/validations/employee'

type EmployeeFormErrors = Partial<Record<keyof EmployeeFormValues, string>>

export function useEmployeeForm(
  employee: Employee | undefined,
  onSubmit: (payload: EmployeePayload) => Promise<Employee | null>,
  onSuccess: (employee: Employee) => void,
) {
  const [values, setValues] = useState<EmployeeFormValues>(() => ({
    firstName: employee?.firstName ?? '',
    middleName: employee?.middleName ?? '',
    lastName: employee?.lastName ?? '',
  }))
  const [errors, setErrors] = useState<EmployeeFormErrors>({})
  const isSubmittingRef = useRef(false)

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }, [])

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (isSubmittingRef.current) return

    const parsed = employeeFormSchema.safeParse(values)
    if (!parsed.success) {
      const nextErrors: EmployeeFormErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof EmployeeFormValues
        nextErrors[field] ??= issue.message
      }
      setErrors(nextErrors)
      return
    }

    isSubmittingRef.current = true
    try {
      const savedEmployee = await onSubmit({
        firstName: parsed.data.firstName,
        middleName: parsed.data.middleName || null,
        lastName: parsed.data.lastName || null,
      })
      if (savedEmployee) onSuccess(savedEmployee)
    } finally {
      isSubmittingRef.current = false
    }
  }, [onSubmit, onSuccess, values])

  return { values, errors, handleChange, handleSubmit }
}
