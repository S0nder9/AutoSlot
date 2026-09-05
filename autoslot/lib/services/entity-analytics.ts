import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/auth-types'
import { getReportTimeZone } from '@/lib/analytics-timezone'
import type { AnalyticsKind, AnalyticsPage, CarAnalytics, ClientAnalytics, CustomerOrder, JobAnalytics, JobEntry, PartAnalytics, PartEntry } from '@/lib/entity-analytics-types'
import type { StatisticsRange } from '@/lib/statistics-types'

type SummaryMap = { jobs: JobAnalytics; parts: PartAnalytics; clients: ClientAnalytics; cars: CarAnalytics }
type EntryMap = { jobs: JobEntry; parts: PartEntry; clients: CustomerOrder; cars: CustomerOrder }

export async function getEntityAnalytics<K extends AnalyticsKind>(scheduleId: string, kind: K, entityId: string, range: StatisticsRange, bucket: 'day' | 'month', signal?: AbortSignal) {
  const response = await api.get<ApiResponse<SummaryMap[K]>>(`schedules/${scheduleId}/statistics/${kind}/${entityId}`, { params: { startTime: range.start.toISOString(), endTime: range.end.toISOString(), bucket, reportTimeZone: getReportTimeZone() }, signal })
  if (!response.data.data) throw new Error('Invalid analytics response')
  return response.data.data
}

export async function getEntityAnalyticsHistory<K extends AnalyticsKind>(scheduleId: string, kind: K, entityId: string, range: StatisticsRange, limit: number, offset: number, signal?: AbortSignal) {
  const suffix = kind === 'jobs' || kind === 'parts' ? 'entries' : 'orders'
  const response = await api.get<ApiResponse<AnalyticsPage<EntryMap[K]>>>(`schedules/${scheduleId}/statistics/${kind}/${entityId}/${suffix}`, { params: { startTime: range.start.toISOString(), endTime: range.end.toISOString(), bucket: 'day', reportTimeZone: getReportTimeZone(), limit, offset }, signal })
  if (!response.data.data) throw new Error('Invalid analytics history response')
  return response.data.data
}
