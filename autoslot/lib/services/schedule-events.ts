import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/auth-types'
import type {
  CalendarRange,
  CreateEventPayload,
  ScheduleEvent,
  SelectedSchedule,
} from '@/lib/calendar-types'

export async function getSchedule(id: string) {
  const response = await api.get<ApiResponse<SelectedSchedule>>(`schedules/${id}`)
  return response.data.data
}

export async function getScheduleEvents(id: string, range: CalendarRange) {
  const response = await api.get<ApiResponse<ScheduleEvent[]>>(
    `schedules/${id}/events`,
    {
      params: {
        startTime: range.start.toISOString(),
        endTime: range.end.toISOString(),
      },
    },
  )
  return response.data.data ?? []
}

export async function getScheduleEvent(scheduleId: string, eventId: string) {
  const response = await api.get<ApiResponse<ScheduleEvent>>(
    `schedules/${scheduleId}/events/${eventId}`,
  )
  return response.data.data
}

export async function createScheduleEvent(
  id: string,
  payload: CreateEventPayload,
) {
  const response = await api.post<ApiResponse<ScheduleEvent>>(
    `schedules/${id}/events`,
    payload,
  )
  return response.data.data
}
