'use client'

import { Loader2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'

type LogoutAllDialogProps = {
  isPending: boolean
  onConfirm: () => void
  onClose: () => void
}

export function LogoutAllDialog({
  isPending,
  onConfirm,
  onClose,
}: LogoutAllDialogProps) {
  return (
    <ScheduleDialogShell
      title="Выйти со всех устройств?"
      description="Все активные сессии этого аккаунта будут завершены. На других устройствах потребуется войти снова."
      titleId="logout-all-title"
      descriptionId="logout-all-description"
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
          {isPending ? <Loader2 className="animate-spin" /> : <LogOut />}
          Выйти со всех устройств
        </Button>
      </div>
    </ScheduleDialogShell>
  )
}
