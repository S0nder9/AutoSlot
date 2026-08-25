'use client'

import { useState } from 'react'
import {
  CalendarClock,
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Loader2,
  Package,
  Pencil,
  Trash2,
  UserRound,
  Wrench,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { EventForm } from '@/components/calendar/event-form'
import { Button } from '@/components/ui/button'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import { getEventFormInitialValues } from '@/hooks/use-event-form'
import type {
  EventFormPayload,
  ScheduleEvent,
  UpdateEventPayload,
} from '@/lib/calendar-types'
import {
  formatEventDuration,
  formatEventPeriod,
  formatEventPrice,
} from '@/lib/format-event'

type EventDetailsDialogProps = {
  scheduleId: string
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
  scheduleId,
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

    const updatedEvent = await onUpdate(event.id, payload)

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
  const isDetails = mode === 'details'
  const dialogTitle = isDetails && event ? (
    <span className="flex min-w-0 items-center gap-3">
      <span
        className="size-3 shrink-0 rounded-full"
        style={{ backgroundColor: event.color || '#3788d8' }}
        aria-hidden="true"
      />
      <span className="truncate">{event.title}</span>
    </span>
  ) : mode === 'delete' ? (
    eventTitle ? `Удалить событие «${eventTitle}»?` : 'Удалить это событие?'
  ) : event?.title ?? 'Загрузка события'

  return (
    <ScheduleDialogShell
      title={dialogTitle}
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
      wide={mode === 'edit'}
      compact={isDetails}
      descriptionHidden={isDetails}
      headerActions={isDetails && event ? <>
        <Button size="icon" variant="ghost" aria-label="Редактировать событие" title="Редактировать" disabled={isTimeMutationPending || isDeleting} onClick={() => setMode('edit')}><Pencil /></Button>
        <Button size="icon" variant="ghost" aria-label="Удалить событие" title="Удалить" disabled={isTimeMutationPending || isUpdating || isDeleting} onClick={() => setMode('delete')}><Trash2 /></Button>
      </> : undefined}
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
          scheduleId={scheduleId}
          initialValues={getEventFormInitialValues(event)}
          initialJobs={event.jobs}
          initialParts={event.parts}
          initialClientId={event.clientId}
          initialClientName={event.clientName}
          initialCarId={event.carId}
          initialCarName={event.carName}
          isPending={isUpdating}
          submitLabel="Сохранить"
          onSubmit={handleUpdate}
          onSuccess={() => setMode('details')}
          onCancel={() => setMode('details')}
        />
      ) : event ? (
        <EventDetailsContent event={event} />
      ) : null}
    </ScheduleDialogShell>
  )
}

function EventDetailsContent({ event }: { event: ScheduleEvent }) {
  const duration = formatEventDuration(event.startTime, event.endTime)
  return <div className="space-y-5">
    <DetailsRow icon={<CalendarClock />}><p className="font-medium">{formatEventPeriod(event.startTime, event.endTime)}</p>{duration && <p className="mt-0.5 text-xs text-muted-foreground">{duration}</p>}</DetailsRow>
    <DetailsRow icon={<UserRound />}><p className={event.clientName ? 'font-medium' : 'text-muted-foreground'}>{event.clientName ?? 'Клиент не указан'}</p></DetailsRow>
    <DetailsRow icon={<CarFront />}><p className={event.carName ? 'font-medium' : 'text-muted-foreground'}>{event.carName ?? 'Автомобиль не указан'}</p></DetailsRow>
    {event.description && <DetailsRow icon={<FileText />}><p className="whitespace-pre-wrap break-words text-sm">{event.description}</p></DetailsRow>}
    <DetailsRow icon={<Wrench />}>
      <h3 className="font-medium">Работы · {event.jobs.length}</h3>
      {event.jobs.length ? <div className="mt-2 max-h-56 divide-y overflow-y-auto pr-1">{event.jobs.map((job) => <div key={job.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2.5 first:pt-1"><div className="min-w-0"><p className="truncate text-sm font-medium">{job.jobName}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">Исполнитель: {job.employeeName || 'не назначен'}</p></div><p className="text-sm font-medium">{formatEventPrice(job.clientPrice)}</p></div>)}</div> : <p className="mt-1 text-sm text-muted-foreground">Работы не добавлены</p>}
    </DetailsRow>
    {event.parts.length > 0 && <DetailsRow icon={<Package />}>
      <h3 className="font-medium">Запчасти · {event.parts.length}</h3>
      <div className="mt-2 max-h-56 divide-y overflow-y-auto pr-1">{event.parts.map((part) => <div key={part.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2.5 first:pt-1"><div className="min-w-0"><p className="truncate text-sm font-medium">{part.partName}</p><p className="mt-0.5 text-xs text-muted-foreground">{part.quantity} × {formatEventPrice(part.unitPrice)}</p></div><p className="text-sm font-medium">{formatEventPrice(part.lineTotal)}</p></div>)}</div>
    </DetailsRow>}
    <div className="ml-9 border-t pt-4">
      <div className="space-y-2 text-sm"><div className="flex justify-between gap-4 text-muted-foreground"><span>Работы</span><span>{formatEventPrice(event.workTotal)}</span></div><div className="flex justify-between gap-4 text-muted-foreground"><span>Запчасти</span><span>{formatEventPrice(event.partsTotal)}</span></div><div className="flex items-end justify-between gap-4 border-t pt-2"><div><p className="font-medium">Итого</p><p className="mt-1 text-xl font-semibold">{formatEventPrice(event.totalCost)}</p></div><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${event.isPaid ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{event.isPaid ? <CheckCircle2 className="size-3.5" /> : <CircleDollarSign className="size-3.5" />}{event.isPaid ? 'Оплачено' : 'Не оплачено'}</span></div></div>
    </div>
  </div>
}

function DetailsRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 text-sm"><span className="mt-0.5 text-muted-foreground [&_svg]:size-4">{icon}</span><div className="min-w-0">{children}</div></div>
}
