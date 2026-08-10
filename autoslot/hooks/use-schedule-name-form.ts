'use client'

import { type ChangeEvent, type FormEvent, useCallback, useState } from 'react'
import { scheduleNameSchema } from '@/lib/validations/schedule'

type SubmitName = (name: string) => Promise<boolean>

export function useScheduleNameForm(
  initialName: string,
  onSubmit: SubmitName,
  onSuccess: () => void,
) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState<string | null>(null)

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
    setError(null)
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const result = scheduleNameSchema.safeParse(name)

      if (!result.success) {
        setError(result.error.issues[0]?.message ?? 'Проверьте название.')
        return
      }

      setError(null)
      if (await onSubmit(result.data)) {
        onSuccess()
      }
    },
    [name, onSubmit, onSuccess],
  )

  return { name, error, handleChange, handleSubmit }
}
