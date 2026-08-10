import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export function formatEventDate(value: string) {
  return format(new Date(value), 'd MMMM yyyy, HH:mm', { locale: ru })
}

export function formatEventPrice(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(value)
}
