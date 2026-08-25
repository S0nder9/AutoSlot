'use client'

import { useEffect, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { scheduleEmployeeKeys } from '@/lib/employee-queries'
import { getRequestError } from '@/lib/request-error'
import { searchScheduleEmployees } from '@/lib/services/employees'

const SEARCH_DEBOUNCE_MS = 300

export function useScheduleEmployeeSearch(
  scheduleId: string,
  text: string,
  limit = 10,
) {
  const debouncedText = useDebouncedValue(text.trim(), SEARCH_DEBOUNCE_MS)
  const query = useInfiniteQuery({
    queryKey: scheduleEmployeeKeys.search(scheduleId, debouncedText, limit),
    queryFn: ({ pageParam }) =>
      searchScheduleEmployees(scheduleId, debouncedText, limit, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    enabled: Boolean(scheduleId && debouncedText),
    staleTime: 30 * 1000,
    retry: false,
  })

  useEffect(() => {
    if (query.error) {
      toast.error(getRequestError(query.error, 'Не удалось выполнить поиск сотрудников.'))
    }
  }, [query.error])

  const employees = useMemo(
    () => query.data?.pages.flatMap(({ items }) => items) ?? [],
    [query.data],
  )

  return {
    employees,
    debouncedText,
    isSearching:
      Boolean(text.trim()) &&
      (debouncedText !== text.trim() || (query.isFetching && !query.data)),
    error: query.error,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: query.fetchNextPage,
  }
}
