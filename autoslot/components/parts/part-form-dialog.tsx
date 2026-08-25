'use client'

import { createPortal } from 'react-dom'
import { PartForm } from '@/components/parts/part-form'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import { useScheduleParts } from '@/hooks/use-schedule-parts'
import type { Part, PartPayload } from '@/lib/part-types'

type Props = {
  scheduleId: string
  part?: Part
  onClose: () => void
  onSaved?: (part: Part) => void
}

export function PartFormDialog({ scheduleId, part, onClose, onSaved }: Props) {
  const parts = useScheduleParts(scheduleId)
  const isPending = part ? parts.isUpdating : parts.isCreating
  const submit = (payload: PartPayload) => part ? parts.updatePart(part.id, payload) : parts.createPart(payload)
  const success = (saved: Part) => { onSaved?.(saved); onClose() }

  return createPortal(
    <ScheduleDialogShell title={part ? 'Редактировать запчасть' : 'Добавить запчасть'} description={part ? 'Измените данные запчасти и сохраните результат.' : 'Добавьте запчасть в справочник текущего календаря.'} titleId="part-form-title" descriptionId="part-form-description" disabled={isPending} onClose={onClose}>
      <PartForm part={part} isPending={isPending} onSubmit={submit} onSuccess={success} onCancel={onClose} />
    </ScheduleDialogShell>,
    document.body,
  )
}
