'use client'

import { useState } from 'react'
import { Loader2, Plus, Search } from 'lucide-react'
import { ClientFormDialog } from '@/components/clients/client-form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useScheduleClientSearch } from '@/hooks/use-schedule-client-search'
import { useScheduleClients } from '@/hooks/use-schedule-clients'
import type { Client } from '@/lib/client-types'

type Props = { scheduleId: string; value: string | null; initialName?: string | null; onChange: (clientId: string | null, clientName?: string | null) => void }

export function EventClientField({ scheduleId, value, initialName, onChange }: Props) {
  const clients = useScheduleClients(scheduleId)
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [text, setText] = useState('')
  const search = useScheduleClientSearch(scheduleId, text)
  const normalized = text.trim()
  const options = (normalized ? search.debouncedText === normalized ? search.clients : [] : clients.clients).filter(({ isActive }) => isActive)
  const selected = clients.clients.find(({ id }) => id === value)
  const select = (client: Client | null) => { onChange(client?.id ?? null, client?.name ?? null); setOpen(false); setText('') }

  return <div className="space-y-2">
    <Label>Клиент</Label>
    <Button type="button" className="w-full justify-start" variant="outline" onClick={() => { setOpen((current) => !current); setText('') }}>{selected?.name ?? (value ? initialName ?? 'Выбранный клиент' : 'Без клиента')}</Button>
    {open && <div className="space-y-2 rounded-lg border bg-background p-3">
      <span className="relative block"><Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-8" placeholder="Поиск клиента..." value={text} onChange={(event) => setText(event.target.value)} autoFocus /></span>
      <div className="max-h-44 space-y-1 overflow-y-auto">
        <button type="button" className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted" onClick={() => select(null)}>Без клиента</button>
        {value && !selected && <button type="button" className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted" onClick={() => { setOpen(false); setText('') }}>{initialName ?? 'Выбранный клиент'}</button>}
        {(normalized ? search.isSearching : clients.isLoading) ? <div className="flex justify-center py-4"><Loader2 className="size-5 animate-spin" /></div> : normalized && search.error ? <p className="px-2 py-2 text-sm text-destructive">Не удалось выполнить поиск клиентов.</p> : options.length ? options.map((client) => <button key={client.id} type="button" className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-muted" onClick={() => select(client)}><span>{client.name}</span><span className="text-muted-foreground">{client.phone}</span></button>) : <p className="px-2 py-2 text-sm text-muted-foreground">Клиенты не найдены.</p>}
      </div>
      {normalized && search.hasMore && <Button type="button" className="w-full" variant="ghost" disabled={search.isLoadingMore} onClick={() => void search.loadMore()}>{search.isLoadingMore && <Loader2 className="animate-spin" />}Показать ещё</Button>}
      <Button type="button" className="w-full" variant="outline" onClick={() => setCreateOpen(true)}><Plus /> Добавить нового клиента</Button>
    </div>}
    {createOpen && <ClientFormDialog scheduleId={scheduleId} onClose={() => setCreateOpen(false)} onCreated={(client) => select(client)} />}
  </div>
}
