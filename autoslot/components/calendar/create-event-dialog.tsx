'use client'

import { Loader2 } from 'lucide-react'
import { useEventForm } from '@/hooks/use-event-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import type { CreateEventPayload } from '@/lib/calendar-types'

type CreateEventDialogProps = {
  isPending: boolean
  onCreate: (payload: CreateEventPayload) => Promise<boolean>
  onClose: () => void
}

export function CreateEventDialog({
  isPending,
  onCreate,
  onClose,
}: CreateEventDialogProps) {
  const form = useEventForm(onCreate, onClose)

  return (
    <ScheduleDialogShell
      title="Новое событие"
      description="Заполните основные данные записи. Работы и сотрудники будут добавлены на следующем этапе."
      titleId="create-event-title"
      descriptionId="create-event-description"
      disabled={isPending}
      onClose={onClose}
    >
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
          <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            Создать
          </Button>
        </div>
      </form>
    </ScheduleDialogShell>
  )
}
