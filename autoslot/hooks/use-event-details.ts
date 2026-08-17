'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { CalendarEvent, ScheduleEvent } from '@/lib/calendar-types'
import { getRequestError } from '@/lib/request-error'
import { getScheduleEvent } from '@/lib/services/schedule-events'

export function useEventDetails(scheduleId: string) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [event, setEvent] = useState<ScheduleEvent | null>(null)
  const requestIdRef = useRef(0)

  const open = useCallback(
    async (calendarEvent: CalendarEvent) => {
      const requestId = ++requestIdRef.current
      setIsOpen(true)
      setIsLoading(true)
      setEvent(null)

      try {
        const details = await getScheduleEvent(scheduleId, calendarEvent.id)
        if (requestId === requestIdRef.current) setEvent(details)
      } catch (error) {
        if (requestId === requestIdRef.current) {
          toast.error(getRequestError(error, 'Не удалось загрузить событие.'))
          setIsOpen(false)
        }
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false)
      }
    },
    [scheduleId],
  )

  const close = useCallback(() => {
    requestIdRef.current += 1
    setIsOpen(false)
    setIsLoading(false)
    setEvent(null)
  }, [])

  const replace = useCallback((nextEvent: ScheduleEvent) => {
    setEvent(nextEvent)
  }, [])

  return { isOpen, isLoading, event, open, close, replace }
}
