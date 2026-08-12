'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  CalendarEvent,
  CalendarEventSummary,
  CalendarRange,
  CreateEventPayload,
  SelectedSchedule,
} from '@/lib/calendar-types'
import { getRequestError } from '@/lib/request-error'
import type { EventApiTimeRange } from '@/lib/event-date-time'
import {
  getDraggedEventTimeRange,
  serializeEventTimeRange,
} from '@/lib/event-date-time'
import {
  getScheduleEventRangeFromKey,
  reconcileScheduleEventRange,
  scheduleEventKeys,
} from '@/lib/schedule-event-queries'
import {
  createScheduleEvent,
  getSchedule,
  getScheduleEvents,
  updateScheduleEventTime,
} from '@/lib/services/schedule-events'

const EVENTS_STALE_TIME = 30 * 1000
const EVENTS_GC_TIME = 30 * 60 * 1000

type MoveEventVariables = {
  eventId: string
  timeRange: EventApiTimeRange
}

export function useSelectedCalendar(
  scheduleId: string,
  visibleRange: CalendarRange,
) {
  const queryClient = useQueryClient()
  const [schedule, setSchedule] = useState<SelectedSchedule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const pendingEventIdsRef = useRef(new Set<string>())
  const [pendingEventIds, setPendingEventIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  )

  const activeEventsQueryKey = scheduleEventKeys.range(scheduleId, visibleRange)

  const eventsQuery = useQuery({
    queryKey: activeEventsQueryKey,
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

  const { mutate: mutateEventTime } = useMutation({
    mutationFn: ({ eventId, timeRange }: MoveEventVariables) =>
      updateScheduleEventTime(scheduleId, eventId, timeRange),
    onMutate: async ({ eventId, timeRange }) => {
      await queryClient.cancelQueries({
        queryKey: scheduleEventKeys.schedule(scheduleId),
      })

      const previousEvents =
        queryClient.getQueryData<CalendarEventSummary[]>(activeEventsQueryKey)

      queryClient.setQueryData<CalendarEventSummary[]>(
        activeEventsQueryKey,
        (currentEvents) =>
          currentEvents?.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  ...timeRange,
                }
              : event,
          ),
      )

      return { previousEvents, activeEventsQueryKey }
    },
    onError: (error, { eventId }, context) => {
      if (context?.previousEvents) {
        const previousEvent = context.previousEvents.find(
          (event) => event.id === eventId,
        )

        if (previousEvent) {
          queryClient.setQueryData<CalendarEventSummary[]>(
            context.activeEventsQueryKey,
            (currentEvents) =>
              currentEvents?.map((event) =>
                event.id === eventId ? previousEvent : event,
              ),
          )
        }
      }

      toast.error(getRequestError(error, 'Не удалось перенести событие'))
    },
    onSuccess: (serverEvent) => {
      const cachedRanges = queryClient.getQueriesData<CalendarEventSummary[]>({
        queryKey: scheduleEventKeys.schedule(scheduleId),
      })

      for (const [queryKey, cachedEvents] of cachedRanges) {
        const range = getScheduleEventRangeFromKey(queryKey)

        if (!range || !cachedEvents) {
          continue
        }

        queryClient.setQueryData<CalendarEventSummary[]>(
          queryKey,
          reconcileScheduleEventRange(cachedEvents, serverEvent, range),
        )
      }

      void queryClient.invalidateQueries({
        queryKey: scheduleEventKeys.schedule(scheduleId),
        refetchType: 'none',
      })
    },
    onSettled: (_data, _error, { eventId }) => {
      pendingEventIdsRef.current.delete(eventId)
      setPendingEventIds(new Set(pendingEventIdsRef.current))
    },
  })

  const moveEvent = useCallback(
    (event: CalendarEvent, dropStart: string | Date, dropEnd: string | Date) => {
      if (pendingEventIdsRef.current.has(event.id)) {
        return
      }

      const droppedRange = getDraggedEventTimeRange(
        event.start,
        event.end,
        dropStart,
        dropEnd,
      )
      const timeRange = droppedRange
        ? serializeEventTimeRange(droppedRange.start, droppedRange.end)
        : null

      if (!timeRange) {
        toast.error('Не удалось перенести событие')
        return
      }

      pendingEventIdsRef.current.add(event.id)
      setPendingEventIds(new Set(pendingEventIdsRef.current))
      mutateEventTime({ eventId: event.id, timeRange })
    },
    [mutateEventTime],
  )

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
    moveEvent,
    pendingEventIds,
  }
}
