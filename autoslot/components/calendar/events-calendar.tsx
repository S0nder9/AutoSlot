'use client'

import { CircleCheck } from 'lucide-react'
import { Calendar, Views } from 'react-big-calendar'
import type { EventProps, View } from 'react-big-calendar'
import type { CalendarEvent } from '@/lib/calendar-types'
import {
  CALENDAR_AGENDA_LENGTH,
  type CalendarView,
} from '@/lib/calendar-navigation'
import {
  calendarLocalizer,
  calendarMessages,
} from '@/lib/calendar-localizer'
import { calendarEventStyle } from '@/lib/calendar-event-style'

type EventsCalendarProps = {
  date: Date
  view: CalendarView
  events: CalendarEvent[]
  onNavigate: (date: Date) => void
  onView: (view: CalendarView) => void
  onSelectEvent: (event: CalendarEvent) => void
}

function CalendarEventContent({ event }: EventProps<CalendarEvent>) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="truncate">{event.title}</span>
      {event.resource.isPaid && (
        <CircleCheck
          className="size-3.5 shrink-0"
          aria-label="Оплачено"
        />
      )}
    </span>
  )
}

export function EventsCalendar({
  date,
  view,
  events,
  onNavigate,
  onView,
  onSelectEvent,
}: EventsCalendarProps) {
  const minTime = new Date();
  minTime.setHours(9, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(19, 0, 0);
  return (
    <Calendar<CalendarEvent>
      localizer={calendarLocalizer}
      culture="ru"
      events={events}
      startAccessor="start"
      endAccessor="end"
      min={minTime}
      max={maxTime}
      step ={15}
      length={CALENDAR_AGENDA_LENGTH}
      date={date}
      view={view}
      views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
      messages={calendarMessages}
      components={{ event: CalendarEventContent }}
      onNavigate={onNavigate}
      onView={(nextView: View) => onView(nextView as CalendarView)}
      onSelectEvent={onSelectEvent}
      eventPropGetter={calendarEventStyle}
      popup
      className="min-h-[1000px]"
    />
  )
}
