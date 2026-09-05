import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/auth-types'
import type { EmployeeStatistics, EmployeeStatisticsBucket, EmployeeWorkEntries } from '@/lib/employee-statistics-types'
import type { StatisticsRange } from '@/lib/statistics-types'
import { getReportTimeZone } from '@/lib/analytics-timezone'

export async function getEmployeeStatistics(scheduleId: string, employeeId: string, range: StatisticsRange, bucket: EmployeeStatisticsBucket, signal?: AbortSignal) {
  const response = await api.get<ApiResponse<EmployeeStatistics>>(
    `schedules/${scheduleId}/statistics/employees/${employeeId}`,
    { params: { startTime: range.start.toISOString(), endTime: range.end.toISOString(), bucket, reportTimeZone: getReportTimeZone() }, signal },
  )
  if (!response.data.data) throw new Error('Invalid employee statistics response')
  return response.data.data
}

export async function getEmployeeWorkEntries(scheduleId: string, employeeId: string, range: StatisticsRange, limit: number, offset: number, signal?: AbortSignal) {
  const response = await api.get<ApiResponse<EmployeeWorkEntries>>(
    `schedules/${scheduleId}/statistics/employees/${employeeId}/work-entries`,
    { params: { startTime: range.start.toISOString(), endTime: range.end.toISOString(), bucket: 'day', reportTimeZone: getReportTimeZone(), limit, offset }, signal },
  )
  if (!response.data.data) throw new Error('Invalid employee work entries response')
  return response.data.data
}
