'use client'

import { addHours, format } from 'date-fns'
import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useState,
} from 'react'
import type { CreateEventPayload } from '@/lib/calendar-types'
import { parseLocalDateTime } from '@/lib/event-date-time'
import {
  eventFormSchema,
  type EventFormValues,
} from '@/lib/validations/event'

type EventFormErrors = Partial<Record<keyof EventFormValues, string>>

function getInitialValues(): EventFormValues {
  const start = new Date()
  const end = addHours(start, 1)
  const dateTimeFormat = "yyyy-MM-dd'T'HH:mm"

  return {
    title: '',
    description: '',
    color: '#3788d8',
    startTime: format(start, dateTimeFormat),
    endTime: format(end, dateTimeFormat),
    isPaid: false,
  }
}

export function useEventForm(
  onCreate: (payload: CreateEventPayload) => Promise<boolean>,
  onSuccess: () => void,
) {
  const [values, setValues] = useState(getInitialValues)
  const [errors, setErrors] = useState<EventFormErrors>({})

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

      const payload: CreateEventPayload = {
        title: result.data.title,
        description: result.data.description,
        color: result.data.color,
        startTime,
        endTime,
        isPaid: result.data.isPaid,
        jobs: [],
      }

      if (await onCreate(payload)) onSuccess()
    },
    [onCreate, onSuccess, values],
  )

  return { values, errors, handleChange, handlePaidChange, handleSubmit }
}
