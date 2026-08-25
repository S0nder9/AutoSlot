'use client'

import { useCallback, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { scheduleEmployeeKeys } from '@/lib/employee-queries'
import { getRequestError } from '@/lib/request-error'
import {
  formatEmployeeName,
  type Employee,
  type EmployeePayload,
} from '@/lib/employee-types'
import {
  createScheduleEmployee,
  deleteScheduleEmployee,
  getScheduleEmployees,
  updateScheduleEmployee,
} from '@/lib/services/employees'

export function useScheduleEmployees(scheduleId: string) {
  const queryClient = useQueryClient()
  const queryKey = scheduleEmployeeKeys.schedule(scheduleId)
  const query = useQuery({
    queryKey,
    queryFn: () => getScheduleEmployees(scheduleId),
    enabled: Boolean(scheduleId),
    staleTime: 30 * 1000,
    retry: false,
  })

  useEffect(() => {
    if (query.error) {
      toast.error(
        getRequestError(query.error, 'Не удалось загрузить сотрудников.'),
      )
    }
  }, [query.error])

  const createMutation = useMutation({
    mutationFn: (payload: EmployeePayload) =>
      createScheduleEmployee(scheduleId, payload),
    onSuccess: (employee) => {
      queryClient.setQueryData<Employee[]>(queryKey, (current = []) =>
        [...current.filter(({ id }) => id !== employee.id), employee].sort(
          (a, b) => formatEmployeeName(a).localeCompare(formatEmployeeName(b), 'ru'),
        ),
      )
      toast.success('Сотрудник добавлен')
    },
    onError: (error) => {
      toast.error(getRequestError(error, 'Не удалось добавить сотрудника.'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: string; payload: EmployeePayload }) =>
      updateScheduleEmployee(scheduleId, employeeId, payload),
    onSuccess: (employee) => {
      queryClient.setQueryData<Employee[]>(queryKey, (current = []) =>
        (current.some(({ id }) => id === employee.id)
          ? current.map((item) => (item.id === employee.id ? employee : item))
          : [...current, employee]
        ).sort((a, b) => formatEmployeeName(a).localeCompare(formatEmployeeName(b), 'ru')),
      )
      toast.success('Сотрудник обновлён')
    },
    onError: (error) => {
      toast.error(getRequestError(error, 'Не удалось обновить сотрудника.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (employeeId: string) =>
      deleteScheduleEmployee(scheduleId, employeeId),
    onSuccess: (_, employeeId) => {
      queryClient.setQueryData<Employee[]>(queryKey, (current = []) =>
        current.filter((employee) => employee.id !== employeeId),
      )
      toast.success('Сотрудник удалён')
    },
    onError: (error) => {
      toast.error(getRequestError(error, 'Не удалось удалить сотрудника.'))
    },
  })

  const createEmployee = useCallback(async (payload: EmployeePayload) => {
    try {
      return await createMutation.mutateAsync(payload)
    } catch {
      return null
    }
  }, [createMutation])

  const updateEmployee = useCallback(async (employeeId: string, payload: EmployeePayload) => {
    try {
      return await updateMutation.mutateAsync({ employeeId, payload })
    } catch {
      return null
    }
  }, [updateMutation])

  const deleteEmployee = useCallback(async (employeeId: string) => {
    try {
      await deleteMutation.mutateAsync(employeeId)
      return true
    } catch {
      return false
    }
  }, [deleteMutation])

  return {
    employees: query.data ?? [],
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
