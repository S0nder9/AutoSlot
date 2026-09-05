import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/auth-types'
import type {
  StatisticsOverview,
  StatisticsRange,
  WeeklyStatisticsDetails,
} from '@/lib/statistics-types'
import { getAnalyticsBucket, getReportTimeZone } from '@/lib/analytics-timezone'

export async function getScheduleStatistics(
  scheduleId: string,
  range: StatisticsRange,
) {
  const response = await api.get<ApiResponse<StatisticsOverview>>(
    `schedules/${scheduleId}/statistics/overview`,
    {
      params: {
        startTime: range.start.toISOString(),
        endTime: range.end.toISOString(),
        bucket: getAnalyticsBucket(range.start, range.end),
        reportTimeZone: getReportTimeZone(),
      },
    },
  )

  if (!response.data.data) {
    throw new Error('Statistics response does not contain data.')
  }

  return response.data.data
}

export async function getScheduleStatisticsDetails(
  scheduleId: string,
  range: StatisticsRange,
) {
  const response = await api.get<ApiResponse<WeeklyStatisticsDetails>>(
    `schedules/${scheduleId}/statistics/details`,
    {
      params: {
        startTime: range.start.toISOString(),
        endTime: range.end.toISOString(),
        bucket: getAnalyticsBucket(range.start, range.end),
        reportTimeZone: getReportTimeZone(),
      },
    },
  )

  if (!response.data.data) {
    throw new Error('Statistics details response does not contain data.')
  }

  return response.data.data
}
