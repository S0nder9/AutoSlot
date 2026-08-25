import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/auth-types'
import type { Part, PartPayload, PartSearchResult } from '@/lib/part-types'

export async function getScheduleParts(scheduleId: string) {
  const response = await api.get<ApiResponse<Part[]>>(
    `schedules/${scheduleId}/parts`,
  )
  return response.data.data ?? []
}

export async function searchScheduleParts(
  scheduleId: string,
  text: string,
  limit: number,
  offset: number,
) {
  const response = await api.get<ApiResponse<PartSearchResult>>(
    `schedules/${scheduleId}/parts/search`,
    { params: { text, limit, offset } },
  )
  if (!response.data.data) throw new Error('Invalid part search response')
  return response.data.data
}

export async function createSchedulePart(scheduleId: string, payload: PartPayload) {
  const response = await api.post<ApiResponse<Part>>(
    `schedules/${scheduleId}/parts`,
    payload,
  )
  if (!response.data.data) throw new Error('Invalid part create response')
  return response.data.data
}

export async function updateSchedulePart(
  scheduleId: string,
  partId: string,
  payload: PartPayload,
) {
  const response = await api.patch<ApiResponse<Part>>(
    `schedules/${scheduleId}/parts/${partId}`,
    payload,
  )
  if (!response.data.data) throw new Error('Invalid part update response')
  return response.data.data
}

export async function deleteSchedulePart(scheduleId: string, partId: string) {
  await api.delete(`schedules/${scheduleId}/parts/${partId}`)
}
