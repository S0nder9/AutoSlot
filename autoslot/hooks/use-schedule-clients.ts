'use client'

import { useCallback, useEffect } from 'react'
import { type InfiniteData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { scheduleClientKeys } from '@/lib/client-queries'
import type { Client, ClientPayload, ClientSearchResult } from '@/lib/client-types'
import { getRequestError } from '@/lib/request-error'
import { createScheduleClient, deleteScheduleClient, getScheduleClients, updateScheduleClient } from '@/lib/services/clients'

export function useScheduleClients(scheduleId: string) {
  const queryClient = useQueryClient()
  const queryKey = scheduleClientKeys.schedule(scheduleId)
  const query = useQuery({ queryKey, queryFn: () => getScheduleClients(scheduleId), enabled: Boolean(scheduleId), staleTime: 30_000, retry: false })

  useEffect(() => {
    if (query.error) toast.error(getRequestError(query.error, 'Не удалось загрузить клиентов.'))
  }, [query.error])

  const upsert = (client: Client) => queryClient.setQueryData<Client[]>(queryKey, (current = []) =>
    (current.some(({ id }) => id === client.id) ? current.map((item) => item.id === client.id ? client : item) : [...current, client])
      .sort((a, b) => a.name.localeCompare(b.name, 'ru')),
  )
  const createMutation = useMutation({
    mutationFn: (payload: ClientPayload) => createScheduleClient(scheduleId, payload),
    onSuccess: (client) => { upsert(client); toast.success('Клиент добавлен') },
    onError: (error) => toast.error(getRequestError(error, 'Не удалось добавить клиента.')),
  })
  const updateMutation = useMutation({
    mutationFn: ({ clientId, payload }: { clientId: string; payload: ClientPayload }) => updateScheduleClient(scheduleId, clientId, payload),
    onSuccess: (client) => { upsert(client); toast.success('Клиент обновлён') },
    onError: (error) => toast.error(getRequestError(error, 'Не удалось обновить клиента.')),
  })
  const deleteMutation = useMutation({
    mutationFn: (clientId: string) => deleteScheduleClient(scheduleId, clientId),
    onSuccess: (_, clientId) => {
      queryClient.setQueryData<Client[]>(queryKey, (current = []) => current.filter(({ id }) => id !== clientId))
      queryClient.setQueriesData<InfiniteData<ClientSearchResult>>(
        { queryKey: [...queryKey, 'search'] },
        (current) => current ? {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            items: page.items.filter(({ id }) => id !== clientId),
          })),
        } : current,
      )
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
  const deleteClient = useCallback(async (clientId: string) => {
    try { await deleteMutation.mutateAsync(clientId); return true } catch { return false }
  }, [deleteMutation])

  return { clients: query.data ?? [], isLoading: query.isPending, isFetching: query.isFetching, error: query.error, refetch: query.refetch, createClient, updateClient, deleteClient, isCreating: createMutation.isPending, isUpdating: updateMutation.isPending, isDeleting: deleteMutation.isPending }
}
