'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import { Button } from '@/components/ui/button'
import type { Client } from '@/lib/client-types'

type Props = { client: Client; isPending: boolean; onConfirm: () => void; onClose: () => void }

export function DeleteClientDialog({ client, isPending, onConfirm, onClose }: Props) {
  return <ScheduleDialogShell title="Удалить клиента?" description={`Клиент «${client.name}» больше не будет доступен для выбора в новых событиях.`} titleId="delete-client-title" descriptionId="delete-client-description" disabled={isPending} alert narrow onClose={onClose}>
    <div className="flex justify-end gap-3">
      <Button variant="outline" disabled={isPending} onClick={onClose}>Отмена</Button>
      <Button variant="destructive" disabled={isPending} onClick={onConfirm}>{isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}{isPending ? 'Удаление...' : 'Удалить'}</Button>
    </div>
  </ScheduleDialogShell>
}
