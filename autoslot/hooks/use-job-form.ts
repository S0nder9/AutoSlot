'use client'

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useRef,
  useState,
} from 'react'
import type { Job, JobPayload } from '@/lib/job-types'
import {
  jobFormSchema,
  type JobFormValues,
} from '@/lib/validations/job'

type JobFormErrors = Partial<Record<keyof JobFormValues, string>>

function getInitialValues(job?: Job): JobFormValues {
  return {
    name: job?.name ?? '',
    description: job?.description ?? '',
    basePrice: job ? String(job.basePrice) : '0',
    estimatedHours: job?.estimatedHours == null
      ? ''
      : String(job.estimatedHours),
  }
}

export function useJobForm(
  job: Job | undefined,
  onSubmit: (payload: JobPayload) => Promise<Job | null>,
  onSuccess: (job: Job) => void,
) {
  const [values, setValues] = useState<JobFormValues>(() => getInitialValues(job))
  const [errors, setErrors] = useState<JobFormErrors>({})
  const isSubmittingRef = useRef(false)

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target
      setValues((current) => ({ ...current, [name]: value }))
      setErrors((current) => ({ ...current, [name]: undefined }))
    },
    [],
  )

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isSubmittingRef.current) return

      const parsed = jobFormSchema.safeParse({
        name: values.name,
        description: values.description,
        basePrice: values.basePrice.trim() === ''
          ? Number.NaN
          : Number(values.basePrice),
        estimatedHours: values.estimatedHours.trim() === ''
          ? null
          : Number(values.estimatedHours),
      })

      if (!parsed.success) {
        const nextErrors: JobFormErrors = {}
        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as keyof JobFormValues
          nextErrors[field] ??= issue.message
        }
        setErrors(nextErrors)
        return
      }

      isSubmittingRef.current = true
      try {
        const savedJob = await onSubmit({
          name: parsed.data.name,
          description: parsed.data.description || null,
          basePrice: parsed.data.basePrice,
          estimatedHours: parsed.data.estimatedHours,
        })
        if (savedJob) onSuccess(savedJob)
      } finally {
        isSubmittingRef.current = false
      }
    },
    [onSubmit, onSuccess, values],
  )

  return { values, errors, handleChange, handleSubmit }
}
