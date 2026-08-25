'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import type {
  DragDirection,
  EventInteractionArgs,
  OnDragStartArgs,
} from 'react-big-calendar/lib/addons/dragAndDrop'
import type { SlotInfo } from 'react-big-calendar'
import { CreateEventDialog } from '@/components/calendar/create-event-dialog'
import { EventDetailsDialog } from '@/components/calendar/event-details-dialog'
import { EventsCalendar } from '@/components/calendar/events-calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEventDialog } from '@/hooks/use-event-dialog'
import { useEventDetails } from '@/hooks/use-event-details'
import { useSelectedCalendar } from '@/hooks/use-selected-calendar'
import { useScheduleEventSearch } from '@/hooks/use-schedule-event-search'
import {
  CALENDAR_DAY_START_HOUR,
  CALENDAR_TIME_STEP_MINUTES,
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

type SelectedCreateRange = {
  start: Date
  end: Date
}

const eventSearchDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function formatEventSearchDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Дата не указана' : eventSearchDateFormatter.format(date)
}

export function SelectedScheduleCalendar({
  scheduleId,
  initialDate,
  initialView,
  onCalendarStateChange,
}: SelectedScheduleCalendarProps) {
  const [date, setDate] = useState(initialDate)
  const [view, setView] = useState(initialView)
  const [eventSearchText, setEventSearchText] = useState('')
  const eventSearch = useScheduleEventSearch(scheduleId, eventSearchText)
  const [selectedCreateRange, setSelectedCreateRange] =
    useState<SelectedCreateRange | null>(null)
  const visibleRange = useMemo(() => getCalendarRange(date, view), [date, view])
  const calendar = useSelectedCalendar(scheduleId, visibleRange)
  const {
    isEventTimePending,
    moveEvent,
    resizeEvent,
    pendingEventIds,
  } = calendar
  const resizeDirectionRef = useRef<DragDirection | null>(null)
  const dialog = useEventDialog()
  const openCreateDialog = dialog.open
  const closeCreateDialogState = dialog.close
  const details = useEventDetails(scheduleId)
  const openEventDetails = details.open

  const handleSearchEventSelect = useCallback((eventId: string) => {
    setEventSearchText('')
    void openEventDetails({ id: eventId })
  }, [openEventDetails])

  const openDefaultCreateDialog = useCallback(() => {
    setSelectedCreateRange(null)
    openCreateDialog()
  }, [openCreateDialog])

  const closeCreateDialog = useCallback(() => {
    setSelectedCreateRange(null)
    closeCreateDialogState()
  }, [closeCreateDialogState])

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

  const handleDragStart = useCallback(
    ({ action, direction }: OnDragStartArgs<CalendarEvent>) => {
      resizeDirectionRef.current = action === 'resize' ? direction : null
    },
    [],
  )

  const handleEventResize = useCallback(
    ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
      const direction = resizeDirectionRef.current
      resizeDirectionRef.current = null
      resizeEvent(event, start, end, direction)
    },
    [resizeEvent],
  )

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      if (isEventTimePending(event.id)) {
        toast.info('Дождитесь завершения изменения времени события.')
        return
      }

      openEventDetails(event)
    },
    [isEventTimePending, openEventDetails],
  )

  const handleSelectSlot = useCallback(
    ({ action, start, end }: SlotInfo) => {
      const hasValidDates =
        start instanceof Date &&
        end instanceof Date &&
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime())

      if (view === 'month') {
        if (action !== 'click' || !hasValidDates) return

        const rangeStart = new Date(start)
        rangeStart.setHours(CALENDAR_DAY_START_HOUR, 0, 0, 0)
        const rangeEnd = new Date(rangeStart)
        rangeEnd.setHours(rangeStart.getHours() + 1)

        setSelectedCreateRange({ start: rangeStart, end: rangeEnd })
        openCreateDialog()
        return
      }

      if (
        (view !== 'week' && view !== 'day') ||
        action !== 'select' ||
        !hasValidDates
      ) {
        return
      }

      const rangeStart = start.getTime() <= end.getTime() ? start : end
      const rangeEnd = start.getTime() <= end.getTime() ? end : start
      const minimumDurationMs = CALENDAR_TIME_STEP_MINUTES * 60 * 1000
      const isSameLocalDay =
        rangeStart.getFullYear() === rangeEnd.getFullYear() &&
        rangeStart.getMonth() === rangeEnd.getMonth() &&
        rangeStart.getDate() === rangeEnd.getDate()

      if (
        !isSameLocalDay ||
        rangeEnd.getTime() - rangeStart.getTime() < minimumDurationMs
      ) {
        return
      }

      setSelectedCreateRange({
        start: new Date(rangeStart.getTime()),
        end: new Date(rangeEnd.getTime()),
      })
      openCreateDialog()
    },
    [openCreateDialog, view],
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
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Поиск событий..."
              value={eventSearchText}
              onChange={(event) => setEventSearchText(event.target.value)}
              aria-label="Поиск событий"
            />
            {eventSearchText.trim() && (
              <div className="absolute top-full right-0 z-30 mt-2 w-full min-w-72 overflow-hidden rounded-lg border bg-background shadow-xl">
                {eventSearch.isSearching ? (
                  <div className="flex justify-center py-6"><Loader2 className="size-5 animate-spin" /></div>
                ) : eventSearch.error ? (
                  <p className="px-3 py-4 text-sm text-destructive">Не удалось выполнить поиск событий.</p>
                ) : eventSearch.events.length ? (
                  <div className="max-h-72 overflow-y-auto p-1">
                    {eventSearch.events.map((event) => (
                      <button key={event.id} type="button" className="block w-full rounded-md px-3 py-2 text-left hover:bg-muted" onClick={() => handleSearchEventSelect(event.id)}>
                        <span className="block truncate text-sm font-medium">{event.title}</span>
                        <span className="block text-xs text-muted-foreground">{formatEventSearchDate(event.startTime)}</span>
                      </button>
                    ))}
                    {eventSearch.hasMore && (
                      <Button type="button" className="mt-1 w-full" variant="ghost" disabled={eventSearch.isLoadingMore} onClick={() => void eventSearch.loadMore()}>
                        {eventSearch.isLoadingMore && <Loader2 className="animate-spin" />}
                        Показать ещё
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="px-3 py-4 text-sm text-muted-foreground">События не найдены.</p>
                )}
              </div>
            )}
          </div>
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
          <Button onClick={openDefaultCreateDialog}>
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
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onDragStart={handleDragStart}
          isEventTimeMutable={(event) => !pendingEventIds.has(event.id)}
        />
      </div>

      {dialog.isOpen && (
        <CreateEventDialog
          scheduleId={scheduleId}
          isPending={calendar.isCreating}
          initialStart={selectedCreateRange?.start}
          initialEnd={selectedCreateRange?.end}
          onCreate={calendar.createEvent}
          onClose={closeCreateDialog}
        />
      )}

      {details.isOpen && (
        <EventDetailsDialog
          scheduleId={scheduleId}
          event={details.event}
          isLoading={details.isLoading}
          isUpdating={
            details.event
              ? calendar.updatingEventIds.has(details.event.id)
              : false
          }
          isDeleting={
            details.event
              ? calendar.deletingEventIds.has(details.event.id)
              : false
          }
          isTimeMutationPending={
            details.event
              ? pendingEventIds.has(details.event.id)
              : false
          }
          onUpdate={calendar.updateEvent}
          onEventUpdated={details.replace}
          onDelete={calendar.deleteEvent}
          onClose={details.close}
        />
      )}
    </main>
  )
}
