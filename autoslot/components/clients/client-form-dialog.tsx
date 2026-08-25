'use client'

import { createPortal } from 'react-dom'
import { ClientForm } from '@/components/clients/client-form'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import { useScheduleClients } from '@/hooks/use-schedule-clients'
import type { Client, ClientPayload } from '@/lib/client-types'

type Props = { scheduleId: string; client?: Client; onClose: () => void; onCreated?: (client: Client) => void }

export function ClientFormDialog({ scheduleId, client, onClose, onCreated }: Props) {
  const clients = useScheduleClients(scheduleId)
  const isPending = client ? clients.isUpdating : clients.isCreating
  const handleSubmit = (payload: ClientPayload) => client ? clients.updateClient(client.id, payload) : clients.createClient(payload)
  const handleSuccess = (saved: Client) => { if (!client) onCreated?.(saved); onClose() }
  return createPortal(<ScheduleDialogShell title={client ? 'Редактировать клиента' : 'Добавить клиента'} description={client ? 'Измените данные клиента и сохраните результат.' : 'Добавьте клиента в текущий календарь.'} titleId="client-form-title" descriptionId="client-form-description" disabled={isPending} onClose={onClose}><ClientForm client={client} isPending={isPending} onSubmit={handleSubmit} onSuccess={handleSuccess} onCancel={onClose} /></ScheduleDialogShell>, document.body)
}
