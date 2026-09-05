import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/auth-types'
import type { Schedule } from '@/lib/schedule-types'

export async function getSchedules(signal?: AbortSignal) {
  const response = await api.get<ApiResponse<Schedule[]>>('schedules', { signal })
  return response.data.data ?? []
}

export async function createSchedule(name: string) {
  const response = await api.post<ApiResponse<Schedule>>('schedules', { name })
  return response.data.data
}

export async function updateSchedule(id: string, name: string) {
  const response = await api.patch<ApiResponse<Schedule>>(`schedules/${id}`, {
    name,
  })
  return response.data.data
}

export function deleteSchedule(id: string) {
  return api.delete(`schedules/${id}`)
}
