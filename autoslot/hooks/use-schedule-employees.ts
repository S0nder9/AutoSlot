'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CanceledError } from 'axios'
import { getApiSessionVersion } from '@/lib/api'
import { toast } from 'sonner'
import { scheduleEmployeeKeys } from '@/lib/employee-queries'
import { updateEmployeeCache } from '@/lib/employee-cache'
import { employeeStatisticsKeys } from '@/lib/employee-statistics-queries'
import { reconcileCatalogMutation } from '@/lib/cache-reconciliation'
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
    onSuccess: async (employee) => {
      await reconcileCatalogMutation<Employee>(queryClient, queryKey, employee, (a, b) => formatEmployeeName(a).localeCompare(formatEmployeeName(b), 'ru'))
      toast.success('Сотрудник добавлен')
    },
    onError: (error) => {
      toast.error(getRequestError(error, 'Не удалось добавить сотрудника.'))
    },
  })

  const updateMutation = useUpdateScheduleEmployee(scheduleId)

  const deleteMutation = useMutation({
    mutationFn: (employeeId: string) =>
      deleteScheduleEmployee(scheduleId, employeeId),
    onSuccess: async (_, employeeId) => {
      await reconcileCatalogMutation<Employee>(queryClient, queryKey, employeeId, (a, b) => formatEmployeeName(a).localeCompare(formatEmployeeName(b), 'ru'))
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

  const deletePending = useRef(false)
  const deleteEmployee = useCallback(async (employeeId: string) => {
    if (deletePending.current) return false
    deletePending.current = true
    try {
      await deleteMutation.mutateAsync(employeeId)
      return true
    } catch { return false }
    finally { deletePending.current = false }
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

export function useUpdateScheduleEmployee(scheduleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: string; payload: EmployeePayload }) =>
      updateScheduleEmployee(scheduleId, employeeId, payload),
    onMutate: async ({ employeeId }) => {
      const version = getApiSessionVersion()
      await Promise.all([
        queryClient.cancelQueries({ queryKey: scheduleEmployeeKeys.schedule(scheduleId), exact: true }),
        queryClient.cancelQueries({ queryKey: [...scheduleEmployeeKeys.schedule(scheduleId), 'search'] }),
        queryClient.cancelQueries({ queryKey: scheduleEmployeeKeys.detail(scheduleId, employeeId) }),
        queryClient.cancelQueries({
          queryKey: [...employeeStatisticsKeys.employee(scheduleId, employeeId), 'analytics'],
          // Do not strand a first-load analytics query without data in a pending state.
          predicate: (query) => query.state.data !== undefined,
        }),
      ])
      if (version !== getApiSessionVersion()) throw new CanceledError('Session changed')
    },
    onSuccess: async (employee) => {
      await reconcileCatalogMutation<Employee>(queryClient, scheduleEmployeeKeys.schedule(scheduleId), employee, (a, b) => formatEmployeeName(a).localeCompare(formatEmployeeName(b), 'ru'))
      updateEmployeeCache(queryClient, scheduleId, employee)
      toast.success('Сотрудник обновлён')
    },
    onError: (error) => toast.error(getRequestError(error, 'Не удалось обновить сотрудника.')),
  })
}
