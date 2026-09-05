'use client'

import { useEffect, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { scheduleJobKeys } from '@/lib/job-queries'
import { getRequestError } from '@/lib/request-error'
import { searchScheduleJobs } from '@/lib/services/jobs'

const SEARCH_DEBOUNCE_MS = 300

export function useScheduleJobSearch(
  scheduleId: string,
  text: string,
  limit = 10,
) {
  const debouncedText = useDebouncedValue(text.trim(), SEARCH_DEBOUNCE_MS)
  const query = useInfiniteQuery({
    queryKey: scheduleJobKeys.search(scheduleId, debouncedText, limit),
    queryFn: ({ pageParam }) =>
      searchScheduleJobs(scheduleId, debouncedText, limit, pageParam),
    initialPageParam: 0,
    getNextPageParam: (page, _pages, offset) => page.hasMore && page.nextOffset !== null && page.nextOffset > offset ? page.nextOffset : undefined,
    enabled: Boolean(scheduleId && debouncedText),
    staleTime: 30 * 1000,
    retry: false,
  })

  useEffect(() => {
    if (query.error) {
      toast.error(getRequestError(query.error, 'Не удалось выполнить поиск работ.'))
    }
  }, [query.error])

  const jobs = useMemo(
    () => [...new Map((query.data?.pages.flatMap(({ items }) => items) ?? []).map((item) => [item.id, item])).values()],
    [query.data],
  )

  return {
    jobs,
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
