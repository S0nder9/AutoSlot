import { getReportTimeZone } from '@/lib/analytics-timezone'
import type { AnalyticsKind } from '@/lib/entity-analytics-types'
import type { StatisticsRange } from '@/lib/statistics-types'

export const entityAnalyticsKeys = {
  entity: (scheduleId: string, kind: AnalyticsKind, entityId: string) => ['entity-analytics', scheduleId, kind, entityId] as const,
  summary: (scheduleId: string, kind: AnalyticsKind, entityId: string, range: StatisticsRange | null, bucket: 'day' | 'month') => [...entityAnalyticsKeys.entity(scheduleId, kind, entityId), 'summary', range?.start.toISOString() ?? null, range?.end.toISOString() ?? null, bucket, getReportTimeZone()] as const,
  history: (scheduleId: string, kind: AnalyticsKind, entityId: string, range: StatisticsRange | null, limit: number) => [...entityAnalyticsKeys.entity(scheduleId, kind, entityId), 'history', range?.start.toISOString() ?? null, range?.end.toISOString() ?? null, limit, getReportTimeZone()] as const,
}

export function entityAnalyticsHref(kind: AnalyticsKind, scheduleId: string, entityId: string) {
  return `/dashboard/${kind}/${encodeURIComponent(entityId)}/analytics?${new URLSearchParams({ scheduleId })}`
}
