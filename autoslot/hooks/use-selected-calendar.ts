'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  CalendarEvent,
  CalendarRange,
  CreateEventPayload,
  SelectedSchedule,
} from '@/lib/calendar-types'
import { getRequestError } from '@/lib/request-error'
import { scheduleEventKeys } from '@/lib/schedule-event-queries'
import {
  createScheduleEvent,
  getSchedule,
  getScheduleEvents,
} from '@/lib/services/schedule-events'

const EVENTS_STALE_TIME = 30 * 1000
const EVENTS_GC_TIME = 30 * 60 * 1000

export function useSelectedCalendar(
  scheduleId: string,
  visibleRange: CalendarRange,
) {
  const queryClient = useQueryClient()
  const [schedule, setSchedule] = useState<SelectedSchedule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const eventsQuery = useQuery({
    queryKey: scheduleEventKeys.range(scheduleId, visibleRange),
    queryFn: () => getScheduleEvents(scheduleId, visibleRange),
    staleTime: EVENTS_STALE_TIME,
    gcTime: EVENTS_GC_TIME,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
  })

  useEffect(() => {
    void getSchedule(scheduleId)
      .then(setSchedule)
      .catch((error) => {
        toast.error(
          getRequestError(error, 'Не удалось загрузить календарь.'),
        )
      })
      .finally(() => setIsLoading(false))
  }, [scheduleId])

  useEffect(() => {
    if (eventsQuery.error) {
      toast.error(
        getRequestError(
          eventsQuery.error,
          'Не удалось загрузить события.',
        ),
      )
    }
  }, [eventsQuery.error])

  const events = useMemo<CalendarEvent[]>(
    () =>
      (eventsQuery.data ?? []).map((event) => ({
        id: event.id,
        title: event.title,
        isPaid: event.isPaid,
        color: event.color,
        start: new Date(event.startTime),
        end: new Date(event.endTime),
        resource: event,
      })),
    [eventsQuery.data],
  )

  const refreshEvents = eventsQuery.refetch

  const createEvent = useCallback(
    async (payload: CreateEventPayload) => {
      setIsCreating(true)

      try {
        await createScheduleEvent(scheduleId, payload)
        await queryClient.invalidateQueries({
          queryKey: scheduleEventKeys.schedule(scheduleId),
        })
        toast.success('Событие создано')
        return true
      } catch (error) {
        toast.error(
          getRequestError(error, 'Не удалось создать событие.'),
        )
        return false
      } finally {
        setIsCreating(false)
      }
    },
    [queryClient, scheduleId],
  )

  return {
    schedule,
    events,
    isLoading,
    isEventsLoading: eventsQuery.isPending,
    isEventsFetching: eventsQuery.isFetching,
    isCreating,
    refreshEvents,
    createEvent,
  }
}
