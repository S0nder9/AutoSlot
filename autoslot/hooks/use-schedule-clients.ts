'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { scheduleClientKeys } from '@/lib/client-queries'
import type { Client, ClientPayload } from '@/lib/client-types'
import { reconcileCatalogMutation } from '@/lib/cache-reconciliation'
import { getRequestError } from '@/lib/request-error'
import { createScheduleClient, deleteScheduleClient, getScheduleClients, updateScheduleClient } from '@/lib/services/clients'

export function useScheduleClients(scheduleId: string) {
  const queryClient = useQueryClient()
  const queryKey = scheduleClientKeys.schedule(scheduleId)
  const query = useQuery({ queryKey, queryFn: () => getScheduleClients(scheduleId), enabled: Boolean(scheduleId), staleTime: 30_000, retry: false })

  useEffect(() => {
    if (query.error) toast.error(getRequestError(query.error, 'Не удалось загрузить клиентов.'))
  }, [query.error])

  const createMutation = useMutation({
    mutationFn: (payload: ClientPayload) => createScheduleClient(scheduleId, payload),
    onSuccess: async (client) => {
      await reconcileCatalogMutation<Client>(queryClient, queryKey, client, (a, b) => a.name.localeCompare(b.name, 'ru'))
      toast.success('Клиент добавлен') },
    onError: (error) => toast.error(getRequestError(error, 'Не удалось добавить клиента.')),
  })
  const updateMutation = useMutation({
    mutationFn: ({ clientId, payload }: { clientId: string; payload: ClientPayload }) => updateScheduleClient(scheduleId, clientId, payload),
    onSuccess: async (client) => {
      await reconcileCatalogMutation<Client>(queryClient, queryKey, client, (a, b) => a.name.localeCompare(b.name, 'ru'))
      toast.success('Клиент обновлён') },
    onError: (error) => toast.error(getRequestError(error, 'Не удалось обновить клиента.')),
  })
  const deleteMutation = useMutation({
    mutationFn: (clientId: string) => deleteScheduleClient(scheduleId, clientId),
    onSuccess: async (_, clientId) => {
      await reconcileCatalogMutation<Client>(queryClient, queryKey, clientId, (a, b) => a.name.localeCompare(b.name, 'ru'))
      toast.success('Клиент удалён')
    },
    onError: (error) => toast.error(getRequestError(error, 'Не удалось удалить клиента.')),
  })

  const createClient = useCallback(async (payload: ClientPayload) => {
    try { return await createMutation.mutateAsync(payload) } catch { return null }
  }, [createMutation])
  const updateClient = useCallback(async (clientId: string, payload: ClientPayload) => {
    try { return await updateMutation.mutateAsync({ clientId, payload }) } catch { return null }
  }, [updateMutation])
  const deletePending = useRef(false)
  const deleteClient = useCallback(async (clientId: string) => {
    if (deletePending.current) return false
    deletePending.current = true
    try {
      await deleteMutation.mutateAsync(clientId)
      return true
    } catch { return false }
    finally { deletePending.current = false }
  }, [deleteMutation])

  return { clients: query.data ?? [], isLoading: query.isPending, isFetching: query.isFetching, error: query.error, refetch: query.refetch, createClient, updateClient, deleteClient, isCreating: createMutation.isPending, isUpdating: updateMutation.isPending, isDeleting: deleteMutation.isPending }
}
