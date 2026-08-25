'use client'

import { useState } from 'react'
import { Loader2, Plus, Search } from 'lucide-react'
import { CarFormDialog } from '@/components/cars/car-form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useScheduleCarSearch } from '@/hooks/use-schedule-car-search'
import type { Car } from '@/lib/car-types'

type Props = { scheduleId: string; clientId: string | null; clientName?: string | null; value: string | null; initialName?: string | null; onChange: (carId: string | null) => void }
export function EventCarField({ scheduleId, clientId, clientName, value, initialName, onChange }: Props) {
  const [open, setOpen] = useState(false); const [createOpen, setCreateOpen] = useState(false); const [text, setText] = useState(''); const search = useScheduleCarSearch(scheduleId, text, clientId ?? undefined)
  const normalized = text.trim(); const options = (search.debouncedText === normalized ? search.cars : []).filter(({ isActive }) => isActive); const selected = search.cars.find(({ id }) => id === value)
  const select = (car: Car | null) => { onChange(car?.id ?? null); setOpen(false); setText('') }
  if (!clientId) return <div className="space-y-2"><Label>Автомобиль</Label><Button type="button" className="w-full justify-start" variant="outline" disabled>Сначала выберите клиента</Button></div>
  return <div className="space-y-2"><Label>Автомобиль</Label><Button type="button" className="w-full justify-start" variant="outline" onClick={() => { setOpen((current) => !current); setText('') }}>{selected?.displayName ?? (value ? initialName ?? 'Выбранный автомобиль' : 'Без автомобиля')}</Button>
    {open && <div className="space-y-2 rounded-lg border bg-background p-3"><span className="relative block"><Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-8" placeholder="Поиск автомобиля..." value={text} onChange={(event) => setText(event.target.value)} autoFocus /></span><div className="max-h-44 space-y-1 overflow-y-auto"><button type="button" className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted" onClick={() => select(null)}>Без автомобиля</button>{value && !selected && <button type="button" className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted" onClick={() => { setOpen(false); setText('') }}>{initialName ?? 'Выбранный автомобиль'}</button>}{search.isSearching ? <div className="flex justify-center py-4"><Loader2 className="size-5 animate-spin" /></div> : search.error ? <p className="px-2 py-2 text-sm text-destructive">Не удалось загрузить автомобили.</p> : options.length ? options.map((car) => <button key={car.id} type="button" className="flex w-full justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-muted" onClick={() => select(car)}><span>{car.displayName}</span><span className="text-muted-foreground">{car.licensePlate}</span></button>) : <p className="px-2 py-2 text-sm text-muted-foreground">Автомобили не найдены.</p>}</div>{search.hasMore && <Button type="button" className="w-full" variant="ghost" disabled={search.isLoadingMore} onClick={() => void search.loadMore()}>{search.isLoadingMore && <Loader2 className="animate-spin" />}Показать ещё</Button>}<Button type="button" className="w-full" variant="outline" onClick={() => setCreateOpen(true)}><Plus /> Добавить новый автомобиль</Button></div>}
    {createOpen && <CarFormDialog scheduleId={scheduleId} fixedClientId={clientId} fixedClientName={clientName} onClose={() => setCreateOpen(false)} onCreated={(car) => select(car)} />}
  </div>
}
