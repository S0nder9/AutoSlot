'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChartNoAxesColumn, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, UsersRound } from 'lucide-react'
import { DeleteClientDialog } from '@/components/clients/delete-client-dialog'
import { ClientFormDialog } from '@/components/clients/client-form-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useScheduleClientSearch } from '@/hooks/use-schedule-client-search'
import { useScheduleClients } from '@/hooks/use-schedule-clients'
import { useSchedules } from '@/hooks/use-schedules'
import type { Client } from '@/lib/client-types'
import { entityAnalyticsHref } from '@/lib/entity-analytics-queries'

export function ClientsPageContent() {
  const scope = useSearchParams().get('scheduleId') ?? ''
  return <ClientsPageScope key={scope} />
}

function ClientsPageScope() {
  const router = useRouter(); const searchParams = useSearchParams(); const scheduleId = searchParams.get('scheduleId') ?? ''
  const schedules = useSchedules(); const clients = useScheduleClients(scheduleId)
  const [text, setText] = useState(''); const search = useScheduleClientSearch(scheduleId, text)
  const [dialogClient, setDialogClient] = useState<Client | null | undefined>()
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const normalized = text.trim(); const visible = normalized ? search.debouncedText === normalized ? search.clients : [] : clients.clients
  const changeSchedule = (id: string) => { const params = new URLSearchParams(searchParams.toString()); if (id) params.set('scheduleId', id); else params.delete('scheduleId'); router.replace(`/dashboard/clients?${params}`) }
  const handleDelete = async () => { if (clientToDelete && await clients.deleteClient(clientToDelete.id)) setClientToDelete(null) }

  return <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight">Клиенты</h1><p className="mt-1 text-sm text-muted-foreground">Управление клиентами автосервиса</p></div><Button disabled={!scheduleId} onClick={() => setDialogClient(null)}><Plus /> Добавить клиента</Button></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(220px,320px)_1fr_auto]">
      <label className="space-y-2 text-sm font-medium">Календарь<select value={scheduleId} onChange={(event) => changeSchedule(event.target.value)} className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"><option value="">Выберите календарь</option>{schedules.schedules.map((schedule) => <option key={schedule.id} value={schedule.id}>{schedule.name}</option>)}</select></label>
      <label className="space-y-2 text-sm font-medium">Поиск<span className="relative block"><Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-8" placeholder="Поиск клиентов..." value={text} onChange={(event) => setText(event.target.value)} disabled={!scheduleId} /></span></label>
      <Button className="self-end" variant="outline" disabled={!scheduleId || clients.isFetching || search.isSearching || search.isLoadingMore} onClick={() => void (text.trim() ? search.refetch() : clients.refetch())}><RefreshCw className={clients.isFetching ? 'animate-spin' : undefined} /> Обновить</Button>
    </div>
    {!scheduleId ? <Empty icon title="Выберите календарь" text="Клиенты принадлежат конкретному календарю." /> : clients.isLoading ? <Loading /> : clients.error ? <Empty title="Не удалось загрузить клиентов" text="" action={<Button variant="outline" onClick={() => void (text.trim() ? search.refetch() : clients.refetch())}>Повторить</Button>} /> : clients.clients.length === 0 ? <Empty icon title="Клиентов пока нет" text="Добавьте первого клиента, чтобы выбирать его при создании событий." action={<Button onClick={() => setDialogClient(null)}><Plus /> Добавить клиента</Button>} /> : <div className="mt-6 overflow-hidden rounded-xl border bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3 text-sm text-muted-foreground"><span>Найдено клиентов: {visible.length}</span>{search.isSearching && <Loader2 className="size-4 animate-spin" />}</div>
      <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-muted/50 text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Имя</th><th className="px-4 py-3 font-medium">Телефон</th><th className="px-4 py-3 text-right font-medium">Действия</th></tr></thead><tbody>
        {visible.map((client) => <tr key={client.id} className="border-t"><td className="px-4 py-3 font-medium">{client.name}{!client.isActive && <span className="ml-2 text-xs text-muted-foreground">Неактивен</span>}</td><td className="px-4 py-3 text-muted-foreground">{client.phone || '—'}</td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><Link href={entityAnalyticsHref('clients', scheduleId, client.id)} className={buttonVariants({ size: 'sm', variant: 'outline' })}><ChartNoAxesColumn /> Статистика</Link><Button size="sm" variant="outline" onClick={() => setDialogClient(client)}><Pencil /> Редактировать</Button><Button size="sm" variant="destructive" aria-label={`Удалить клиента «${client.name}»`} onClick={() => setClientToDelete(client)}><Trash2 /> Удалить</Button></div></td></tr>)}
        {normalized && search.error && <tr><td colSpan={3} className="px-4 py-10 text-center text-destructive">Не удалось выполнить поиск клиентов.</td></tr>}
        {normalized && !search.error && !search.isSearching && visible.length === 0 && <tr><td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">По вашему запросу ничего не найдено.</td></tr>}
      </tbody></table></div>
      {normalized && search.hasMore && <div className="flex justify-center border-t p-3"><Button variant="outline" disabled={search.isLoadingMore} onClick={() => void search.loadMore()}>{search.isLoadingMore && <Loader2 className="animate-spin" />}Показать ещё</Button></div>}
    </div>}
    {dialogClient !== undefined && scheduleId && <ClientFormDialog scheduleId={scheduleId} client={dialogClient ?? undefined} onClose={() => setDialogClient(undefined)} />}
    {clientToDelete && <DeleteClientDialog client={clientToDelete} isPending={clients.isDeleting} onConfirm={() => void handleDelete()} onClose={() => setClientToDelete(null)} />}
  </main>
}

function Loading() { return <div className="flex min-h-64 items-center justify-center"><Loader2 className="size-7 animate-spin text-muted-foreground" /></div> }
function Empty({ title, text, action, icon = false }: { title: string; text: string; action?: React.ReactNode; icon?: boolean }) { return <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-background px-6 text-center">{icon && <UsersRound className="size-10 text-muted-foreground" />}<h2 className="mt-4 text-lg font-semibold">{title}</h2>{text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}{action && <div className="mt-5">{action}</div>}</div> }
