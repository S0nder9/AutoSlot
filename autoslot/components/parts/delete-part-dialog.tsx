'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import type { Part } from '@/lib/part-types'

type Props = { part: Part; isPending: boolean; onConfirm: () => void; onClose: () => void }

export function DeletePartDialog({ part, isPending, onConfirm, onClose }: Props) {
  return <ScheduleDialogShell title="Удалить запчасть?" description={`Запчасть «${part.name}» больше не будет доступна для новых заказов. Это действие нельзя отменить.`} titleId="delete-part-title" descriptionId="delete-part-description" disabled={isPending} alert narrow onClose={onClose}>
    <div className="flex justify-end gap-3"><Button variant="outline" disabled={isPending} onClick={onClose}>Отмена</Button><Button variant="destructive" disabled={isPending} onClick={onConfirm}>{isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}{isPending ? 'Удаление...' : 'Удалить'}</Button></div>
  </ScheduleDialogShell>
}
