import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/auth-types'
import type { Car, CarPayload, CarSearchResult } from '@/lib/car-types'

export async function getScheduleCars(scheduleId: string) {
  const response = await api.get<ApiResponse<Car[]>>(`schedules/${scheduleId}/cars`)
  return response.data.data ?? []
}
export async function searchScheduleCars(scheduleId: string, text: string, limit: number, offset: number, clientId?: string) {
  const response = await api.get<ApiResponse<CarSearchResult>>(`schedules/${scheduleId}/cars/search`, { params: { text, limit, offset, ...(clientId ? { clientId } : {}) } })
  if (!response.data.data) throw new Error('Invalid car search response')
  return response.data.data
}
export async function createScheduleCar(scheduleId: string, payload: CarPayload) {
  const response = await api.post<ApiResponse<Car>>(`schedules/${scheduleId}/cars`, payload)
  if (!response.data.data) throw new Error('Invalid car create response')
  return response.data.data
}
export async function updateScheduleCar(scheduleId: string, carId: string, payload: CarPayload) {
  const response = await api.patch<ApiResponse<Car>>(`schedules/${scheduleId}/cars/${carId}`, payload)
  if (!response.data.data) throw new Error('Invalid car update response')
  return response.data.data
}
export async function deleteScheduleCar(scheduleId: string, carId: string) {
  await api.delete(`schedules/${scheduleId}/cars/${carId}`)
}
