'use client'

import { useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Package, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { DeletePartDialog } from '@/components/parts/delete-part-dialog'
import { PartFormDialog } from '@/components/parts/part-form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSchedulePartSearch } from '@/hooks/use-schedule-part-search'
import { useScheduleParts } from '@/hooks/use-schedule-parts'
import { useSchedules } from '@/hooks/use-schedules'
import { formatEventPrice } from '@/lib/format-event'
import type { Part } from '@/lib/part-types'

export function PartsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scheduleId = searchParams.get('scheduleId') ?? ''
  const schedules = useSchedules()
  const parts = useScheduleParts(scheduleId)
  const [text, setText] = useState('')
  const search = useSchedulePartSearch(scheduleId, text)
  const [dialogPart, setDialogPart] = useState<Part | null | undefined>()
  const [partToDelete, setPartToDelete] = useState<Part | null>(null)
  const normalizedText = text.trim()
  const visibleParts = normalizedText
    ? search.debouncedText === normalizedText ? search.parts : []
    : parts.parts

  const changeSchedule = (nextScheduleId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (nextScheduleId) params.set('scheduleId', nextScheduleId)
    else params.delete('scheduleId')
    router.replace(`/dashboard/parts?${params.toString()}`)
  }
  const deletePart = async () => {
    if (partToDelete && await parts.deletePart(partToDelete.id)) setPartToDelete(null)
  }

  return <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight">Запчасти</h1><p className="mt-1 text-sm text-muted-foreground">Управление справочником запчастей</p></div><Button disabled={!scheduleId} onClick={() => setDialogPart(null)}><Plus /> Добавить запчасть</Button></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(220px,320px)_1fr_auto]">
      <label className="space-y-2 text-sm font-medium">Календарь<select value={scheduleId} onChange={(event) => changeSchedule(event.target.value)} className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"><option value="">Выберите календарь</option>{schedules.schedules.map((schedule) => <option key={schedule.id} value={schedule.id}>{schedule.name}</option>)}</select></label>
      <label className="space-y-2 text-sm font-medium">Поиск<span className="relative block"><Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-8" placeholder="Поиск запчастей..." value={text} onChange={(event) => setText(event.target.value)} disabled={!scheduleId} /></span></label>
      <Button className="self-end" variant="outline" disabled={!scheduleId || parts.isFetching} onClick={() => void parts.refetch()}><RefreshCw className={parts.isFetching ? 'animate-spin' : undefined} /> Обновить</Button>
    </div>

    {!scheduleId ? <State icon title="Выберите календарь" text="Запчасти принадлежат конкретному календарю и не смешиваются между автосервисами." />
      : parts.isLoading ? <div className="flex min-h-64 items-center justify-center"><Loader2 className="size-7 animate-spin text-muted-foreground" /></div>
      : parts.error ? <State title="Не удалось загрузить запчасти" action={<Button variant="outline" onClick={() => void parts.refetch()}>Повторить</Button>} />
      : parts.parts.length === 0 ? <State icon title="Запчастей пока нет" text="Добавьте первую запчасть, чтобы затем использовать её в заказах." action={<Button onClick={() => setDialogPart(null)}><Plus /> Добавить запчасть</Button>} />
      : <div className="mt-6 overflow-hidden rounded-xl border bg-background">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3 text-sm text-muted-foreground"><span>Найдено запчастей: {visibleParts.length}</span>{search.isSearching && <Loader2 className="size-4 animate-spin" />}</div>
        <div className="overflow-x-auto"><table className="w-full min-w-[960px] text-left text-sm"><thead className="bg-muted/50 text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Название</th><th className="px-4 py-3 font-medium">Артикул</th><th className="px-4 py-3 font-medium">Описание</th><th className="px-4 py-3 font-medium">Закупочная цена</th><th className="px-4 py-3 font-medium">Цена продажи</th><th className="px-4 py-3 text-right font-medium">Действия</th></tr></thead><tbody>
          {visibleParts.map((part) => <tr key={part.id} className="border-t first:border-t-0"><td className="px-4 py-3 font-medium">{part.name}</td><td className="px-4 py-3 text-muted-foreground">{part.article || '—'}</td><td className="max-w-sm px-4 py-3 text-muted-foreground"><span className="line-clamp-2">{part.description || '—'}</span></td><td className="px-4 py-3">{formatEventPrice(part.purchasePrice)}</td><td className="px-4 py-3">{formatEventPrice(part.basePrice)}</td><td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => setDialogPart(part)}><Pencil /> Редактировать</Button><Button size="sm" variant="destructive" aria-label={`Удалить запчасть «${part.name}»`} onClick={() => setPartToDelete(part)}><Trash2 /> Удалить</Button></div></td></tr>)}
          {normalizedText && search.error && <tr><td colSpan={6} className="px-4 py-10 text-center text-destructive">Не удалось выполнить поиск запчастей.</td></tr>}
          {normalizedText && !search.error && !search.isSearching && visibleParts.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">По вашему запросу ничего не найдено.</td></tr>}
        </tbody></table></div>
        {normalizedText && search.hasMore && <div className="flex justify-center border-t p-3"><Button variant="outline" disabled={search.isLoadingMore} onClick={() => void search.loadMore()}>{search.isLoadingMore && <Loader2 className="animate-spin" />}Показать ещё</Button></div>}
      </div>}

    {dialogPart !== undefined && scheduleId && <PartFormDialog scheduleId={scheduleId} part={dialogPart ?? undefined} onSaved={() => setText('')} onClose={() => setDialogPart(undefined)} />}
    {partToDelete && <DeletePartDialog part={partToDelete} isPending={parts.isDeleting} onConfirm={() => void deletePart()} onClose={() => setPartToDelete(null)} />}
  </main>
}

function State({ title, text, action, icon }: { title: string; text?: string; action?: ReactNode; icon?: boolean }) {
  return <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-background px-6 text-center">{icon && <Package className="size-10 text-muted-foreground" />}<h2 className="mt-4 text-lg font-semibold">{title}</h2>{text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}{action && <div className="mt-5">{action}</div>}</div>
}
