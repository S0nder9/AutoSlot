'use client'

import { CircleCheck } from 'lucide-react'
import { Calendar, Views } from 'react-big-calendar'
import type { EventProps, SlotInfo, View } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import type {
  EventInteractionArgs,
  OnDragStartArgs,
} from 'react-big-calendar/lib/addons/dragAndDrop'
import type { CalendarEvent } from '@/lib/calendar-types'
import {
  CALENDAR_AGENDA_LENGTH,
  CALENDAR_DAY_END_HOUR,
  CALENDAR_DAY_START_HOUR,
  CALENDAR_TIME_STEP_MINUTES,
  type CalendarView,
} from '@/lib/calendar-navigation'
import {
  calendarLocalizer,
  calendarMessages,
} from '@/lib/calendar-localizer'
import { calendarEventStyle } from '@/lib/calendar-event-style'
import { cn } from '@/lib/utils'

const DragAndDropCalendar = withDragAndDrop<CalendarEvent>(Calendar)

type EventsCalendarProps = {
  date: Date
  view: CalendarView
  events: CalendarEvent[]
  onNavigate: (date: Date) => void
  onView: (view: CalendarView) => void
  onSelectEvent: (event: CalendarEvent) => void
  onSelectSlot: (slotInfo: SlotInfo) => void
  onEventDrop: (args: EventInteractionArgs<CalendarEvent>) => void
  onEventResize: (args: EventInteractionArgs<CalendarEvent>) => void
  onDragStart: (args: OnDragStartArgs<CalendarEvent>) => void
  isEventTimeMutable: (event: CalendarEvent) => boolean
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
  onSelectSlot,
  onEventDrop,
  onEventResize,
  onDragStart,
  isEventTimeMutable,
}: EventsCalendarProps) {
  const minTime = new Date();
  minTime.setHours(CALENDAR_DAY_START_HOUR, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(CALENDAR_DAY_END_HOUR, 0, 0);
  return (
    <DragAndDropCalendar
      localizer={calendarLocalizer}
      culture="ru"
      events={events}
      startAccessor="start"
      endAccessor="end"
      min={minTime}
      max={maxTime}
      step={CALENDAR_TIME_STEP_MINUTES}
      length={CALENDAR_AGENDA_LENGTH}
      date={date}
      view={view}
      views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
      messages={calendarMessages}
      components={{ event: CalendarEventContent }}
      onNavigate={onNavigate}
      onView={(nextView: View) => onView(nextView as CalendarView)}
      onSelectEvent={onSelectEvent}
      onSelectSlot={onSelectSlot}
      onEventDrop={onEventDrop}
      onEventResize={onEventResize}
      onDragStart={onDragStart}
      draggableAccessor={(event) =>
        view !== Views.AGENDA && isEventTimeMutable(event)
      }
      resizable
      resizableAccessor={(event) =>
        (view === Views.WEEK || view === Views.DAY) &&
        isEventTimeMutable(event)
      }
      selectable={
        view === Views.MONTH || view === Views.WEEK || view === Views.DAY
          ? 'ignoreEvents'
          : false
      }
      eventPropGetter={calendarEventStyle}
      popup
      className={cn(
        'min-h-[720px] sm:min-h-[1000px]',
        view === Views.WEEK && 'min-w-[760px] sm:min-w-0',
      )}
    />
  )
}
