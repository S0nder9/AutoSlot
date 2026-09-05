'use client'

import { type ChangeEvent, type FormEvent, useCallback, useRef, useState } from 'react'
import type { Part, PartPayload } from '@/lib/part-types'
import { parseDecimalInput } from '@/lib/validations/money'
import { partFormSchema, type PartFormValues } from '@/lib/validations/part'

type PartFormErrors = Partial<Record<keyof PartFormValues, string>>

export function usePartForm(
  part: Part | undefined,
  onSubmit: (payload: PartPayload) => Promise<Part | null>,
  onSuccess: (part: Part) => void,
) {
  const [values, setValues] = useState<PartFormValues>(() => ({
    name: part?.name ?? '',
    article: part?.article ?? '',
    description: part?.description ?? '',
    purchasePrice: part ? String(part.purchasePrice) : '0',
    basePrice: part ? String(part.basePrice) : '0',
  }))
  const [errors, setErrors] = useState<PartFormErrors>({})
  const submittingRef = useRef(false)

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }, [])

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current) return
    const parsed = partFormSchema.safeParse({
      ...values,
      purchasePrice: parseDecimalInput(values.purchasePrice),
      basePrice: parseDecimalInput(values.basePrice),
    })
    if (!parsed.success) {
      const nextErrors: PartFormErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof PartFormValues
        nextErrors[field] ??= issue.message
      }
      setErrors(nextErrors)
      return
    }

    submittingRef.current = true
    try {
      const saved = await onSubmit({
        name: parsed.data.name,
        article: parsed.data.article || null,
        description: parsed.data.description || null,
        purchasePrice: parsed.data.purchasePrice,
        basePrice: parsed.data.basePrice,
      })
      if (saved) onSuccess(saved)
    } finally {
      submittingRef.current = false
    }
  }, [onSubmit, onSuccess, values])

  return { values, errors, handleChange, handleSubmit }
}
