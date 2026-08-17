'use client'

import { EventForm } from '@/components/calendar/event-form'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import { getCreateEventFormInitialValues } from '@/hooks/use-event-form'
import type { CreateEventPayload, EventFormPayload } from '@/lib/calendar-types'

type CreateEventDialogProps = {
  isPending: boolean
  initialStart?: Date
  initialEnd?: Date
  onCreate: (payload: CreateEventPayload) => Promise<boolean>
  onClose: () => void
}

export function CreateEventDialog({
  isPending,
  initialStart,
  initialEnd,
  onCreate,
  onClose,
}: CreateEventDialogProps) {
  const handleCreate = (payload: EventFormPayload) =>
    onCreate({ ...payload, jobs: [] })

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
        initialValues={getCreateEventFormInitialValues(initialStart, initialEnd)}
        isPending={isPending}
        submitLabel="Создать"
        onSubmit={handleCreate}
        onSuccess={onClose}
        onCancel={onClose}
      />
    </ScheduleDialogShell>
  )
}
