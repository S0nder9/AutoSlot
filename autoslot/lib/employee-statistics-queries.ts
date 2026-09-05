import type { EmployeeStatisticsBucket } from '@/lib/employee-statistics-types'
import type { StatisticsRange } from '@/lib/statistics-types'
import { getReportTimeZone } from '@/lib/analytics-timezone'

export const employeeStatisticsKeys = {
  employee: (scheduleId: string, employeeId: string) =>
    ['schedule-statistics', scheduleId, 'employee', employeeId] as const,
  range: (scheduleId: string, employeeId: string, range: StatisticsRange | null, bucket: EmployeeStatisticsBucket) =>
    [...employeeStatisticsKeys.employee(scheduleId, employeeId), 'analytics', range?.start.toISOString() ?? null, range?.end.toISOString() ?? null, bucket, getReportTimeZone()] as const,
  entries: (scheduleId: string, employeeId: string, range: StatisticsRange | null, limit: number) =>
    [...employeeStatisticsKeys.employee(scheduleId, employeeId), 'work-entries', range?.start.toISOString() ?? null, range?.end.toISOString() ?? null, limit, getReportTimeZone()] as const,
}

export function employeeAnalyticsHref(scheduleId: string, employeeId: string) {
  return `/dashboard/employees/${encodeURIComponent(employeeId)}/analytics?${new URLSearchParams({ scheduleId })}`
}
