'use client'

import { CalendarClock, CircleDollarSign, Loader2, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import type { ScheduleEvent } from '@/lib/calendar-types'
import { formatEventDate, formatEventPrice } from '@/lib/format-event'

type EventDetailsDialogProps = {
  event: ScheduleEvent | null
  isLoading: boolean
  onClose: () => void
}

export function EventDetailsDialog({
  event,
  isLoading,
  onClose,
}: EventDetailsDialogProps) {
  return (
    <ScheduleDialogShell
      title={event?.title ?? 'Загрузка события'}
      description="Подробная информация о записи в календаре."
      titleId="event-details-title"
      descriptionId="event-details-description"
      disabled={false}
      onClose={onClose}
    >
      {isLoading ? (
        <div className="flex min-h-52 items-center justify-center">
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        </div>
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

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>
      ) : null}
    </ScheduleDialogShell>
  )
}
