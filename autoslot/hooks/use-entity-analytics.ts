'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { entityAnalyticsKeys } from '@/lib/entity-analytics-queries'
import type { AnalyticsKind } from '@/lib/entity-analytics-types'
import { getEntityAnalytics, getEntityAnalyticsHistory } from '@/lib/services/entity-analytics'
import type { StatisticsRange } from '@/lib/statistics-types'

const LIMIT = 50
export function useEntityAnalytics<K extends AnalyticsKind>(scheduleId: string, kind: K, entityId: string, range: StatisticsRange | null, bucket: 'day' | 'month') {
  const enabled = Boolean(scheduleId && entityId && range)
  const summary = useQuery({ queryKey: entityAnalyticsKeys.summary(scheduleId, kind, entityId, range, bucket), queryFn: ({ signal }) => getEntityAnalytics(scheduleId, kind, entityId, range!, bucket, signal), enabled, staleTime: 60_000, retry: false, refetchOnWindowFocus: false })
  const history = useInfiniteQuery({ queryKey: entityAnalyticsKeys.history(scheduleId, kind, entityId, range, LIMIT), queryFn: ({ pageParam, signal }) => getEntityAnalyticsHistory(scheduleId, kind, entityId, range!, LIMIT, pageParam, signal), initialPageParam: 0, getNextPageParam: (last, _pages, offset) => last.hasMore && last.nextOffset !== null && last.nextOffset > offset ? last.nextOffset : undefined, enabled, staleTime: 60_000, retry: false, refetchOnWindowFocus: false })
  const entries = history.data?.pages.flatMap((page, pageIndex) => page.items.map((entry, index) => ({ entry, key: `${history.data.pageParams[pageIndex]}:${index}` }))) ?? []
  return { summary, history, entries }
}
