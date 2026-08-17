'use client'

import { Loader2 } from 'lucide-react'
import type { EventFormValues } from '@/lib/validations/event'
import type { EventFormPayload } from '@/lib/calendar-types'
import { useEventForm } from '@/hooks/use-event-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type EventFormProps = {
  initialValues?: EventFormValues
  isPending: boolean
  submitLabel: string
  onSubmit: (payload: EventFormPayload) => Promise<boolean>
  onSuccess: () => void
  onCancel: () => void
}

export function EventForm({
  initialValues,
  isPending,
  submitLabel,
  onSubmit,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const form = useEventForm(onSubmit, onSuccess, initialValues)

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="event-title">Название</Label>
        <Input
          id="event-title"
          name="title"
          value={form.values.title}
          onChange={form.handleChange}
          aria-invalid={Boolean(form.errors.title)}
          autoFocus
        />
        {form.errors.title && (
          <p className="text-sm text-destructive">{form.errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-description">Описание</Label>
        <textarea
          id="event-description"
          name="description"
          value={form.values.description}
          onChange={form.handleChange}
          className="min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="event-start">Начало</Label>
          <Input
            id="event-start"
            name="startTime"
            type="datetime-local"
            value={form.values.startTime}
            onChange={form.handleChange}
            aria-invalid={Boolean(form.errors.startTime)}
          />
          {form.errors.startTime && (
            <p className="text-sm text-destructive">{form.errors.startTime}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-end">Окончание</Label>
          <Input
            id="event-end"
            name="endTime"
            type="datetime-local"
            value={form.values.endTime}
            onChange={form.handleChange}
            aria-invalid={Boolean(form.errors.endTime)}
          />
          {form.errors.endTime && (
            <p className="text-sm text-destructive">{form.errors.endTime}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.values.isPaid}
            onChange={form.handlePaidChange}
            className="size-4"
          />
          Оплачено
        </label>
        <div className="flex items-center gap-2">
          <Label htmlFor="event-color">Цвет</Label>
          <input
            id="event-color"
            name="color"
            type="color"
            value={form.values.color}
            onChange={form.handleChange}
            className="size-9 cursor-pointer rounded border"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
