import { addDays, addMonths, addWeeks, addYears, differenceInCalendarDays, format, isSameDay, isSameMonth, isSameYear, startOfDay, startOfMonth, startOfWeek, startOfYear } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { StatisticsPeriod, StatisticsRange } from '@/lib/statistics-types'

export const STATISTICS_PERIOD_LABELS: Record<StatisticsPeriod, string> = {
  day: 'День', week: 'Неделя', month: 'Месяц', year: 'Год', custom: 'Произвольный',
}

export function parseStatisticsDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

export function getStatisticsRange(period: StatisticsPeriod, date: Date, customStart: string, customEnd: string): StatisticsRange | null {
  if (period === 'custom') {
    const start = parseStatisticsDate(customStart)
    const inclusiveEnd = parseStatisticsDate(customEnd)
    if (!start || !inclusiveEnd || inclusiveEnd < start || differenceInCalendarDays(inclusiveEnd, start) > 365) return null
    const end = addDays(inclusiveEnd, 1)
    // The backend limit is an elapsed TimeSpan, including DST changes.
    if (end.getTime() - start.getTime() > 366 * 86_400_000) return null
    return { start, end }
  }
  if (period === 'day') {
    const start = startOfDay(date)
    return { start, end: addDays(start, 1) }
  }
  if (period === 'month') {
    const start = startOfMonth(date)
    return { start, end: addMonths(start, 1) }
  }
  if (period === 'year') {
    const start = startOfYear(date)
    return { start, end: addYears(start, 1) }
  }
  const start = startOfWeek(date, { weekStartsOn: 1 })
  return { start, end: addWeeks(start, 1) }
}

export function formatStatisticsRange({ start, end }: StatisticsRange) {
  const lastDay = addDays(end, -1)
  if (isSameDay(start, lastDay)) return format(start, 'd MMMM yyyy', { locale: ru })
  if (isSameMonth(start, lastDay)) return `${format(start, 'd')}–${format(lastDay, 'd MMMM yyyy', { locale: ru })}`
  if (isSameYear(start, lastDay)) return `${format(start, 'd MMMM', { locale: ru })} – ${format(lastDay, 'd MMMM yyyy', { locale: ru })}`
  return `${format(start, 'd MMMM yyyy', { locale: ru })} – ${format(lastDay, 'd MMMM yyyy', { locale: ru })}`
}
