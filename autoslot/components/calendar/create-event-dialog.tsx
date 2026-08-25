'use client'

import { EventForm } from '@/components/calendar/event-form'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import { getCreateEventFormInitialValues } from '@/hooks/use-event-form'
import type { CreateEventPayload } from '@/lib/calendar-types'

type CreateEventDialogProps = {
  scheduleId: string
  isPending: boolean
  initialStart?: Date
  initialEnd?: Date
  onCreate: (payload: CreateEventPayload) => Promise<boolean>
  onClose: () => void
}

export function CreateEventDialog({
  scheduleId,
  isPending,
  initialStart,
  initialEnd,
  onCreate,
  onClose,
}: CreateEventDialogProps) {
  return (
    <ScheduleDialogShell
      title="Новое событие"
      description="Заполните основные данные записи. Работы и сотрудники будут добавлены на следующем этапе."
      titleId="create-event-title"
      descriptionId="create-event-description"
      disabled={isPending}
      onClose={onClose}
    >
      <EventForm
        scheduleId={scheduleId}
        initialValues={getCreateEventFormInitialValues(initialStart, initialEnd)}
        isPending={isPending}
        submitLabel="Создать"
        onSubmit={onCreate}
        onSuccess={onClose}
        onCancel={onClose}
      />
    </ScheduleDialogShell>
  )
}
