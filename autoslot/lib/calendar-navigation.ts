import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import type { CalendarRange } from '@/lib/calendar-types'

export const CALENDAR_AGENDA_LENGTH = 30
export const CALENDAR_TIME_STEP_MINUTES = 15

export const calendarViews = [
  'month',
  'week',
  'day',
  'agenda',
] as const

export type CalendarView = (typeof calendarViews)[number]

export function parseCalendarDate(value: string | null): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '')

  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(0)

  date.setFullYear(year, month - 1, day)
  date.setHours(0, 0, 0, 0)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

export function formatCalendarDate(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

export function parseCalendarView(value: string | null): CalendarView {
  return calendarViews.includes(value as CalendarView)
    ? (value as CalendarView)
    : 'month'
}

export function getCalendarRange(
  date: Date,
  view: CalendarView,
): CalendarRange {
  const day = startOfDay(date)

  if (view === 'month') {
    const start = startOfWeek(startOfMonth(day), { weekStartsOn: 1 })
    const lastVisibleDay = endOfWeek(endOfMonth(day), { weekStartsOn: 1 })

    return {
      start,
      end: startOfDay(addDays(lastVisibleDay, 1)),
    }
  }

  if (view === 'week') {
    const start = startOfWeek(day, { weekStartsOn: 1 })

    return { start, end: addDays(start, 7) }
  }

  if (view === 'agenda') {
    return {
      start: day,
      end: addDays(day, CALENDAR_AGENDA_LENGTH + 1),
    }
  }

  return { start: day, end: addDays(day, 1) }
}
