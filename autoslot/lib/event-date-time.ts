import { format, isValid, parse } from 'date-fns'

const DATE_TIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm"

export type EventApiTimeRange = {
  startTime: string
  endTime: string
}

export function parseLocalDateTime(value: string): Date | null {
  const date = parse(value, DATE_TIME_LOCAL_FORMAT, new Date())
  return isValid(date) ? date : null
}

export function formatLocalDateTime(value: string | Date): string | null {
  const date = value instanceof Date ? value : new Date(value)
  return isValid(date) ? format(date, DATE_TIME_LOCAL_FORMAT) : null
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

export function getResizedEventTimeRange(
  oldStart: Date,
  oldEnd: Date,
  resizeStart: string | Date,
  resizeEnd: string | Date,
  minimumDurationMinutes: number,
  direction: 'UP' | 'DOWN',
): { start: Date; end: Date } | null {
  const callbackStart = resizeStart instanceof Date
    ? new Date(resizeStart.getTime())
    : new Date(resizeStart)
  const callbackEnd = resizeEnd instanceof Date
    ? new Date(resizeEnd.getTime())
    : new Date(resizeEnd)
  const minimumDurationMs = minimumDurationMinutes * 60 * 1000

  if (
    !isValid(oldStart) ||
    !isValid(oldEnd) ||
    !isValid(callbackStart) ||
    !isValid(callbackEnd) ||
    oldEnd.getTime() <= oldStart.getTime()
  ) {
    return null
  }

  if (direction === 'DOWN') {
    if (
      callbackStart.getTime() !== oldStart.getTime() ||
      callbackEnd.getTime() - oldStart.getTime() < minimumDurationMs
    ) {
      return null
    }

    return {
      start: new Date(oldStart.getTime()),
      end: callbackEnd,
    }
  }

  if (
    callbackEnd.getTime() !== oldEnd.getTime() ||
    oldEnd.getTime() - callbackStart.getTime() < minimumDurationMs
  ) {
    return null
  }

  return {
    start: callbackStart,
    end: new Date(oldEnd.getTime()),
  }
}
