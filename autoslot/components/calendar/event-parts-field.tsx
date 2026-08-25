'use client'

import { useMemo, useState } from 'react'
import { Loader2, Package, Plus, Search, Trash2 } from 'lucide-react'
import { PartFormDialog } from '@/components/parts/part-form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSchedulePartSearch } from '@/hooks/use-schedule-part-search'
import { useScheduleParts } from '@/hooks/use-schedule-parts'
import type { EventPartFormItem } from '@/lib/calendar-types'
import { formatEventPrice } from '@/lib/format-event'
import type { Part } from '@/lib/part-types'

type Props = {
  scheduleId: string
  value: EventPartFormItem[]
  error?: string
  onChange: (parts: EventPartFormItem[]) => void
}

export function EventPartsField({ scheduleId, value, error, onChange }: Props) {
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [text, setText] = useState('')
  const partsQuery = useScheduleParts(scheduleId)
  const search = useSchedulePartSearch(scheduleId, text)
  const normalizedText = text.trim()
  const selectedIds = useMemo(() => new Set(value.map(({ partId }) => partId)), [value])
  const sourceParts = normalizedText
    ? search.debouncedText === normalizedText ? search.parts : []
    : partsQuery.parts
  const availableParts = sourceParts.filter(
    (part) => part.isActive && !selectedIds.has(part.id),
  )

  const addPart = (part: Part) => {
    if (!selectedIds.has(part.id)) {
      onChange([...value, {
        partId: part.id,
        partName: part.name,
        purchasePrice: part.purchasePrice,
        quantity: 1,
        unitPrice: part.basePrice,
      }])
    }
    setText('')
    setSelectorOpen(false)
    setCreateOpen(false)
  }
  const updatePart = (partId: string, patch: Partial<EventPartFormItem>) => {
    onChange(value.map((item) => item.partId === partId ? { ...item, ...patch } : item))
  }

  return <div className="space-y-3 rounded-lg border p-3">
    <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Package className="size-4" /><Label>Запчасти</Label></div><Button type="button" size="sm" variant="outline" onClick={() => { setSelectorOpen((open) => !open); setText('') }}><Plus /> Добавить запчасть</Button></div>
    {value.length ? <div className="space-y-3">{value.map((part) => <div key={part.partId} className="space-y-3 rounded-lg bg-muted/50 p-3">
      <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium">{part.partName}</p><Button type="button" size="icon-sm" variant="ghost" aria-label={`Убрать запчасть «${part.partName}»`} onClick={() => onChange(value.filter(({ partId }) => partId !== part.partId))}><Trash2 /></Button></div>
      <div className="grid gap-3 sm:grid-cols-[0.8fr_1fr_1fr_auto] sm:items-end">
        <label className="space-y-1 text-xs font-medium">Количество<Input type="number" min="1" step="1" inputMode="numeric" value={part.quantity} onChange={(event) => updatePart(part.partId, { quantity: Math.max(1, Math.trunc(Number(event.target.value) || 1)) })} /></label>
        <div className="space-y-1 text-xs font-medium"><span>Закупочная цена</span><div className="flex h-8 items-center rounded-lg border border-input bg-muted px-2.5 text-sm font-normal text-muted-foreground">{formatEventPrice(part.purchasePrice)}</div></div>
        <label className="space-y-1 text-xs font-medium">Цена продажи (₽)<Input type="number" min="0" step="any" inputMode="decimal" value={part.unitPrice} onChange={(event) => updatePart(part.partId, { unitPrice: Math.max(0, Number(event.target.value) || 0) })} /></label>
        <div className="pb-2 text-right"><p className="text-xs text-muted-foreground">Сумма</p><p className="text-sm font-semibold">{formatEventPrice(part.quantity * part.unitPrice)}</p></div>
      </div>
    </div>)}</div> : <p className="text-sm text-muted-foreground">Запчасти не добавлены.</p>}
    {error && <p className="text-sm text-destructive">{error}</p>}

    {selectorOpen && <div className="space-y-2 rounded-lg border bg-background p-3">
      <span className="relative block"><Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-8" placeholder="Поиск запчасти..." value={text} onChange={(event) => setText(event.target.value)} autoFocus /></span>
      {(normalizedText ? search.isSearching : partsQuery.isLoading) ? <div className="flex justify-center py-4"><Loader2 className="size-5 animate-spin" /></div>
        : (normalizedText ? search.error : partsQuery.error) ? <p className="py-2 text-sm text-destructive">Не удалось загрузить запчасти.</p>
        : availableParts.length ? <div className="max-h-44 space-y-1 overflow-y-auto">{availableParts.map((part) => <button key={part.id} type="button" className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted" onClick={() => addPart(part)}><span className="truncate">{part.name}{part.article ? ` · ${part.article}` : ''}</span><span className="shrink-0 text-muted-foreground">{formatEventPrice(part.basePrice)}</span></button>)}</div>
        : <p className="py-2 text-sm text-muted-foreground">Подходящих запчастей не найдено.</p>}
      {normalizedText && search.hasMore && <Button type="button" className="w-full" variant="ghost" disabled={search.isLoadingMore} onClick={() => void search.loadMore()}>{search.isLoadingMore && <Loader2 className="animate-spin" />}Показать ещё</Button>}
      <Button type="button" className="w-full" variant="outline" onClick={() => setCreateOpen(true)}><Plus /> Добавить новую запчасть</Button>
    </div>}
    {createOpen && <PartFormDialog scheduleId={scheduleId} onClose={() => setCreateOpen(false)} onSaved={addPart} />}
  </div>
}
