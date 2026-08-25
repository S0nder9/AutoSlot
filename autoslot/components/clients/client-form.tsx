'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useClientForm } from '@/hooks/use-client-form'
import type { Client, ClientPayload } from '@/lib/client-types'

type Props = { client?: Client; isPending: boolean; onSubmit: (payload: ClientPayload) => Promise<Client | null>; onSuccess: (client: Client) => void; onCancel: () => void }

export function ClientForm({ client, isPending, onSubmit, onSuccess, onCancel }: Props) {
  const form = useClientForm(client, onSubmit, onSuccess)
  return <form className="space-y-4" onSubmit={form.handleSubmit}>
    <div className="space-y-2"><Label htmlFor="client-name">Имя *</Label><Input id="client-name" name="name" value={form.values.name} onChange={form.handleChange} aria-invalid={Boolean(form.errors.name)} autoFocus />{form.errors.name && <p className="text-sm text-destructive">{form.errors.name}</p>}</div>
    <div className="space-y-2"><Label htmlFor="client-phone">Телефон</Label><Input id="client-phone" name="phone" type="tel" value={form.values.phone} onChange={form.handleChange} /></div>
    <div className="flex justify-end gap-3 pt-2"><Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>Отмена</Button><Button type="submit" disabled={isPending}>{isPending && <Loader2 className="animate-spin" />}{isPending ? (client ? 'Сохранение...' : 'Создание...') : (client ? 'Сохранить' : 'Создать')}</Button></div>
  </form>
}
