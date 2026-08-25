'use client'

import { useCallback, useEffect } from 'react'
import { type InfiniteData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { schedulePartKeys } from '@/lib/part-queries'
import type { Part, PartPayload, PartSearchResult } from '@/lib/part-types'
import { getRequestError } from '@/lib/request-error'
import { createSchedulePart, deleteSchedulePart, getScheduleParts, updateSchedulePart } from '@/lib/services/parts'

export function useScheduleParts(scheduleId: string) {
  const queryClient = useQueryClient()
  const queryKey = schedulePartKeys.schedule(scheduleId)
  const searchKey = [...queryKey, 'search'] as const
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

  const upsert = (part: Part) => queryClient.setQueryData<Part[]>(queryKey, (current = []) =>
    (current.some(({ id }) => id === part.id)
      ? current.map((item) => item.id === part.id ? part : item)
      : [...current, part])
      .sort((a, b) => a.name.localeCompare(b.name, 'ru')),
  )

  const markSearchStale = () => queryClient.invalidateQueries({ queryKey: searchKey, refetchType: 'none' })

  const createMutation = useMutation({
    mutationFn: (payload: PartPayload) => createSchedulePart(scheduleId, payload),
    onSuccess: (part) => {
      upsert(part)
      void markSearchStale()
      toast.success('Запчасть добавлена')
    },
    onError: (error) => toast.error(getRequestError(error, 'Не удалось добавить запчасть.')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ partId, payload }: { partId: string; payload: PartPayload }) => updateSchedulePart(scheduleId, partId, payload),
    onSuccess: (part) => {
      upsert(part)
      queryClient.setQueriesData<InfiniteData<PartSearchResult>>(
        { queryKey: searchKey },
        (current) => current ? {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            items: page.items.map((item) => item.id === part.id ? part : item),
          })),
        } : current,
      )
      void markSearchStale()
      toast.success('Запчасть обновлена')
    },
    onError: (error) => toast.error(getRequestError(error, 'Не удалось обновить запчасть.')),
  })

  const deleteMutation = useMutation({
    mutationFn: (partId: string) => deleteSchedulePart(scheduleId, partId),
    onSuccess: (_, partId) => {
      queryClient.setQueryData<Part[]>(queryKey, (current = []) => current.filter(({ id }) => id !== partId))
      queryClient.setQueriesData<InfiniteData<PartSearchResult>>(
        { queryKey: searchKey },
        (current) => current ? {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            items: page.items.filter(({ id }) => id !== partId),
          })),
        } : current,
      )
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
  const deletePart = useCallback(async (partId: string) => {
    try { await deleteMutation.mutateAsync(partId); return true } catch { return false }
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
