'use client'

import { addHours } from 'date-fns'
import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useRef,
  useState,
} from 'react'
import type { EventFormPayload, ScheduleEvent } from '@/lib/calendar-types'
import {
  formatLocalDateTime,
  parseLocalDateTime,
} from '@/lib/event-date-time'
import {
  eventFormSchema,
  type EventFormValues,
} from '@/lib/validations/event'

type EventFormErrors = Partial<Record<keyof EventFormValues, string>>

export function getCreateEventFormInitialValues(
  initialStart?: Date,
  initialEnd?: Date,
): EventFormValues {
  const defaultStart = new Date()
  const defaultEnd = addHours(defaultStart, 1)
  const hasValidInitialRange =
    initialStart !== undefined &&
    initialEnd !== undefined &&
    !Number.isNaN(initialStart.getTime()) &&
    !Number.isNaN(initialEnd.getTime()) &&
    initialEnd.getTime() > initialStart.getTime()
  const start = hasValidInitialRange ? initialStart : defaultStart
  const end = hasValidInitialRange ? initialEnd : defaultEnd

  return {
    title: '',
    description: '',
    color: '#3788d8',
    startTime: formatLocalDateTime(start) ?? '',
    endTime: formatLocalDateTime(end) ?? '',
    isPaid: false,
  }
}

export function getEventFormInitialValues(event: ScheduleEvent): EventFormValues {
  return {
    title: event.title,
    description: event.description ?? '',
    color: event.color,
    startTime: formatLocalDateTime(event.startTime) ?? '',
    endTime: formatLocalDateTime(event.endTime) ?? '',
    isPaid: event.isPaid,
  }
}

export function useEventForm(
  onSubmit: (payload: EventFormPayload) => Promise<boolean>,
  onSuccess: () => void,
  initialValues?: EventFormValues,
) {
  const [values, setValues] = useState<EventFormValues>(
    () => initialValues ?? getCreateEventFormInitialValues(),
  )
  const [errors, setErrors] = useState<EventFormErrors>({})
  const isSubmittingRef = useRef(false)

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target
      setValues((current) => ({ ...current, [name]: value }))
      setErrors((current) => ({ ...current, [name]: undefined }))
    },
    [],
  )

  const handlePaidChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, isPaid: event.target.checked }))
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (isSubmittingRef.current) {
        return
      }

      const result = eventFormSchema.safeParse(values)

      if (!result.success) {
        const nextErrors: EventFormErrors = {}
        for (const issue of result.error.issues) {
          const field = issue.path[0] as keyof EventFormValues
          nextErrors[field] ??= issue.message
        }
        setErrors(nextErrors)
        return
      }

      const startTime = parseLocalDateTime(result.data.startTime)
      const endTime = parseLocalDateTime(result.data.endTime)

      if (!startTime || !endTime || endTime.getTime() <= startTime.getTime()) {
        setErrors((current) => ({
          ...current,
          endTime: 'Окончание должно быть позже начала.',
        }))
        return
      }

      const payload: EventFormPayload = {
        title: result.data.title,
        description: result.data.description,
        color: result.data.color,
        startTime,
        endTime,
        isPaid: result.data.isPaid,
      }

      isSubmittingRef.current = true

      try {
        if (await onSubmit(payload)) onSuccess()
      } finally {
        isSubmittingRef.current = false
      }
    },
    [onSubmit, onSuccess, values],
  )

  return { values, errors, handleChange, handlePaidChange, handleSubmit }
}
