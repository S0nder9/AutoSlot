'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { useDeleteSchedule } from '@/hooks/use-delete-schedule'
import { Button } from '@/components/ui/button'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import type { Schedule } from '@/lib/schedule-types'

type DeleteScheduleDialogProps = {
  schedule: Schedule
  isPending: boolean
  onDelete: (schedule: Schedule) => Promise<boolean>
  onClose: () => void
}

export function DeleteScheduleDialog({
  schedule,
  isPending,
  onDelete,
  onClose,
}: DeleteScheduleDialogProps) {
  const handleDelete = useDeleteSchedule(schedule, onDelete, onClose)

  return (
    <ScheduleDialogShell
      title="Удалить календарь?"
      description={
        <>
          Календарь «{schedule.name}» и все связанные события, работы и сотрудники
          будут удалены безвозвратно.
        </>
      }
      titleId="delete-schedule-title"
      descriptionId="delete-schedule-description"
      disabled={isPending}
      alert
      narrow
      onClose={onClose}
    >
      <div className="flex justify-end gap-3">
        <Button variant="outline" disabled={isPending} onClick={onClose}>
          Отмена
        </Button>
        <Button variant="destructive" disabled={isPending} onClick={handleDelete}>
          {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
          Удалить
        </Button>
      </div>
    </ScheduleDialogShell>
  )
}
