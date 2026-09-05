'use client'

import { useEffect, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { getRequestError } from '@/lib/request-error'
import { scheduleEventKeys } from '@/lib/schedule-event-queries'
import { searchScheduleEvents } from '@/lib/services/schedule-events'

const SEARCH_DEBOUNCE_MS = 300

export function useScheduleEventSearch(
  scheduleId: string,
  text: string,
  limit = 10,
) {
  const debouncedText = useDebouncedValue(text.trim(), SEARCH_DEBOUNCE_MS)
  const query = useInfiniteQuery({
    queryKey: scheduleEventKeys.search(scheduleId, debouncedText, limit),
    queryFn: ({ pageParam }) =>
      searchScheduleEvents(scheduleId, debouncedText, limit, pageParam),
    initialPageParam: 0,
    getNextPageParam: (page, _pages, offset) => page.hasMore && page.nextOffset !== null && page.nextOffset > offset ? page.nextOffset : undefined,
    enabled: Boolean(scheduleId && debouncedText),
    staleTime: 30 * 1000,
    retry: false,
  })

  useEffect(() => {
    if (query.error) {
      toast.error(getRequestError(query.error, 'Не удалось выполнить поиск событий.'))
    }
  }, [query.error])

  const events = useMemo(
    () => [...new Map((query.data?.pages.flatMap(({ items }) => items) ?? []).map((item) => [item.id, item])).values()],
    [query.data],
  )

  return {
    events,
    debouncedText,
    isSearching:
      Boolean(text.trim()) &&
      (debouncedText !== text.trim() || (query.isFetching && !query.data)),
    error: query.error,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    refetch: query.refetch, loadMore: () => query.fetchNextPage({ cancelRefetch: false }),
  }
}
