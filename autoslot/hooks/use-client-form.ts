'use client'

import { type ChangeEvent, type FormEvent, useCallback, useRef, useState } from 'react'
import type { Client, ClientPayload } from '@/lib/client-types'
import { clientFormSchema, type ClientFormValues } from '@/lib/validations/client'

type ClientFormErrors = Partial<Record<keyof ClientFormValues, string>>

export function useClientForm(client: Client | undefined, onSubmit: (payload: ClientPayload) => Promise<Client | null>, onSuccess: (client: Client) => void) {
  const [values, setValues] = useState<ClientFormValues>(() => ({ name: client?.name ?? '', phone: client?.phone ?? '' }))
  const [errors, setErrors] = useState<ClientFormErrors>({})
  const submittingRef = useRef(false)
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }, [])
  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); event.stopPropagation()
    if (submittingRef.current) return
    const parsed = clientFormSchema.safeParse(values)
    if (!parsed.success) {
      const next: ClientFormErrors = {}
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof ClientFormValues] ??= issue.message
      setErrors(next); return
    }
    submittingRef.current = true
    try {
      const saved = await onSubmit({ name: parsed.data.name, phone: parsed.data.phone || null })
      if (saved) onSuccess(saved)
    } finally { submittingRef.current = false }
  }, [onSubmit, onSuccess, values])
  return { values, errors, handleChange, handleSubmit }
}
