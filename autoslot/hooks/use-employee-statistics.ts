'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { employeeStatisticsKeys } from '@/lib/employee-statistics-queries'
import { scheduleEmployeeKeys } from '@/lib/employee-queries'
import { getScheduleEmployee } from '@/lib/services/employees'
import { getEmployeeStatistics, getEmployeeWorkEntries } from '@/lib/services/employee-statistics'
import type { EmployeeStatisticsBucket } from '@/lib/employee-statistics-types'
import type { StatisticsRange } from '@/lib/statistics-types'

const LIMIT = 50
const STALE_TIME = 60_000

export function useEmployeeStatistics(scheduleId: string, employeeId: string, range: StatisticsRange | null, bucket: EmployeeStatisticsBucket) {
  const enabled = Boolean(scheduleId && employeeId && range)
  const employee = useQuery({
    queryKey: scheduleEmployeeKeys.detail(scheduleId, employeeId),
    queryFn: ({ signal }) => getScheduleEmployee(scheduleId, employeeId, signal),
    enabled: Boolean(scheduleId && employeeId),
    staleTime: STALE_TIME,
    retry: false,
  })
  const analytics = useQuery({
    queryKey: employeeStatisticsKeys.range(scheduleId, employeeId, range, bucket),
    queryFn: ({ signal }) => getEmployeeStatistics(scheduleId, employeeId, range!, bucket, signal),
    enabled,
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
    retry: false,
  })
  const history = useInfiniteQuery({
    queryKey: employeeStatisticsKeys.entries(scheduleId, employeeId, range, LIMIT),
    queryFn: ({ pageParam, signal }) => getEmployeeWorkEntries(scheduleId, employeeId, range!, LIMIT, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (last, _pages, offset) => last.hasMore && last.nextOffset !== null && last.nextOffset > offset ? last.nextOffset : undefined,
    enabled,
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
    retry: false,
  })

  // The DTO has no EventJob ID. Dedupe page offsets, not eventId/jobId:
  // identical jobs within one event are legitimate distinct entries.
  const seenOffsets = new Set<number>()
  const entries = history.data?.pages.flatMap((page, pageIndex) => {
    const offset = history.data.pageParams[pageIndex]
    if (typeof offset !== 'number') return []
    if (seenOffsets.has(offset)) return []
    seenOffsets.add(offset)
    return page.items.map((entry, index) => ({ entry, key: `${offset}:${index}` }))
  }) ?? []

  return { employee, analytics, history, entries }
}
