import type { EventPropGetter } from 'react-big-calendar'
import type { CalendarEvent } from '@/lib/calendar-types'

export const calendarEventStyle: EventPropGetter<CalendarEvent> = (event) => ({
  style: {
    backgroundColor: event.resource.color ?? '#3788d8',
    borderColor: event.resource.color ?? '#3788d8',
  },
})
