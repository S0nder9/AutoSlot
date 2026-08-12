import { isValid, parse } from 'date-fns'

const DATE_TIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm"

export type EventApiTimeRange = {
  startTime: string
  endTime: string
}

export function parseLocalDateTime(value: string): Date | null {
  const date = parse(value, DATE_TIME_LOCAL_FORMAT, new Date())
  return isValid(date) ? date : null
}

export function serializeEventTimeRange(
  start: Date,
  end: Date,
): EventApiTimeRange | null {
  if (!isValid(start) || !isValid(end) || end.getTime() <= start.getTime()) {
    return null
  }

  return {
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  }
}

export function getDraggedEventTimeRange(
  oldStart: Date,
  oldEnd: Date,
  dropStart: string | Date,
  dropEnd: string | Date,
): { start: Date; end: Date } | null {
  const nextStart = dropStart instanceof Date
    ? new Date(dropStart.getTime())
    : new Date(dropStart)
  const callbackEnd = dropEnd instanceof Date
    ? new Date(dropEnd.getTime())
    : new Date(dropEnd)

  if (
    !isValid(oldStart) ||
    !isValid(oldEnd) ||
    !isValid(nextStart) ||
    !isValid(callbackEnd) ||
    oldEnd.getTime() <= oldStart.getTime() ||
    callbackEnd.getTime() <= nextStart.getTime()
  ) {
    return null
  }

  const durationMs = oldEnd.getTime() - oldStart.getTime()
  const nextEnd = new Date(nextStart.getTime() + durationMs)

  if (
    !isValid(nextEnd) ||
    nextEnd.getTime() - nextStart.getTime() !== durationMs
  ) {
    return null
  }

  return { start: nextStart, end: nextEnd }
}
