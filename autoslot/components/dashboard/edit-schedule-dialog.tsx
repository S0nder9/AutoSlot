'use client'

import { Loader2 } from 'lucide-react'
import { useEditScheduleForm } from '@/hooks/use-edit-schedule-form'
import { Button } from '@/components/ui/button'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import { ScheduleNameField } from '@/components/dashboard/schedule-name-field'
import type { Schedule } from '@/lib/schedule-types'

type EditScheduleDialogProps = {
  schedule: Schedule
  isPending: boolean
  onUpdate: (schedule: Schedule, name: string) => Promise<boolean>
  onClose: () => void
}

export function EditScheduleDialog({
  schedule,
  isPending,
  onUpdate,
  onClose,
}: EditScheduleDialogProps) {
  const form = useEditScheduleForm(schedule, onUpdate, onClose)

  return (
    <ScheduleDialogShell
      title="Переименовать календарь"
      description={`Измените название календаря «${schedule.name}».`}
      titleId="edit-schedule-title"
      descriptionId="edit-schedule-description"
      disabled={isPending}
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={form.handleSubmit}>
        <ScheduleNameField
          id="editing-schedule-name"
          value={form.name}
          error={form.error}
          onChange={form.handleChange}
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            Сохранить
          </Button>
        </div>
      </form>
    </ScheduleDialogShell>
  )
}
