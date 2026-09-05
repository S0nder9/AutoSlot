'use client'

import { useEffect, useMemo } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { scheduleCarKeys } from '@/lib/car-queries'
import { getRequestError } from '@/lib/request-error'
import { getScheduleCars, searchScheduleCars } from '@/lib/services/cars'

export function useScheduleCarSearch(scheduleId: string, text: string, clientId?: string, limit = 10) {
  const normalizedText = text.trim()
  const debouncedText = useDebouncedValue(normalizedText, 300)
  const listQuery = useQuery({
    queryKey: scheduleCarKeys.schedule(scheduleId),
    queryFn: () => getScheduleCars(scheduleId),
    enabled: Boolean(scheduleId && clientId && !normalizedText),
    staleTime: 30_000,
    retry: false,
  })
  const query = useInfiniteQuery({
    queryKey: scheduleCarKeys.search(scheduleId, debouncedText, limit, clientId),
    queryFn: ({ pageParam }) => searchScheduleCars(scheduleId, debouncedText, limit, pageParam, clientId),
    initialPageParam: 0,
    getNextPageParam: (page, _pages, offset) => page.hasMore && page.nextOffset !== null && page.nextOffset > offset ? page.nextOffset : undefined,
    enabled: Boolean(scheduleId && debouncedText), staleTime: 30_000, retry: false,
  })
  const error = normalizedText ? query.error : listQuery.error
  useEffect(() => { if (error) toast.error(getRequestError(error, 'Не удалось загрузить автомобили.')) }, [error])
  const cars = useMemo(() => {
    const items = normalizedText
      ? query.data?.pages.flatMap(({ items: pageItems }) => pageItems) ?? []
      : (listQuery.data ?? []).filter((car) => car.clientId === clientId)
    return items.filter((item, index, all) => all.findIndex(({ id }) => id === item.id) === index)
  }, [clientId, normalizedText, listQuery.data, query.data])
  return { cars, debouncedText, isSearching: Boolean(normalizedText ? debouncedText !== normalizedText || (query.isFetching && !query.data) : listQuery.isFetching), error, hasMore: Boolean(normalizedText && query.hasNextPage), isLoadingMore: query.isFetchingNextPage, refetch: normalizedText ? query.refetch : listQuery.refetch, loadMore: () => query.fetchNextPage({ cancelRefetch: false }) }
}
