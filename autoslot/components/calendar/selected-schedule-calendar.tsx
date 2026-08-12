'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, RefreshCw } from 'lucide-react'
import type { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop'
import { CreateEventDialog } from '@/components/calendar/create-event-dialog'
import { EventDetailsDialog } from '@/components/calendar/event-details-dialog'
import { EventsCalendar } from '@/components/calendar/events-calendar'
import { Button } from '@/components/ui/button'
import { useEventDialog } from '@/hooks/use-event-dialog'
import { useEventDetails } from '@/hooks/use-event-details'
import { useSelectedCalendar } from '@/hooks/use-selected-calendar'
import {
  getCalendarRange,
  type CalendarView,
} from '@/lib/calendar-navigation'
import type { CalendarEvent } from '@/lib/calendar-types'

type SelectedScheduleCalendarProps = {
  scheduleId: string
  initialDate: Date
  initialView: CalendarView
  onCalendarStateChange: (date: Date, view: CalendarView) => void
}

export function SelectedScheduleCalendar({
  scheduleId,
  initialDate,
  initialView,
  onCalendarStateChange,
}: SelectedScheduleCalendarProps) {
  const [date, setDate] = useState(initialDate)
  const [view, setView] = useState(initialView)
  const visibleRange = useMemo(() => getCalendarRange(date, view), [date, view])
  const calendar = useSelectedCalendar(scheduleId, visibleRange)
  const { moveEvent, pendingEventIds } = calendar
  const dialog = useEventDialog()
  const details = useEventDetails(scheduleId)

  const handleNavigate = useCallback(
    (nextDate: Date) => {
      setDate(nextDate)
      onCalendarStateChange(nextDate, view)
    },
    [onCalendarStateChange, view],
  )

  const handleViewChange = useCallback(
    (nextView: CalendarView) => {
      setView(nextView)
      onCalendarStateChange(date, nextView)
    },
    [date, onCalendarStateChange],
  )

  const handleEventDrop = useCallback(
    ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
      moveEvent(event, start, end)
    },
    [moveEvent],
  )

  if (calendar.isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="size-7 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!calendar.schedule) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <h1 className="text-2xl font-semibold">Календарь не найден</h1>
        <Button className="mt-5" variant="outline" nativeButton={false} render={<Link href="/dashboard/schedule">Вернуться к календарям</Link>} />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="outline" nativeButton={false} render={<Link href="/dashboard/schedule" aria-label="Назад к календарям"><ArrowLeft /></Link>} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {calendar.schedule.name}
            </h1>
            <p className="text-sm text-muted-foreground">Планирование записей автосервиса</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={calendar.isEventsFetching}
            onClick={() => void calendar.refreshEvents()}
          >
            <RefreshCw
              className={calendar.isEventsFetching ? 'animate-spin' : undefined}
            />
            Обновить
          </Button>
          <Button onClick={dialog.open}>
          <Plus />
          Создать событие
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border bg-background p-3 shadow-sm sm:p-5">
        {calendar.isEventsLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
            <Loader2 className="size-7 animate-spin" />
          </div>
        )}
        <EventsCalendar
          date={date}
          view={view}
          events={calendar.events}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectEvent={details.open}
          onEventDrop={handleEventDrop}
          isEventDraggable={(event) => !pendingEventIds.has(event.id)}
        />
      </div>

      {dialog.isOpen && (
        <CreateEventDialog
          isPending={calendar.isCreating}
          onCreate={calendar.createEvent}
          onClose={dialog.close}
        />
      )}

      {details.isOpen && (
        <EventDetailsDialog
          event={details.event}
          isLoading={details.isLoading}
          onClose={details.close}
        />
      )}
    </main>
  )
}
