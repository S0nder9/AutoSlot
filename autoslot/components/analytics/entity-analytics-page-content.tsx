'use client'

import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react'
import { EventDetailsDialog } from '@/components/calendar/event-details-dialog'
import { AnalyticsMetrics, AnalyticsSkeleton, AnalyticsState } from '@/components/analytics/analytics-shared'
import { AnalyticsPeriodSelector } from '@/components/analytics/employee-analytics-period'
import { Button } from '@/components/ui/button'
import { useAnalyticsPeriod } from '@/hooks/use-employee-analytics-period'
import { useEntityAnalytics } from '@/hooks/use-entity-analytics'
import { useEventDetails } from '@/hooks/use-event-details'
import type { AnalyticsKind, CarAnalytics, ClientAnalytics, CustomerOrder, EntityAnalyticsData, JobAnalytics, JobEntry, PartAnalytics, PartEntry } from '@/lib/entity-analytics-types'
import { formatEventDate, formatEventPrice, formatPercentage } from '@/lib/format-event'
import { parseStatisticsDate } from '@/lib/statistics-period'

const LABELS: Record<AnalyticsKind, { back: string; subtitle: string; empty: string }> = {
  jobs: { back: 'Работы', subtitle: 'Аналитика работы', empty: 'Эта работа не выполнялась за выбранный период' },
  parts: { back: 'Запчасти', subtitle: 'Аналитика продаж запчасти', empty: 'Запчасть не использовалась за выбранный период' },
  clients: { back: 'Клиенты', subtitle: 'Аналитика клиента', empty: 'У клиента нет заказов за выбранный период' },
  cars: { back: 'Автомобили', subtitle: 'История обслуживания автомобиля', empty: 'У автомобиля нет заказов за выбранный период' },
}

export function EntityAnalyticsPageContent({ kind }: { kind: AnalyticsKind }) {
  const params = useParams<Record<string, string>>()
  const search = useSearchParams()
  const scheduleId = search.get('scheduleId') ?? ''
  const id = params.jobId ?? params.partId ?? params.clientId ?? params.carId ?? ''
  return scheduleId && id ? <EntityAnalyticsScreen key={`${kind}:${scheduleId}:${id}`} kind={kind} scheduleId={scheduleId} entityId={id} /> : <main className="p-8"><AnalyticsState>Не указан календарь или объект аналитики.</AnalyticsState></main>
}

function EntityAnalyticsScreen({ kind, scheduleId, entityId }: { kind: AnalyticsKind; scheduleId: string; entityId: string }) {
  const router = useRouter()
  const period = useAnalyticsPeriod()
  const analytics = useEntityAnalytics(scheduleId, kind, entityId, period.range, period.bucket)
  const details = useEventDetails(scheduleId)
  const data = analytics.summary.data as EntityAnalyticsData | undefined
  const title = data ? entityTitle(kind, data) : analytics.summary.error ? 'Данные недоступны' : 'Загрузка…'
  const secondary = data ? entitySecondary(kind, data) : null
  const backHref = `/dashboard/${kind}?${new URLSearchParams({ scheduleId })}`

  return <main className="mx-auto w-full min-w-0 max-w-7xl space-y-6 px-5 py-6 sm:px-8">
    <header><div className="mb-4 flex items-center gap-2"><Button variant="ghost" onClick={() => window.history.length > 1 ? router.back() : router.push(backHref)}><ArrowLeft /> Назад</Button><Link href={backHref} className="text-sm text-muted-foreground hover:text-foreground">{LABELS[kind].back}</Link></div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{secondary ? `${secondary} · ` : ''}{LABELS[kind].subtitle}</p></header>
    <AnalyticsPeriodSelector value={period} isFetching={analytics.summary.isFetching || analytics.history.isFetching} />
    {!period.range ? null : analytics.summary.isPending ? <AnalyticsSkeleton /> : analytics.summary.error ? <div><AnalyticsState error>Не удалось загрузить аналитику.</AnalyticsState><Button className="mt-3" variant="outline" onClick={() => void analytics.summary.refetch()}>Повторить</Button></div> : data ? <>
      <EntitySummary kind={kind} data={data} />
      {isEmpty(kind, data) ? <AnalyticsState>{LABELS[kind].empty}</AnalyticsState> : <>
        {period.period !== 'day' && <EntityTimeline kind={kind} data={data} bucket={period.bucket} />}
        <EntityBreakdown kind={kind} data={data} />
      </>}
      <section className="space-y-4 border-t pt-5"><h2 className="text-base font-semibold">{kind === 'cars' ? 'История обслуживания' : kind === 'clients' ? 'История заказов' : kind === 'parts' ? 'История продаж' : 'История выполнений'}</h2>
        {analytics.history.isPending ? <div className="h-48 animate-pulse rounded-xl bg-muted" /> : analytics.entries.length ? <div className="divide-y rounded-xl border">{analytics.entries.map(({ entry, key }) => <HistoryRow key={key} kind={kind} entry={entry as JobEntry | PartEntry | CustomerOrder} onOpen={(eventId) => void details.open({ id: eventId })} />)}</div> : !analytics.history.error ? <AnalyticsState>Записей за выбранный период нет.</AnalyticsState> : null}
        {analytics.history.error && <div><AnalyticsState error>Не удалось загрузить историю.</AnalyticsState><Button variant="outline" onClick={() => void (analytics.history.isFetchNextPageError ? analytics.history.fetchNextPage({ cancelRefetch: false }) : analytics.history.refetch())}>Повторить</Button></div>}
        {analytics.history.hasNextPage && <div className="flex justify-center"><Button variant="outline" disabled={analytics.history.isFetchingNextPage} onClick={() => void analytics.history.fetchNextPage({ cancelRefetch: false })}>{analytics.history.isFetchingNextPage && <Loader2 className="animate-spin" />}Показать ещё</Button></div>}
      </section>
    </> : null}
    {details.isOpen && <EventDetailsDialog scheduleId={scheduleId} event={details.event} isLoading={details.isLoading} isUpdating={false} isDeleting={false} isTimeMutationPending={false} readOnly onClose={details.close} />}
  </main>
}

function EntitySummary({ kind, data }: { kind: AnalyticsKind; data: EntityAnalyticsData }) {
  if (kind === 'jobs') { const s = (data as JobAnalytics).summary; return <AnalyticsMetrics items={[{ label: 'Заказов', value: s.ordersCount }, { label: 'Выполнено', value: s.executionsCount }, { label: 'Продано на', value: formatEventPrice(s.salesTotal), accent: true }, { label: 'Средняя цена', value: formatEventPrice(s.averageClientPrice) }, { label: 'Минимальная цена', value: formatEventPrice(s.minClientPrice) }, { label: 'Максимальная цена', value: formatEventPrice(s.maxClientPrice) }]} /> }
  if (kind === 'parts') { const s = (data as PartAnalytics).summary; return <AnalyticsMetrics items={[{ label: 'Заказов', value: s.ordersCount }, { label: 'Продано единиц', value: s.quantity }, { label: 'Продажи', value: formatEventPrice(s.salesTotal), accent: true }, { label: 'Себестоимость', value: formatEventPrice(s.costTotal) }, { label: 'Маржа', value: formatEventPrice(s.grossMargin), negative: s.grossMargin < 0 }, { label: 'Маржинальность', value: formatPercentage(s.grossMarginPercent), negative: s.grossMargin < 0 }, { label: 'Средняя продажа', value: formatEventPrice(s.averageSaleUnitPrice) }, { label: 'Средняя закупка', value: formatEventPrice(s.averageCostUnitPrice) }]} /> }
  const s = (data as ClientAnalytics | CarAnalytics).summary; const client = kind === 'clients'; return <AnalyticsMetrics items={[{ label: 'Заказов', value: s.ordersCount }, ...(client ? [{ label: 'Автомобилей', value: (s as ClientAnalytics['summary']).uniqueCarsCount }] : []), { label: 'Стоимость заказов', value: formatEventPrice(s.ordersTotal), accent: true }, { label: 'Средний заказ', value: formatEventPrice(s.averageOrderValue) }, { label: 'Оплачено', value: `${s.paidOrdersCount} · ${formatEventPrice(s.paidTotal)}` }, { label: 'Не оплачено', value: `${s.unpaidOrdersCount} · ${formatEventPrice(s.unpaidTotal)}` }, { label: 'Работы', value: formatEventPrice(s.workTotal) }, { label: 'Запчасти', value: formatEventPrice(s.partsTotal) }]} />
}

function EntityTimeline({ kind, data, bucket }: { kind: AnalyticsKind; data: EntityAnalyticsData; bucket: 'day' | 'month' }) {
  const rows = data.timeline
  const values = rows.map((row) => 'salesTotal' in row ? row.salesTotal : row.ordersTotal)
  const maximum = Math.max(0, ...values)
  return <section className="space-y-4 rounded-xl border p-5"><div><h2 className="text-base font-semibold">Динамика</h2><p className="mt-1 text-xs text-muted-foreground">{kind === 'jobs' || kind === 'parts' ? 'Продажи' : 'Стоимость заказов'} за период</p></div><div className="space-y-3">{rows.map((row, index) => { const date = parseStatisticsDate(row.periodStart.slice(0, 10)); const value = values[index]; return <div key={row.periodStart} className="grid grid-cols-[7rem_minmax(0,1fr)_auto] items-center gap-3 text-sm"><span className="capitalize text-muted-foreground">{date ? format(date, bucket === 'month' ? 'LLLL yyyy' : 'd MMM', { locale: ru }) : row.periodStart.slice(0, 10)}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-blue-500" style={{ width: `${maximum ? Math.max(2, value / maximum * 100) : 0}%` }} /></div><span className="min-w-24 text-right tabular-nums">{formatEventPrice(value)}</span></div>})}</div></section>
}

function EntityBreakdown({ kind, data }: { kind: AnalyticsKind; data: EntityAnalyticsData }) {
  if (kind === 'jobs') { const employees = (data as JobAnalytics).employees; return <section className="space-y-3"><h2 className="text-base font-semibold">Сотрудники</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{employees.map((item) => <div key={item.employeeId} className="rounded-xl border p-4"><p className="font-medium">{item.employeeName}</p><p className="mt-2 text-sm text-muted-foreground">{item.executionsCount} выполнений</p><p className="mt-1 font-semibold">{formatEventPrice(item.salesTotal)}</p></div>)}</div></section> }
  if (kind === 'parts') return null
  const customer = data as ClientAnalytics | CarAnalytics
  return <div className="grid gap-5 lg:grid-cols-2"><TopList title="Частые работы" items={customer.topJobs.map((item) => ({ name: item.name, count: `${item.count} раз`, total: item.salesTotal }))} /><TopList title={kind === 'cars' ? 'Использованные запчасти' : 'Частые запчасти'} items={customer.topParts.map((item) => ({ name: item.name, count: `${item.quantity} шт.`, total: item.salesTotal }))} /></div>
}

function TopList({ title, items }: { title: string; items: Array<{ name: string; count: string; total: number }> }) { return <section className="rounded-xl border p-5"><h2 className="text-base font-semibold">{title}</h2>{items.length ? <div className="mt-3 divide-y">{items.map((item) => <div key={item.name} className="flex justify-between gap-3 py-3"><div><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.count}</p></div><span className="tabular-nums">{formatEventPrice(item.total)}</span></div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">Нет данных за период.</p>}</section> }

function HistoryRow({ kind, entry, onOpen }: { kind: AnalyticsKind; entry: JobEntry | PartEntry | CustomerOrder; onOpen: (id: string) => void }) {
  const customer = 'totalCost' in entry; const part = 'quantity' in entry
  const date = customer ? entry.startTime : entry.eventStartTime; const title = customer ? entry.title : entry.eventTitle
  // The car history endpoint omits the redundant car name: the page identifies it.
  const relation = customer
    ? kind === 'cars' ? null : entry.carName ?? 'Автомобиль не указан'
    : `${entry.clientName ?? 'Клиент не указан'} · ${entry.carName ?? 'Автомобиль не указан'}`

  return <button type="button" className="grid w-full gap-2 px-4 py-4 text-left hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-center" onClick={() => onOpen(entry.eventId)}>
    <span className="text-sm text-muted-foreground">{formatEventDate(date)}</span>
    <span className="min-w-0">
      <span className="block truncate font-medium">{title}</span>
      {relation && <span className="block truncate text-xs text-muted-foreground">{relation}</span>}
      {kind === 'jobs' && !customer && !part && <span className="block text-xs text-muted-foreground">Сотрудник: {entry.employeeName}</span>}
      {part && <span className="block text-xs text-muted-foreground">{entry.quantity} шт. · продажа {formatEventPrice(entry.unitPrice)} / шт. · закупка {formatEventPrice(entry.purchasePrice)} / шт.</span>}
      {part && <span className={`block text-xs ${entry.grossMargin < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>Себестоимость {formatEventPrice(entry.costTotal)} · маржа {formatEventPrice(entry.grossMargin)}</span>}
      {customer && <span className="block text-xs text-muted-foreground">Работы {formatEventPrice(entry.workTotal)} · Запчасти {formatEventPrice(entry.partsTotal)} · {entry.isPaid ? 'Оплачено' : 'Не оплачено'}</span>}
    </span>
    <span className={`flex items-center gap-2 font-semibold tabular-nums ${part && entry.grossMargin < 0 ? 'text-destructive' : ''}`}>
      {formatEventPrice(customer ? entry.totalCost : part ? entry.salesTotal : entry.clientPrice)}<ChevronRight className="size-4 text-muted-foreground" />
    </span>
  </button>
}

function entityTitle(kind: AnalyticsKind, data: EntityAnalyticsData) { if (kind === 'jobs') return (data as JobAnalytics).job.currentName; if (kind === 'parts') return (data as PartAnalytics).part.currentName; if (kind === 'clients') return (data as ClientAnalytics).client.name; return (data as CarAnalytics).car.displayName }
function entitySecondary(kind: AnalyticsKind, data: EntityAnalyticsData) { if (kind === 'clients') return (data as ClientAnalytics).client.phone; if (kind === 'cars') return (data as CarAnalytics).car.clientName; return null }
function isEmpty(kind: AnalyticsKind, data: EntityAnalyticsData) { if (kind === 'jobs') return (data as JobAnalytics).summary.executionsCount === 0; if (kind === 'parts') return (data as PartAnalytics).summary.quantity === 0; return (data as ClientAnalytics | CarAnalytics).summary.ordersCount === 0 }
