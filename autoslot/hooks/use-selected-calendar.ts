'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { DragDirection } from 'react-big-calendar/lib/addons/dragAndDrop'
import type {
  CalendarEvent,
  CalendarEventSummary,
  CalendarRange,
  CreateEventPayload,
  SelectedSchedule,
  UpdateEventPayload,
} from '@/lib/calendar-types'
import { getRequestError } from '@/lib/request-error'
import type { EventApiTimeRange } from '@/lib/event-date-time'
import {
  getDraggedEventTimeRange,
  getResizedEventTimeRange,
  serializeEventTimeRange,
} from '@/lib/event-date-time'
import { CALENDAR_TIME_STEP_MINUTES } from '@/lib/calendar-navigation'
import {
  getScheduleEventRangeFromKey,
  reconcileScheduleEventRange,
  scheduleEventKeys,
} from '@/lib/schedule-event-queries'
import {
  createScheduleEvent,
  deleteScheduleEvent,
  getSchedule,
  getScheduleEvents,
  updateScheduleEvent,
  updateScheduleEventTime,
} from '@/lib/services/schedule-events'

const EVENTS_STALE_TIME = 30 * 1000
const EVENTS_GC_TIME = 30 * 60 * 1000

type UpdateEventTimeVariables = {
  eventId: string
  timeRange: EventApiTimeRange
  errorMessage: string
}

type PendingEventTimeOverride = {
  start: Date
  end: Date
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
  const updatingEventIdsRef = useRef(new Set<string>())
  const deletingEventIdsRef = useRef(new Set<string>())
  const confirmedEventTimesRef = useRef(new Map<string, EventApiTimeRange>())
  const [pendingEventIds, setPendingEventIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [updatingEventIds, setUpdatingEventIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [deletingEventIds, setDeletingEventIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [pendingEventTimeOverrides, setPendingEventTimeOverrides] = useState<
    ReadonlyMap<string, PendingEventTimeOverride>
  >(() => new Map())

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
      (eventsQuery.data ?? []).map((event) => {
        const override = pendingEventTimeOverrides.get(event.id)

        return {
          id: event.id,
          title: event.title,
          isPaid: event.isPaid,
          color: event.color,
          start: override?.start ?? new Date(event.startTime),
          end: override?.end ?? new Date(event.endTime),
          resource: event,
        }
      }),
    [eventsQuery.data, pendingEventTimeOverrides],
  )

  useEffect(() => {
    if (confirmedEventTimesRef.current.size === 0) {
      return
    }

    setPendingEventTimeOverrides((currentOverrides) => {
      let nextOverrides: Map<string, PendingEventTimeOverride> | null = null

      for (const [eventId, confirmedTime] of confirmedEventTimesRef.current) {
        const cachedEvent = eventsQuery.data?.find((event) => event.id === eventId)
        const confirmedStart = new Date(confirmedTime.startTime).getTime()
        const confirmedEnd = new Date(confirmedTime.endTime).getTime()
        const shouldBeInActiveRange =
          confirmedStart < visibleRange.end.getTime() &&
          confirmedEnd > visibleRange.start.getTime()
        const cacheMatchesServer = shouldBeInActiveRange
          ? cachedEvent !== undefined &&
            new Date(cachedEvent.startTime).getTime() === confirmedStart &&
            new Date(cachedEvent.endTime).getTime() === confirmedEnd
          : cachedEvent === undefined

        if (!cacheMatchesServer) {
          continue
        }

        nextOverrides ??= new Map(currentOverrides)
        nextOverrides.delete(eventId)
        confirmedEventTimesRef.current.delete(eventId)
      }

      return nextOverrides ?? currentOverrides
    })
  }, [eventsQuery.data, pendingEventTimeOverrides, visibleRange])

  const refreshEvents = eventsQuery.refetch

  const isEventTimePending = useCallback(
    (eventId: string) => pendingEventIdsRef.current.has(eventId),
    [],
  )

  const reconcileCachedEventRanges = useCallback(
    (serverEvent: CalendarEventSummary) => {
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
    },
    [queryClient, scheduleId],
  )

  const removeEventFromCachedRanges = useCallback(
    (eventId: string) => {
      const cachedRanges = queryClient.getQueriesData<CalendarEventSummary[]>({
        queryKey: scheduleEventKeys.schedule(scheduleId),
      })

      for (const [queryKey, cachedEvents] of cachedRanges) {
        if (!cachedEvents) {
          continue
        }

        queryClient.setQueryData<CalendarEventSummary[]>(
          queryKey,
          cachedEvents.filter((event) => event.id !== eventId),
        )
      }
    },
    [queryClient, scheduleId],
  )

  const { mutate: mutateEventTime } = useMutation({
    mutationFn: ({ eventId, timeRange }: UpdateEventTimeVariables) =>
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
    onError: (error, { eventId, errorMessage }, context) => {
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

      confirmedEventTimesRef.current.delete(eventId)
      setPendingEventTimeOverrides((currentOverrides) => {
        const nextOverrides = new Map(currentOverrides)
        nextOverrides.delete(eventId)
        return nextOverrides
      })

      toast.error(getRequestError(error, errorMessage))
    },
    onSuccess: (serverEvent, { eventId }) => {
      reconcileCachedEventRanges(serverEvent)

      confirmedEventTimesRef.current.set(eventId, {
        startTime: serverEvent.startTime,
        endTime: serverEvent.endTime,
      })
      setPendingEventTimeOverrides((currentOverrides) => {
        const nextOverrides = new Map(currentOverrides)
        nextOverrides.set(eventId, {
          start: new Date(serverEvent.startTime),
          end: new Date(serverEvent.endTime),
        })
        return nextOverrides
      })

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

  const updateEventTime = useCallback(
    (
      eventId: string,
      timeRange: EventApiTimeRange,
      override: PendingEventTimeOverride,
      errorMessage: string,
    ) => {
      if (pendingEventIdsRef.current.has(eventId)) {
        return
      }

      setPendingEventTimeOverrides((currentOverrides) => {
        const nextOverrides = new Map(currentOverrides)
        nextOverrides.set(eventId, {
          start: new Date(override.start.getTime()),
          end: new Date(override.end.getTime()),
        })
        return nextOverrides
      })
      pendingEventIdsRef.current.add(eventId)
      setPendingEventIds(new Set(pendingEventIdsRef.current))
      mutateEventTime({ eventId, timeRange, errorMessage })
    },
    [mutateEventTime],
  )

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

      if (!droppedRange || !timeRange) {
        toast.error('Не удалось перенести событие')
        return
      }

      updateEventTime(
        event.id,
        timeRange,
        droppedRange,
        'Не удалось перенести событие',
      )
    },
    [updateEventTime],
  )

  const resizeEvent = useCallback(
    (
      event: CalendarEvent,
      resizeStart: string | Date,
      resizeEnd: string | Date,
      direction: DragDirection | null,
    ) => {
      if (pendingEventIdsRef.current.has(event.id)) {
        return
      }

      const resizedRange = direction === 'DOWN' || direction === 'UP'
        ? getResizedEventTimeRange(
            event.start,
            event.end,
            resizeStart,
            resizeEnd,
            CALENDAR_TIME_STEP_MINUTES,
            direction,
          )
        : null
      const timeRange = resizedRange
        ? serializeEventTimeRange(resizedRange.start, resizedRange.end)
        : null

      if (!resizedRange || !timeRange) {
        toast.error('Не удалось изменить длительность события')
        return
      }

      updateEventTime(
        event.id,
        timeRange,
        resizedRange,
        'Не удалось изменить длительность события',
      )
    },
    [updateEventTime],
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

  const updateEvent = useCallback(
    async (eventId: string, payload: UpdateEventPayload) => {
      if (
        pendingEventIdsRef.current.has(eventId) ||
        updatingEventIdsRef.current.has(eventId)
      ) {
        return null
      }

      updatingEventIdsRef.current.add(eventId)
      setUpdatingEventIds(new Set(updatingEventIdsRef.current))

      try {
        const serverEvent = await updateScheduleEvent(
          scheduleId,
          eventId,
          payload,
        )
        const calendarSummary: CalendarEventSummary = {
          id: serverEvent.id,
          title: serverEvent.title,
          color: serverEvent.color,
          isPaid: serverEvent.isPaid,
          startTime: serverEvent.startTime,
          endTime: serverEvent.endTime,
        }

        reconcileCachedEventRanges(calendarSummary)
        void queryClient.invalidateQueries({
          queryKey: scheduleEventKeys.schedule(scheduleId),
          refetchType: 'none',
        })
        toast.success('Событие обновлено')
        return serverEvent
      } catch (error) {
        toast.error(
          getRequestError(error, 'Не удалось обновить событие.'),
        )
        return null
      } finally {
        updatingEventIdsRef.current.delete(eventId)
        setUpdatingEventIds(new Set(updatingEventIdsRef.current))
      }
    },
    [queryClient, reconcileCachedEventRanges, scheduleId],
  )

  const deleteEvent = useCallback(
    async (eventId: string) => {
      if (
        pendingEventIdsRef.current.has(eventId) ||
        updatingEventIdsRef.current.has(eventId) ||
        deletingEventIdsRef.current.has(eventId)
      ) {
        return false
      }

      deletingEventIdsRef.current.add(eventId)
      setDeletingEventIds(new Set(deletingEventIdsRef.current))

      try {
        await deleteScheduleEvent(scheduleId, eventId)
        removeEventFromCachedRanges(eventId)
        confirmedEventTimesRef.current.delete(eventId)
        setPendingEventTimeOverrides((currentOverrides) => {
          if (!currentOverrides.has(eventId)) {
            return currentOverrides
          }

          const nextOverrides = new Map(currentOverrides)
          nextOverrides.delete(eventId)
          return nextOverrides
        })
        void queryClient.invalidateQueries({
          queryKey: scheduleEventKeys.schedule(scheduleId),
          refetchType: 'none',
        })
        toast.success('Событие удалено')
        return true
      } catch (error) {
        toast.error(
          getRequestError(error, 'Не удалось удалить событие.'),
        )
        return false
      } finally {
        deletingEventIdsRef.current.delete(eventId)
        setDeletingEventIds(new Set(deletingEventIdsRef.current))
      }
    },
    [queryClient, removeEventFromCachedRanges, scheduleId],
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
    updateEvent,
    deleteEvent,
    moveEvent,
    resizeEvent,
    pendingEventIds,
    isEventTimePending,
    updatingEventIds,
    deletingEventIds,
  }
}
