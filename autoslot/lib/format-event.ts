import { differenceInMinutes, format, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'

export function formatEventDate(value: string) {
  return format(new Date(value), 'd MMMM yyyy, HH:mm', { locale: ru })
}

export function formatEventPeriod(startValue: string, endValue: string) {
  const start = new Date(startValue)
  const end = new Date(endValue)

  if (isSameDay(start, end)) {
    const period = `${format(start, 'EEEE, d MMMM', { locale: ru })} · ${format(start, 'HH:mm')}–${format(end, 'HH:mm')}`
    return period.charAt(0).toUpperCase() + period.slice(1)
  }

  return `${format(start, 'd MMMM, HH:mm', { locale: ru })} → ${format(end, 'd MMMM, HH:mm', { locale: ru })}`
}

export function formatEventDuration(startValue: string, endValue: string) {
  const totalMinutes = differenceInMinutes(new Date(endValue), new Date(startValue))
  if (totalMinutes <= 0) return null

  const days = Math.floor(totalMinutes / (24 * 60))
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
  const minutes = totalMinutes % 60
  return [days ? `${days} д` : '', hours ? `${hours} ч` : '', minutes ? `${minutes} мин` : '']
    .filter(Boolean)
    .join(' ')
}

export function formatEventPrice(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(value)
}
