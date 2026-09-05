import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/auth-types'
import type {
  Employee,
  EmployeePayload,
  EmployeeSearchResult,
} from '@/lib/employee-types'

export async function getScheduleEmployees(scheduleId: string) {
  const response = await api.get<ApiResponse<Employee[]>>(
    `schedules/${scheduleId}/employees`,
  )
  return response.data.data ?? []
}

export async function getScheduleEmployee(scheduleId: string, employeeId: string, signal?: AbortSignal) {
  const response = await api.get<ApiResponse<Employee>>(
    `schedules/${scheduleId}/employees/${employeeId}`,
    { signal },
  )
  if (!response.data.data) throw new Error('Invalid employee response')
  return response.data.data
}

export async function searchScheduleEmployees(
  scheduleId: string,
  text: string,
  limit: number,
  offset: number,
) {
  const response = await api.get<ApiResponse<EmployeeSearchResult>>(
    `schedules/${scheduleId}/employees/search`,
    { params: { text, limit, offset } },
  )
  if (!response.data.data) throw new Error('Invalid employee search response')
  return response.data.data
}

export async function createScheduleEmployee(
  scheduleId: string,
  payload: EmployeePayload,
) {
  const response = await api.post<ApiResponse<Employee>>(
    `schedules/${scheduleId}/employees`,
    payload,
  )
  if (!response.data.data) throw new Error('Invalid employee create response')
  return response.data.data
}

export async function updateScheduleEmployee(
  scheduleId: string,
  employeeId: string,
  payload: EmployeePayload,
) {
  const response = await api.patch<ApiResponse<Employee>>(
    `schedules/${scheduleId}/employees/${employeeId}`,
    payload,
  )
  if (!response.data.data) throw new Error('Invalid employee update response')
  return response.data.data
}

export async function deleteScheduleEmployee(
  scheduleId: string,
  employeeId: string,
) {
  await api.delete(`schedules/${scheduleId}/employees/${employeeId}`)
}
