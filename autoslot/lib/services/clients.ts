import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/auth-types'
import type { Client, ClientPayload, ClientSearchResult } from '@/lib/client-types'

export async function getScheduleClients(scheduleId: string) {
  const response = await api.get<ApiResponse<Client[]>>(`schedules/${scheduleId}/clients`)
  return response.data.data ?? []
}

export async function searchScheduleClients(scheduleId: string, text: string, limit: number, offset: number) {
  const response = await api.get<ApiResponse<ClientSearchResult>>(
    `schedules/${scheduleId}/clients/search`,
    { params: { text, limit, offset } },
  )
  if (!response.data.data) throw new Error('Invalid client search response')
  return response.data.data
}

export async function createScheduleClient(scheduleId: string, payload: ClientPayload) {
  const response = await api.post<ApiResponse<Client>>(`schedules/${scheduleId}/clients`, payload)
  if (!response.data.data) throw new Error('Invalid client create response')
  return response.data.data
}

export async function updateScheduleClient(scheduleId: string, clientId: string, payload: ClientPayload) {
  const response = await api.patch<ApiResponse<Client>>(`schedules/${scheduleId}/clients/${clientId}`, payload)
  if (!response.data.data) throw new Error('Invalid client update response')
  return response.data.data
}

export async function deleteScheduleClient(scheduleId: string, clientId: string) {
  await api.delete(`schedules/${scheduleId}/clients/${clientId}`)
}
