'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import { Button } from '@/components/ui/button'
import { formatEmployeeName, type Employee } from '@/lib/employee-types'

type DeleteEmployeeDialogProps = {
  employee: Employee
  isPending: boolean
  onConfirm: () => void
  onClose: () => void
}

export function DeleteEmployeeDialog({
  employee,
  isPending,
  onConfirm,
  onClose,
}: DeleteEmployeeDialogProps) {
  return (
    <ScheduleDialogShell
      title="Удалить сотрудника?"
      description={`Сотрудник «${formatEmployeeName(employee)}» больше не будет доступен для назначения на новые работы.`}
      titleId="delete-employee-title"
      descriptionId="delete-employee-description"
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
