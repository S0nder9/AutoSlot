'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import type { Job } from '@/lib/job-types'

type DeleteJobDialogProps = {
  job: Job
  isPending: boolean
  onConfirm: () => void
  onClose: () => void
}

export function DeleteJobDialog({
  job,
  isPending,
  onConfirm,
  onClose,
}: DeleteJobDialogProps) {
  return (
    <ScheduleDialogShell
      title="Удалить работу?"
      description={`Работа «${job.name}» больше не будет доступна для добавления в события. Это действие нельзя отменить.`}
      titleId="delete-job-title"
      descriptionId="delete-job-description"
      disabled={isPending}
      alert
      narrow
      onClose={onClose}
    >
      <div className="flex justify-end gap-3">
        <Button variant="outline" disabled={isPending} onClick={onClose}>
          Отмена
        </Button>
        <Button
          variant="destructive"
          disabled={isPending}
          onClick={onConfirm}
        >
          {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
          {isPending ? 'Удаление...' : 'Удалить'}
        </Button>
      </div>
    </ScheduleDialogShell>
  )
}
