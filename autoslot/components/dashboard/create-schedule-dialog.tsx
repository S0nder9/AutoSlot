'use client'

import { Loader2 } from 'lucide-react'
import { useScheduleNameForm } from '@/hooks/use-schedule-name-form'
import { Button } from '@/components/ui/button'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import { ScheduleNameField } from '@/components/dashboard/schedule-name-field'

type CreateScheduleDialogProps = {
  isPending: boolean
  onCreate: (name: string) => Promise<boolean>
  onClose: () => void
}

export function CreateScheduleDialog({
  isPending,
  onCreate,
  onClose,
}: CreateScheduleDialogProps) {
  const form = useScheduleNameForm('', onCreate, onClose)

  return (
    <ScheduleDialogShell
      title="Новый календарь"
      description="Укажите понятное название для расписания."
      titleId="create-schedule-title"
      descriptionId="create-schedule-description"
      disabled={isPending}
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={form.handleSubmit}>
        <ScheduleNameField
          id="schedule-name"
          value={form.name}
          error={form.error}
          placeholder="Основное расписание"
          onChange={form.handleChange}
        />
        <div className="flex justify-end gap-3">
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
