import type { CalendarRange } from '@/lib/calendar-types'

const scheduleEventsRootKey = ['schedule-events'] as const

export const scheduleEventKeys = {
  all: scheduleEventsRootKey,
  schedule: (scheduleId: string) =>
    [...scheduleEventsRootKey, scheduleId] as const,
  range: (scheduleId: string, range: CalendarRange) =>
    [
      ...scheduleEventKeys.schedule(scheduleId),
      range.start.toISOString(),
      range.end.toISOString(),
    ] as const,
}
