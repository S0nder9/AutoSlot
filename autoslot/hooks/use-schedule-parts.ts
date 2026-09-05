'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { schedulePartKeys } from '@/lib/part-queries'
import type { Part, PartPayload } from '@/lib/part-types'
import { reconcileCatalogMutation } from '@/lib/cache-reconciliation'
import { getRequestError } from '@/lib/request-error'
import { createSchedulePart, deleteSchedulePart, getScheduleParts, updateSchedulePart } from '@/lib/services/parts'

export function useScheduleParts(scheduleId: string) {
  const queryClient = useQueryClient()
  const queryKey = schedulePartKeys.schedule(scheduleId)
  const query = useQuery({
    queryKey,
    queryFn: () => getScheduleParts(scheduleId),
    enabled: Boolean(scheduleId),
    staleTime: 30_000,
    retry: false,
  })

  useEffect(() => {
    if (query.error) toast.error(getRequestError(query.error, 'Не удалось загрузить запчасти.'))
  }, [query.error])

  const createMutation = useMutation({
    mutationFn: (payload: PartPayload) => createSchedulePart(scheduleId, payload),
    onSuccess: async (part) => {
      await reconcileCatalogMutation<Part>(queryClient, queryKey, part, (a, b) => a.name.localeCompare(b.name, 'ru'))
      toast.success('Запчасть добавлена')
    },
    onError: (error) => toast.error(getRequestError(error, 'Не удалось добавить запчасть.')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ partId, payload }: { partId: string; payload: PartPayload }) => updateSchedulePart(scheduleId, partId, payload),
    onSuccess: async (part) => {
      await reconcileCatalogMutation<Part>(queryClient, queryKey, part, (a, b) => a.name.localeCompare(b.name, 'ru'))
      toast.success('Запчасть обновлена')
    },
    onError: (error) => toast.error(getRequestError(error, 'Не удалось обновить запчасть.')),
  })

  const deleteMutation = useMutation({
    mutationFn: (partId: string) => deleteSchedulePart(scheduleId, partId),
    onSuccess: async (_, partId) => {
      await reconcileCatalogMutation<Part>(queryClient, queryKey, partId, (a, b) => a.name.localeCompare(b.name, 'ru'))
      toast.success('Запчасть удалена')
    },
    onError: (error) => toast.error(getRequestError(error, 'Не удалось удалить запчасть.')),
  })

  const createPart = useCallback(async (payload: PartPayload) => {
    try { return await createMutation.mutateAsync(payload) } catch { return null }
  }, [createMutation])
  const updatePart = useCallback(async (partId: string, payload: PartPayload) => {
    try { return await updateMutation.mutateAsync({ partId, payload }) } catch { return null }
  }, [updateMutation])
  const deletePending = useRef(false)
  const deletePart = useCallback(async (partId: string) => {
    if (deletePending.current) return false
    deletePending.current = true
    try {
      await deleteMutation.mutateAsync(partId)
      return true
    } catch { return false }
    finally { deletePending.current = false }
  }, [deleteMutation])

  return {
    parts: query.data ?? [],
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    createPart,
    updatePart,
    deletePart,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
