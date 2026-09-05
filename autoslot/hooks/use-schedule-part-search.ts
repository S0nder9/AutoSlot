'use client'

import { useEffect, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { schedulePartKeys } from '@/lib/part-queries'
import { getRequestError } from '@/lib/request-error'
import { searchScheduleParts } from '@/lib/services/parts'

export function useSchedulePartSearch(scheduleId: string, text: string, limit = 10) {
  const normalizedText = text.trim()
  const debouncedText = useDebouncedValue(normalizedText, 300)
  const query = useInfiniteQuery({
    queryKey: schedulePartKeys.search(scheduleId, debouncedText, limit),
    queryFn: ({ pageParam }) => searchScheduleParts(scheduleId, debouncedText, limit, pageParam),
    initialPageParam: 0,
    getNextPageParam: (page, _pages, offset) => page.hasMore && page.nextOffset !== null && page.nextOffset > offset ? page.nextOffset : undefined,
    enabled: Boolean(scheduleId && debouncedText),
    staleTime: 30_000,
    retry: false,
  })

  useEffect(() => {
    if (query.error) toast.error(getRequestError(query.error, 'Не удалось выполнить поиск запчастей.'))
  }, [query.error])

  const parts = useMemo(
    () => query.data?.pages
      .flatMap(({ items }) => items)
      .filter((item, index, all) => all.findIndex(({ id }) => id === item.id) === index) ?? [],
    [query.data],
  )

  return {
    parts,
    debouncedText,
    isSearching: Boolean(normalizedText) && (debouncedText !== normalizedText || (query.isFetching && !query.data)),
    error: query.error,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    refetch: query.refetch, loadMore: () => query.fetchNextPage({ cancelRefetch: false }),
  }
}
