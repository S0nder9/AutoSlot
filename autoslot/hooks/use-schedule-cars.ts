'use client'

import { useCallback, useEffect } from 'react'
import { type InfiniteData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { scheduleCarKeys } from '@/lib/car-queries'
import type { Car, CarPayload, CarSearchResult } from '@/lib/car-types'
import { getRequestError } from '@/lib/request-error'
import { createScheduleCar, deleteScheduleCar, getScheduleCars, updateScheduleCar } from '@/lib/services/cars'

export function useScheduleCars(scheduleId: string) {
  const queryClient = useQueryClient(); const queryKey = scheduleCarKeys.schedule(scheduleId)
  const query = useQuery({ queryKey, queryFn: () => getScheduleCars(scheduleId), enabled: Boolean(scheduleId), staleTime: 30_000, retry: false })
  useEffect(() => { if (query.error) toast.error(getRequestError(query.error, 'Не удалось загрузить автомобили.')) }, [query.error])
  const upsert = (car: Car) => queryClient.setQueryData<Car[]>(queryKey, (current = []) => (current.some(({ id }) => id === car.id) ? current.map((item) => item.id === car.id ? car : item) : [...current, car]).sort((a, b) => a.displayName.localeCompare(b.displayName, 'ru')))
  const createMutation = useMutation({ mutationFn: (payload: CarPayload) => createScheduleCar(scheduleId, payload), onSuccess: (car) => { upsert(car); toast.success('Автомобиль добавлен') }, onError: (error) => toast.error(getRequestError(error, 'Не удалось добавить автомобиль.')) })
  const updateMutation = useMutation({ mutationFn: ({ carId, payload }: { carId: string; payload: CarPayload }) => updateScheduleCar(scheduleId, carId, payload), onSuccess: (car) => {
    upsert(car)
    queryClient.setQueriesData<InfiniteData<CarSearchResult>>({ queryKey: [...queryKey, 'search'] }, (current) => current ? { ...current, pages: current.pages.map((page) => ({ ...page, items: page.items.map((item) => item.id === car.id ? car : item) })) } : current)
    toast.success('Автомобиль обновлён')
  }, onError: (error) => toast.error(getRequestError(error, 'Не удалось обновить автомобиль.')) })
  const deleteMutation = useMutation({ mutationFn: (carId: string) => deleteScheduleCar(scheduleId, carId), onSuccess: (_, carId) => {
    queryClient.setQueryData<Car[]>(queryKey, (current = []) => current.filter(({ id }) => id !== carId))
    queryClient.setQueriesData<InfiniteData<CarSearchResult>>({ queryKey: [...queryKey, 'search'] }, (current) => current ? { ...current, pages: current.pages.map((page) => ({ ...page, items: page.items.filter(({ id }) => id !== carId) })) } : current)
    toast.success('Автомобиль удалён')
  }, onError: (error) => toast.error(getRequestError(error, 'Не удалось удалить автомобиль.')) })
  const createCar = useCallback(async (payload: CarPayload) => { try { return await createMutation.mutateAsync(payload) } catch { return null } }, [createMutation])
  const updateCar = useCallback(async (id: string, payload: CarPayload) => { try { return await updateMutation.mutateAsync({ carId: id, payload }) } catch { return null } }, [updateMutation])
  const deleteCar = useCallback(async (id: string) => { try { await deleteMutation.mutateAsync(id); return true } catch { return false } }, [deleteMutation])
  return { cars: query.data ?? [], isLoading: query.isPending, isFetching: query.isFetching, error: query.error, refetch: query.refetch, createCar, updateCar, deleteCar, isCreating: createMutation.isPending, isUpdating: updateMutation.isPending, isDeleting: deleteMutation.isPending }
}
