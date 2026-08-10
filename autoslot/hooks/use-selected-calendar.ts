'use client'

import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import type {
  CalendarEvent,
  CalendarRange,
  CreateEventPayload,
  ScheduleEvent,
  SelectedSchedule,
} from '@/lib/calendar-types'
import { getRequestError } from '@/lib/request-error'
import {
  createScheduleEvent,
  getSchedule,
  getScheduleEvents,
} from '@/lib/services/schedule-events'

function getInitialRange(): CalendarRange {
  const today = new Date()
  return {
    start: startOfWeek(startOfMonth(today), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(today), { weekStartsOn: 1 }),
  }
}

function normalizeRange(range: Date[] | CalendarRange): CalendarRange {
  if (Array.isArray(range)) {
    return {
      start: range[0] ?? new Date(),
      end: endOfDay(range.at(-1) ?? range[0] ?? new Date()),
    }
  }

  return range
}

export function useSelectedCalendar(scheduleId: string) {
  const [schedule, setSchedule] = useState<SelectedSchedule | null>(null)
  const [apiEvents, setApiEvents] = useState<ScheduleEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEventsLoading, setIsEventsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const rangeRef = useRef<CalendarRange>(getInitialRange())
  const initialRequestRef = useRef(false)

  const loadEvents = useCallback(
    async (range: CalendarRange) => {
      rangeRef.current = range
      setIsEventsLoading(true)
      try {
        setApiEvents(await getScheduleEvents(scheduleId, range))
      } catch (error) {
        toast.error(getRequestError(error, 'Не удалось загрузить события.'))
      } finally {
        setIsEventsLoading(false)
      }
    },
    [scheduleId],
  )

  useEffect(() => {
    if (initialRequestRef.current) return
    initialRequestRef.current = true

    void getSchedule(scheduleId)
      .then(setSchedule)
      .catch((error) => {
        toast.error(getRequestError(error, 'Не удалось загрузить календарь.'))
      })
      .finally(() => setIsLoading(false))

    void loadEvents(rangeRef.current)
  }, [loadEvents, scheduleId])

  const events = useMemo<CalendarEvent[]>(
    () =>
      apiEvents.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.startTime),
        end: new Date(event.endTime),
        resource: event,
      })),
    [apiEvents],
  )

  const handleRangeChange = useCallback(
    (range: Date[] | CalendarRange) => {
      void loadEvents(normalizeRange(range))
    },
    [loadEvents],
  )

  const createEvent = useCallback(
    async (payload: CreateEventPayload) => {
      setIsCreating(true)
      try {
        await createScheduleEvent(scheduleId, payload)
        await loadEvents(rangeRef.current)
        toast.success('Событие создано')
        return true
      } catch (error) {
        toast.error(getRequestError(error, 'Не удалось создать событие.'))
        return false
      } finally {
        setIsCreating(false)
      }
    },
    [loadEvents, scheduleId],
  )

  return {
    schedule,
    events,
    isLoading,
    isEventsLoading,
    isCreating,
    handleRangeChange,
    createEvent,
  }
}
