import { format, getDay, parse, startOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import { dateFnsLocalizer, type Messages } from 'react-big-calendar'

const locales = { ru }

export const calendarLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
})

export const calendarMessages: Messages = {
  today: 'Сегодня',
  previous: 'Назад',
  next: 'Вперёд',
  month: 'Месяц',
  week: 'Неделя',
  day: 'День',
  agenda: 'Список',
  date: 'Дата',
  time: 'Время',
  event: 'Событие',
  noEventsInRange: 'Нет событий за выбранный период',
  showMore: (total) => `+ ещё ${total}`,
}
