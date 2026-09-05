import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import { scheduleEmployeeKeys } from '@/lib/employee-queries'
import { employeeStatisticsKeys } from '@/lib/employee-statistics-queries'
import { formatEmployeeName, type Employee, type EmployeeSearchResult } from '@/lib/employee-types'
import type { EmployeeStatistics } from '@/lib/employee-statistics-types'

export function updateEmployeeCache(client: QueryClient, scheduleId: string, employee: Employee) {
  client.setQueryData(scheduleEmployeeKeys.detail(scheduleId, employee.id), employee)
  client.setQueryData<Employee[]>(scheduleEmployeeKeys.schedule(scheduleId), (current) =>
    current?.map((item) => item.id === employee.id ? employee : item)
      .sort((a, b) => formatEmployeeName(a).localeCompare(formatEmployeeName(b), 'ru')),
  )
  client.setQueriesData<InfiniteData<EmployeeSearchResult>>({
    queryKey: [...scheduleEmployeeKeys.schedule(scheduleId), 'search'],
  }, (current) => current && ({
    ...current,
    pages: current.pages.map((page) => ({ ...page, items: page.items.map((item) => item.id === employee.id ? employee : item) })),
  }))
  // Only the current employee metadata changes. Historical amounts and snapshots stay server-owned.
  client.setQueriesData<EmployeeStatistics>({
    queryKey: [...employeeStatisticsKeys.employee(scheduleId, employee.id), 'analytics'],
  }, (current) => current && ({ ...current, employee: {
    employeeId: employee.id,
    employeeName: formatEmployeeName(employee),
    workPercent: employee.workPercent,
    isActive: employee.isActive,
  } }))
}
