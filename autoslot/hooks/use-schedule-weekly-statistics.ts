'use client'

import { useQuery } from '@tanstack/react-query'
import { scheduleStatisticsKeys } from '@/lib/statistics-queries'
import {
  getScheduleStatistics,
  getScheduleStatisticsDetails,
} from '@/lib/services/statistics'
import type { StatisticsRange } from '@/lib/statistics-types'

const STATISTICS_STALE_TIME = 60_000

export function useScheduleStatistics(
  scheduleId: string,
  range: StatisticsRange | null,
) {
  return useQuery({
    queryKey: scheduleStatisticsKeys.range(scheduleId, range),
    queryFn: () => getScheduleStatistics(scheduleId, range!),
    enabled: Boolean(scheduleId && range),
    staleTime: STATISTICS_STALE_TIME,
    retry: false,
  })
}

export function useScheduleStatisticsDetails(
  scheduleId: string,
  range: StatisticsRange,
) {
  return useQuery({
    queryKey: scheduleStatisticsKeys.details(scheduleId, range),
    queryFn: () => getScheduleStatisticsDetails(scheduleId, range),
    enabled: Boolean(scheduleId),
    staleTime: STATISTICS_STALE_TIME,
    retry: false,
  })
}
