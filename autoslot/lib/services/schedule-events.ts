import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/auth-types'
import type {
  CalendarEventSummary,
  CalendarRange,
  CreateEventPayload,
  ScheduleEvent,
  SelectedSchedule,
} from '@/lib/calendar-types'
import type { EventApiTimeRange } from '@/lib/event-date-time'
import { serializeEventTimeRange } from '@/lib/event-date-time'

export async function getSchedule(id: string) {
  const response = await api.get<ApiResponse<SelectedSchedule>>(`schedules/${id}`)
  return response.data.data
}

export async function getScheduleEvents(
  id: string,
  range: CalendarRange,
): Promise<CalendarEventSummary[]> {
  const response = await api.get<ApiResponse<CalendarEventSummary[]>>(
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
  const timeRange = serializeEventTimeRange(payload.startTime, payload.endTime)

  if (!timeRange) {
    throw new Error('Invalid event time range')
  }

  const response = await api.post<ApiResponse<ScheduleEvent>>(
    `schedules/${id}/events`,
    {
      ...payload,
      ...timeRange,
    },
  )
  return response.data.data
}

export async function updateScheduleEventTime(
  scheduleId: string,
  eventId: string,
  timeRange: EventApiTimeRange,
) {
  const response = await api.patch<ApiResponse<CalendarEventSummary>>(
    `schedules/${scheduleId}/events/${eventId}/time`,
    timeRange,
  )
  const event = response.data.data
  const confirmedTimeRange = event
    ? serializeEventTimeRange(
        new Date(event.startTime),
        new Date(event.endTime),
      )
    : null

  if (!event || !confirmedTimeRange) {
    throw new Error('Invalid event time response')
  }

  return event
}
