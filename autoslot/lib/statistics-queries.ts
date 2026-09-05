import type { StatisticsRange } from '@/lib/statistics-types'
import { getAnalyticsBucket, getReportTimeZone } from '@/lib/analytics-timezone'

export const scheduleStatisticsKeys = {
  all: ['schedule-statistics'] as const,
  range: (scheduleId: string, range: StatisticsRange | null) => [
    ...scheduleStatisticsKeys.all,
    scheduleId,
    range?.start.toISOString() ?? null,
    range?.end.toISOString() ?? null,
    getReportTimeZone(),
    range ? getAnalyticsBucket(range.start, range.end) : null,
  ] as const,
  details: (scheduleId: string, range: StatisticsRange) => [
    ...scheduleStatisticsKeys.all,
    scheduleId,
    'details',
    range.start.toISOString(),
    range.end.toISOString(),
    getReportTimeZone(),
    getAnalyticsBucket(range.start, range.end),
  ] as const,
}
