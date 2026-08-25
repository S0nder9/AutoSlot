'use client'

import { useEffect, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { scheduleClientKeys } from '@/lib/client-queries'
import { getRequestError } from '@/lib/request-error'
import { searchScheduleClients } from '@/lib/services/clients'

export function useScheduleClientSearch(scheduleId: string, text: string, limit = 10) {
  const debouncedText = useDebouncedValue(text.trim(), 300)
  const query = useInfiniteQuery({
    queryKey: scheduleClientKeys.search(scheduleId, debouncedText, limit),
    queryFn: ({ pageParam }) => searchScheduleClients(scheduleId, debouncedText, limit, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    enabled: Boolean(scheduleId && debouncedText), staleTime: 30_000, retry: false,
  })
  useEffect(() => { if (query.error) toast.error(getRequestError(query.error, 'Не удалось выполнить поиск клиентов.')) }, [query.error])
  const clients = useMemo(() => query.data?.pages.flatMap(({ items }) => items).filter((item, index, all) => all.findIndex(({ id }) => id === item.id) === index) ?? [], [query.data])
  return { clients, debouncedText, isSearching: Boolean(text.trim()) && (debouncedText !== text.trim() || (query.isFetching && !query.data)), error: query.error, hasMore: query.hasNextPage, isLoadingMore: query.isFetchingNextPage, loadMore: query.fetchNextPage }
}
