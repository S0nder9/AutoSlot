'use client'

import { useState } from 'react'
import {
  CalendarClock,
  CircleDollarSign,
  Loader2,
  Trash2,
  Wrench,
} from 'lucide-react'
import { EventForm } from '@/components/calendar/event-form'
import { Button } from '@/components/ui/button'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import { getEventFormInitialValues } from '@/hooks/use-event-form'
import type {
  EventFormPayload,
  ScheduleEvent,
  UpdateEventPayload,
} from '@/lib/calendar-types'
import { formatEventDate, formatEventPrice } from '@/lib/format-event'

type EventDetailsDialogProps = {
  event: ScheduleEvent | null
  isLoading: boolean
  isUpdating: boolean
  isDeleting: boolean
  isTimeMutationPending: boolean
  onUpdate: (
    eventId: string,
    payload: UpdateEventPayload,
  ) => Promise<ScheduleEvent | null>
  onEventUpdated: (event: ScheduleEvent) => void
  onDelete: (eventId: string) => Promise<boolean>
  onClose: () => void
}

export function EventDetailsDialog({
  event,
  isLoading,
  isUpdating,
  isDeleting,
  isTimeMutationPending,
  onUpdate,
  onEventUpdated,
  onDelete,
  onClose,
}: EventDetailsDialogProps) {
  const [mode, setMode] = useState<'details' | 'edit' | 'delete'>('details')

  const handleUpdate = async (payload: EventFormPayload) => {
    if (!event) {
      return false
    }

    const updatedEvent = await onUpdate(event.id, {
      ...payload,
      jobs: event.jobs.map(({ jobId, employeeId, clientPrice }) => ({
        jobId,
        employeeId,
        clientPrice,
      })),
    })

    if (!updatedEvent) {
      return false
    }

    onEventUpdated(updatedEvent)
    return true
  }

  const handleDelete = async () => {
    if (!event || isTimeMutationPending) {
      return
    }

    if (await onDelete(event.id)) {
      onClose()
    }
  }

  const handleDialogClose = () => {
    if (mode === 'delete') {
      setMode('details')
      return
    }

    onClose()
  }

  const eventTitle = event?.title.trim()

  return (
    <ScheduleDialogShell
      title={
        mode === 'delete'
          ? eventTitle
            ? `Удалить событие «${eventTitle}»?`
            : 'Удалить это событие?'
          : event?.title ?? 'Загрузка события'
      }
      description={
        mode === 'delete'
          ? 'Событие будет удалено. Это действие нельзя отменить.'
          : mode === 'edit'
          ? 'Измените данные записи и сохраните результат.'
          : 'Подробная информация о записи в календаре.'
      }
      titleId="event-details-title"
      descriptionId="event-details-description"
      disabled={isUpdating || isDeleting}
      alert={mode === 'delete'}
      narrow={mode === 'delete'}
      onClose={handleDialogClose}
    >
      {isLoading ? (
        <div className="flex min-h-52 items-center justify-center">
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        </div>
      ) : event && mode === 'delete' ? (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            disabled={isDeleting}
            onClick={() => setMode('details')}
          >
            Отмена
          </Button>
          <Button
            variant="destructive"
            disabled={isDeleting || isTimeMutationPending}
            onClick={() => void handleDelete()}
          >
            {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </Button>
        </div>
      ) : event && mode === 'edit' ? (
        <EventForm
          initialValues={getEventFormInitialValues(event)}
          isPending={isUpdating}
          submitLabel="Сохранить"
          onSubmit={handleUpdate}
          onSuccess={() => setMode('details')}
          onCancel={() => setMode('details')}
        />
      ) : event ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-4">
            <CalendarClock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <dl className="grid gap-2 text-sm sm:grid-cols-[100px_1fr]">
              <dt className="text-muted-foreground">Начало</dt>
              <dd className="font-medium">{formatEventDate(event.startTime)}</dd>
              <dt className="text-muted-foreground">Окончание</dt>
              <dd className="font-medium">{formatEventDate(event.endTime)}</dd>
            </dl>
          </div>

          {event.description && (
            <div>
              <h3 className="text-sm font-semibold">Описание</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {event.description}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: event.color ?? '#3788d8' }}
              />
              Цвет события
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
              <CircleDollarSign className="size-4" />
              {event.isPaid ? 'Оплачено' : 'Не оплачено'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Wrench className="size-4" />
              <h3 className="text-sm font-semibold">Работы</h3>
            </div>
            {event.jobs?.length ? (
              <div className="mt-2 space-y-2">
                {event.jobs.map((job) => (
                  <div
                    key={`${job.jobId}-${job.employeeId}`}
                    className="rounded-lg border p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium">
                        {job.jobName ?? `Работа ${job.jobId}`}
                      </p>
                      <p className="shrink-0 font-semibold">
                        {formatEventPrice(job.clientPrice)}
                      </p>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      Сотрудник: {job.employeeName ?? job.employeeId}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Работы не добавлены.
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              variant="destructive"
              disabled={isTimeMutationPending || isUpdating || isDeleting}
              onClick={() => setMode('delete')}
            >
              <Trash2 />
              Удалить
            </Button>
            <Button
              disabled={isTimeMutationPending || isDeleting}
              onClick={() => setMode('edit')}
            >
              Редактировать
            </Button>
            <Button variant="outline" onClick={handleDialogClose}>
              Закрыть
            </Button>
          </div>
        </div>
      ) : null}
    </ScheduleDialogShell>
  )
}
