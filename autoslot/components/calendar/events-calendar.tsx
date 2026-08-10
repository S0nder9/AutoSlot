'use client'

import { Calendar, Views } from 'react-big-calendar'
import type { CalendarEvent, CalendarRange } from '@/lib/calendar-types'
import {
  calendarLocalizer,
  calendarMessages,
} from '@/lib/calendar-localizer'
import { calendarEventStyle } from '@/lib/calendar-event-style'

type EventsCalendarProps = {
  events: CalendarEvent[]
  onRangeChange: (range: Date[] | CalendarRange) => void
  onSelectEvent: (event: CalendarEvent) => void
}

export function EventsCalendar({
  events,
  onRangeChange,
  onSelectEvent,
}: EventsCalendarProps) {
  return (
    <Calendar<CalendarEvent>
      localizer={calendarLocalizer}
      culture="ru"
      events={events}
      startAccessor="start"
      endAccessor="end"
      defaultView={Views.MONTH}
      views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
      messages={calendarMessages}
      onRangeChange={(range: Date[] | CalendarRange) => onRangeChange(range)}
      onSelectEvent={onSelectEvent}
      eventPropGetter={calendarEventStyle}
      popup
      className="min-h-[680px]"
    />
  )
}
