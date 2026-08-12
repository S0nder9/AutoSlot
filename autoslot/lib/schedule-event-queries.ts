import type {
  CalendarEventSummary,
  CalendarRange,
} from '@/lib/calendar-types'

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

export function getScheduleEventRangeFromKey(
  queryKey: readonly unknown[],
): CalendarRange | null {
  const startValue = queryKey[2]
  const endValue = queryKey[3]

  if (typeof startValue !== 'string' || typeof endValue !== 'string') {
    return null
  }

  const start = new Date(startValue)
  const end = new Date(endValue)

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end.getTime() <= start.getTime()
  ) {
    return null
  }

  return { start, end }
}

export function reconcileScheduleEventRange(
  events: CalendarEventSummary[],
  serverEvent: CalendarEventSummary,
  range: CalendarRange,
) {
  const eventStart = new Date(serverEvent.startTime).getTime()
  const eventEnd = new Date(serverEvent.endTime).getTime()
  const overlapsRange =
    eventStart < range.end.getTime() && eventEnd > range.start.getTime()
  const reconciledEvents = events.filter((event) => event.id !== serverEvent.id)

  if (overlapsRange) {
    reconciledEvents.push(serverEvent)
  }

  return reconciledEvents.sort(
    (left, right) =>
      new Date(left.startTime).getTime() - new Date(right.startTime).getTime(),
  )
}
