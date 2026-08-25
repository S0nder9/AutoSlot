'use client'

import { Loader2 } from 'lucide-react'
import type { FormEvent } from 'react'
import { useJobForm } from '@/hooks/use-job-form'
import type { Job, JobPayload } from '@/lib/job-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type JobFormProps = {
  job?: Job
  isPending: boolean
  onSubmit: (payload: JobPayload) => Promise<Job | null>
  onSuccess: (job: Job) => void
  onCancel: () => void
}

export function JobForm({
  job,
  isPending,
  onSubmit,
  onSuccess,
  onCancel,
}: JobFormProps) {
  const form = useJobForm(job, onSubmit, onSuccess)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.stopPropagation()
    void form.handleSubmit(event)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="job-name">Название *</Label>
        <Input
          id="job-name"
          name="name"
          value={form.values.name}
          onChange={form.handleChange}
          aria-invalid={Boolean(form.errors.name)}
          autoFocus
        />
        {form.errors.name && (
          <p className="text-sm text-destructive">{form.errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="job-description">Описание</Label>
        <textarea
          id="job-description"
          name="description"
          value={form.values.description}
          onChange={form.handleChange}
          className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="job-base-price">Базовая цена (₽)</Label>
          <Input
            id="job-base-price"
            name="basePrice"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={form.values.basePrice}
            onChange={form.handleChange}
            aria-invalid={Boolean(form.errors.basePrice)}
          />
          {form.errors.basePrice && (
            <p className="text-sm text-destructive">{form.errors.basePrice}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-estimated-hours">Оценочное время (часы)</Label>
          <Input
            id="job-estimated-hours"
            name="estimatedHours"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={form.values.estimatedHours}
            onChange={form.handleChange}
            aria-invalid={Boolean(form.errors.estimatedHours)}
          />
          {form.errors.estimatedHours && (
            <p className="text-sm text-destructive">
              {form.errors.estimatedHours}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          {isPending
            ? job
              ? 'Сохранение...'
              : 'Создание...'
            : job
              ? 'Сохранить'
              : 'Создать'}
        </Button>
      </div>
    </form>
  )
}
