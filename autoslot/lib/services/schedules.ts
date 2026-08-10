import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/auth-types'
import type { Schedule } from '@/lib/schedule-types'

let schedulesRequest: Promise<Schedule[]> | null = null

export function getSchedules() {
  schedulesRequest ??= api
    .get<ApiResponse<Schedule[]>>('schedules')
    .then((response) => response.data.data ?? [])
    .finally(() => {
      schedulesRequest = null
    })

  return schedulesRequest
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
