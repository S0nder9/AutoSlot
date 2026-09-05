'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { scheduleCarKeys } from '@/lib/car-queries'
import type { Car, CarPayload } from '@/lib/car-types'
import { reconcileCatalogMutation } from '@/lib/cache-reconciliation'
import { getRequestError } from '@/lib/request-error'
import { createScheduleCar, deleteScheduleCar, getScheduleCars, updateScheduleCar } from '@/lib/services/cars'

export function useScheduleCars(scheduleId: string) {
  const queryClient = useQueryClient(); const queryKey = scheduleCarKeys.schedule(scheduleId)
  const query = useQuery({ queryKey, queryFn: () => getScheduleCars(scheduleId), enabled: Boolean(scheduleId), staleTime: 30_000, retry: false })
  useEffect(() => { if (query.error) toast.error(getRequestError(query.error, 'Не удалось загрузить автомобили.')) }, [query.error])
  const createMutation = useMutation({ mutationFn: (payload: CarPayload) => createScheduleCar(scheduleId, payload), onSuccess: async (car) => {
      await reconcileCatalogMutation<Car>(queryClient, queryKey, car, (a, b) => a.displayName.localeCompare(b.displayName, 'ru'))
      toast.success('Автомобиль добавлен') }, onError: (error) => toast.error(getRequestError(error, 'Не удалось добавить автомобиль.')) })
  const updateMutation = useMutation({ mutationFn: ({ carId, payload }: { carId: string; payload: CarPayload }) => updateScheduleCar(scheduleId, carId, payload), onSuccess: async (car) => {
      await reconcileCatalogMutation<Car>(queryClient, queryKey, car, (a, b) => a.displayName.localeCompare(b.displayName, 'ru'))
      toast.success('Автомобиль обновлён')
  }, onError: (error) => toast.error(getRequestError(error, 'Не удалось обновить автомобиль.')) })
  const deleteMutation = useMutation({ mutationFn: (carId: string) => deleteScheduleCar(scheduleId, carId), onSuccess: async (_, carId) => {
      await reconcileCatalogMutation<Car>(queryClient, queryKey, carId, (a, b) => a.displayName.localeCompare(b.displayName, 'ru'))
      toast.success('Автомобиль удалён')
  }, onError: (error) => toast.error(getRequestError(error, 'Не удалось удалить автомобиль.')) })
  const createCar = useCallback(async (payload: CarPayload) => { try { return await createMutation.mutateAsync(payload) } catch { return null } }, [createMutation])
  const updateCar = useCallback(async (id: string, payload: CarPayload) => { try { return await updateMutation.mutateAsync({ carId: id, payload }) } catch { return null } }, [updateMutation])
  const deletePending = useRef(false)
  const deleteCar = useCallback(async (id: string) => {
    if (deletePending.current) return false
    deletePending.current = true
    try {
      await deleteMutation.mutateAsync(id)
      return true
    } catch { return false }
    finally { deletePending.current = false }
  }, [deleteMutation])

  return { cars: query.data ?? [], isLoading: query.isPending, isFetching: query.isFetching, error: query.error, refetch: query.refetch, createCar, updateCar, deleteCar, isCreating: createMutation.isPending, isUpdating: updateMutation.isPending, isDeleting: deleteMutation.isPending }
}
