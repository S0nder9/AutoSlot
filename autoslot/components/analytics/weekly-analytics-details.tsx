'use client'

import { type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ChevronRight, RefreshCw } from 'lucide-react'
import { EventDetailsDialog } from '@/components/calendar/event-details-dialog'
import { Button } from '@/components/ui/button'
import { useEventDetails } from '@/hooks/use-event-details'
import { useScheduleStatisticsDetails } from '@/hooks/use-schedule-weekly-statistics'
import { formatEventPrice, formatPercentage } from '@/lib/format-event'
import { employeeAnalyticsHref } from '@/lib/employee-statistics-queries'
import { entityAnalyticsHref } from '@/lib/entity-analytics-queries'
import type { StatisticsRange, WeeklyStatisticsDetails } from '@/lib/statistics-types'

type DetailsSection = 'employees' | 'jobs' | 'parts'

const DETAILS_SECTIONS: Array<{ value: DetailsSection; label: string }> = [
  { value: 'employees', label: 'Сотрудники' },
  { value: 'jobs', label: 'Работы' },
  { value: 'parts', label: 'Запчасти' },
]

export function WeeklyAnalyticsDetails({ scheduleId, range }: { scheduleId: string; range: StatisticsRange }) {
  const requestedSection = useSearchParams().get('section')
  const section: DetailsSection = requestedSection === 'jobs' || requestedSection === 'parts' ? requestedSection : 'employees'
  const setSection = (value: DetailsSection) => {
    const url = new URL(window.location.href)
    url.searchParams.set('section', value)
    window.history.replaceState(null, '', `${url.pathname}${url.search}`)
  }
  const details = useScheduleStatisticsDetails(scheduleId, range)
  const eventDetails = useEventDetails(scheduleId)

  return <div className="mt-8 space-y-8">
    <DetailsTabs section={section} onChange={setSection} />

    {details.isLoading ? <DetailedSkeleton /> : details.error ? <DetailsError onRetry={() => void details.refetch()} /> : details.data ? <>
      <div role="tabpanel">
        {section === 'employees' && <EmployeesSection scheduleId={scheduleId} data={details.data} />}
        {section === 'jobs' && <JobsSection scheduleId={scheduleId} data={details.data} />}
        {section === 'parts' && <PartsSection scheduleId={scheduleId} data={details.data} />}
      </div>
      <UnpaidOrders data={details.data} onOpen={(eventId) => void eventDetails.open({ id: eventId })} />
    </> : null}

    {eventDetails.isOpen && <EventDetailsDialog
      scheduleId={scheduleId}
      event={eventDetails.event}
      isLoading={eventDetails.isLoading}
      isUpdating={false}
      isDeleting={false}
      isTimeMutationPending={false}
      readOnly
      onClose={eventDetails.close}
    />}
  </div>
}

function DetailsTabs({ section, onChange }: { section: DetailsSection; onChange: (section: DetailsSection) => void }) {
  return <div className="flex w-fit flex-wrap gap-1 rounded-xl bg-muted p-1" role="tablist" aria-label="Раздел подробной статистики">
    {DETAILS_SECTIONS.map((item) => <Button key={item.value} variant={section === item.value ? 'secondary' : 'ghost'} role="tab" aria-selected={section === item.value} onClick={() => onChange(item.value)}>{item.label}</Button>)}
  </div>
}

function EmployeesSection({ scheduleId, data }: { scheduleId: string; data: WeeklyStatisticsDetails }) {
  const jobsCount = sum(data.employees.map((employee) => employee.jobsCount))
  const salesTotal = sum(data.employees.map((employee) => employee.workSalesTotal))

  return <AnalyticsSection
    summary={[
      { label: 'Задействовано', value: data.employees.length },
      { label: 'Работ выполнено', value: jobsCount },
      { label: 'Сумма работ', value: formatEventPrice(salesTotal) },
      { label: 'Средняя стоимость работы', value: formatEventPrice(jobsCount ? salesTotal / jobsCount : 0) },
    ]}
    distributionTitle="Сумма работ по сотрудникам"
    distribution={data.employees.slice(0, 5).map((employee) => ({
      id: `${employee.employeeId}:${employee.employeeName}`,
      label: employee.employeeName,
      value: formatEventPrice(employee.workSalesTotal),
      percent: employee.workSalesSharePercent,
    }))}
    emptyText="За выбранный период назначенных работ нет"
    isEmpty={!data.employees.length}
  >
    <TableShell minWidth="min-w-[980px]">
      <thead><tr><NameHeading>Сотрудник</NameHeading><NumberHeading>Заказов</NumberHeading><NumberHeading>Работ</NumberHeading><NumberHeading>Сумма работ</NumberHeading><NumberHeading>К выплате</NumberHeading><NameHeading>Частая работа</NameHeading></tr></thead>
      <tbody>{data.employees.map((employee) => <tr key={`${employee.employeeId}:${employee.employeeName}`} className="border-t">
        <NameCell><Link className="underline decoration-border underline-offset-4 hover:decoration-current" href={employeeAnalyticsHref(scheduleId, employee.employeeId)}>{employee.employeeName}</Link>{employee.uncalculatedJobsCount > 0 && <span className="mt-1 block text-xs font-normal text-muted-foreground">{employee.uncalculatedJobsCount} работы без ставки</span>}</NameCell><NumberCell>{employee.ordersCount}</NumberCell><NumberCell>{employee.jobsCount}</NumberCell><NumberCell>{formatEventPrice(employee.workSalesTotal)}</NumberCell><NumberCell>{formatEventPrice(employee.payoutTotal)}</NumberCell>
        <NameCell>{employee.topJobName ? <><span className="block">{employee.topJobName}</span><span className="text-xs font-normal text-muted-foreground">{employee.topJobCount} раз</span></> : <span className="text-muted-foreground">—</span>}</NameCell>
      </tr>)}</tbody>
    </TableShell>
  </AnalyticsSection>
}

function JobsSection({ scheduleId, data }: { scheduleId: string; data: WeeklyStatisticsDetails }) {
  const count = sum(data.jobs.map((job) => job.count))
  const salesTotal = sum(data.jobs.map((job) => job.salesTotal))

  return <AnalyticsSection
    summary={[
      { label: 'Видов работ', value: data.jobs.length },
      { label: 'Выполнено', value: count },
      { label: 'Продано на', value: formatEventPrice(salesTotal) },
      { label: 'Средняя цена', value: formatEventPrice(count ? salesTotal / count : 0) },
    ]}
    distributionTitle="Работы по продажам"
    distribution={data.jobs.slice(0, 5).map((job) => ({ id: `${job.jobId}:${job.jobName}`, label: job.jobName, value: formatEventPrice(job.salesTotal), percent: job.salesSharePercent }))}
    emptyText="За выбранный период работ нет"
    isEmpty={!data.jobs.length}
  >
    <TableShell minWidth="min-w-[1120px]">
      <thead><tr><NameHeading>Работа</NameHeading><NumberHeading>Заказов</NumberHeading><NumberHeading>Выполнено</NumberHeading><NumberHeading>Средняя цена</NumberHeading><NumberHeading>Диапазон цены</NumberHeading><NumberHeading>Продано на</NumberHeading><NumberHeading>Доля</NumberHeading></tr></thead>
      <tbody>{data.jobs.map((job) => <tr key={`${job.jobId}:${job.jobName}`} className="border-t">
        <NameCell><Link className="underline decoration-border underline-offset-4 hover:decoration-current" href={entityAnalyticsHref('jobs', scheduleId, job.jobId)}>{job.jobName}</Link></NameCell><NumberCell>{job.ordersCount}</NumberCell><NumberCell>{job.count}</NumberCell><NumberCell>{formatEventPrice(job.averageClientPrice)}</NumberCell><NumberCell>{formatPriceRange(job.minClientPrice, job.maxClientPrice)}</NumberCell><NumberCell>{formatEventPrice(job.salesTotal)}</NumberCell><NumberCell>{formatPercentage(job.salesSharePercent)}</NumberCell>
      </tr>)}</tbody>
    </TableShell>
  </AnalyticsSection>
}

function PartsSection({ scheduleId, data }: { scheduleId: string; data: WeeklyStatisticsDetails }) {
  const quantity = sum(data.parts.map((part) => part.quantity))
  const salesTotal = sum(data.parts.map((part) => part.salesTotal))
  const grossMargin = sum(data.parts.map((part) => part.grossMargin))

  return <AnalyticsSection
    summary={[
      { label: 'Позиций', value: data.parts.length },
      { label: 'Продано единиц', value: quantity },
      { label: 'Продажи', value: formatEventPrice(salesTotal) },
      { label: 'Маржа запчастей', value: formatEventPrice(grossMargin), negative: grossMargin < 0 },
    ]}
    distributionTitle="Запчасти по продажам"
    distribution={data.parts.slice(0, 5).map((part) => ({ id: `${part.partId}:${part.partName}`, label: part.partName, value: formatEventPrice(part.salesTotal), percent: part.salesSharePercent }))}
    emptyText="За выбранный период запчасти не использовались"
    isEmpty={!data.parts.length}
  >
    <p className="mb-3 text-xs text-muted-foreground">Маржа указана только для запчастей и не является прибылью бизнеса.</p>
    <TableShell minWidth="min-w-[1380px]">
      <thead><tr><NameHeading>Запчасть</NameHeading><NumberHeading>Заказов</NumberHeading><NumberHeading>Кол-во</NumberHeading><NumberHeading>Средняя продажа</NumberHeading><NumberHeading>Средняя закупка</NumberHeading><NumberHeading>Продажа</NumberHeading><NumberHeading>Себестоимость</NumberHeading><NumberHeading>Маржа</NumberHeading><NumberHeading>Маржинальность</NumberHeading></tr></thead>
      <tbody>{data.parts.map((part) => <tr key={`${part.partId}:${part.partName}`} className="border-t">
        <NameCell><Link className="underline decoration-border underline-offset-4 hover:decoration-current" href={entityAnalyticsHref('parts', scheduleId, part.partId)}>{part.partName}</Link></NameCell><NumberCell>{part.ordersCount}</NumberCell><NumberCell>{part.quantity}</NumberCell><NumberCell>{formatEventPrice(part.averageSaleUnitPrice)}</NumberCell><NumberCell>{formatEventPrice(part.averageCostUnitPrice)}</NumberCell><NumberCell>{formatEventPrice(part.salesTotal)}</NumberCell><NumberCell>{formatEventPrice(part.costTotal)}</NumberCell><NumberCell negative={part.grossMargin < 0}>{formatEventPrice(part.grossMargin)}</NumberCell><NumberCell negative={part.grossMargin < 0}>{formatPercentage(part.grossMarginPercent)}</NumberCell>
      </tr>)}</tbody>
    </TableShell>
  </AnalyticsSection>
}

function AnalyticsSection({ summary, distributionTitle, distribution, emptyText, isEmpty, children }: {
  summary: Array<{ label: string; value: ReactNode; negative?: boolean }>
  distributionTitle: string
  distribution: DistributionItem[]
  emptyText: string
  isEmpty: boolean
  children: ReactNode
}) {
  return <div className="space-y-8">
    <SummaryStrip items={summary} />
    {isEmpty ? <EmptyState text={emptyText} /> : <>
      <Distribution title={distributionTitle} items={distribution} />
      <section><h3 className="mb-3 text-base font-semibold">Подробные данные</h3>{children}</section>
    </>}
  </div>
}

function SummaryStrip({ items }: { items: Array<{ label: string; value: ReactNode; negative?: boolean }> }) {
  return <dl className="grid grid-cols-1 divide-y rounded-xl bg-muted/45 ring-1 ring-foreground/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
    {items.map((item) => <div key={item.label} className="px-5 py-4"><dt className="text-xs font-medium text-muted-foreground">{item.label}</dt><dd className={`mt-1 text-xl font-semibold tabular-nums ${item.negative ? 'text-destructive' : ''}`}>{item.value}</dd></div>)}
  </dl>
}

type DistributionItem = { id: string; label: string; value: string; percent: number }

function Distribution({ title, items }: { title: string; items: DistributionItem[] }) {
  return <section>
    <h3 className="mb-4 text-base font-semibold">{title}</h3>
    <div className="space-y-4">{items.map((item) => <div key={item.id}>
      <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm"><span className="truncate font-medium">{item.label}</span><span className="shrink-0 tabular-nums">{item.value} <span className="ml-2 text-muted-foreground">{formatPercentage(item.percent)}</span></span></div>
      <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${clampPercent(item.percent)}%` }} /></div>
    </div>)}</div>
  </section>
}

function UnpaidOrders({ data, onOpen }: { data: WeeklyStatisticsDetails; onOpen: (eventId: string) => void }) {
  const total = sum(data.unpaidOrders.map((order) => order.totalCost))
  return <section className="border-t pt-8">
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-lg font-semibold">Неоплаченные заказы</h2><p className="text-sm text-muted-foreground">{data.unpaidOrders.length} заказов · {formatEventPrice(total)}</p></div>
    {!data.unpaidOrders.length ? <EmptyState text="Все заказы за выбранный период оплачены" /> : <div className="divide-y rounded-xl ring-1 ring-foreground/10">
      {data.unpaidOrders.map((order) => <button key={order.eventId} type="button" className="grid w-full gap-3 px-4 py-4 text-left transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-muted/55 focus-visible:bg-muted/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-center sm:px-5" onClick={() => onOpen(order.eventId)}>
        <time className="text-sm font-medium tabular-nums" dateTime={order.startTime}>{format(new Date(order.startTime), 'd MMM · HH:mm', { locale: ru })}</time>
        <span className="min-w-0"><span className="block truncate font-medium">{order.title}</span><span className="mt-0.5 block truncate text-sm text-muted-foreground">{order.clientName ?? 'Клиент не указан'} · {order.carName ?? 'Автомобиль не указан'}</span><span className="mt-1 block text-xs text-muted-foreground">Работы {formatEventPrice(order.workTotal)} · Запчасти {formatEventPrice(order.partsTotal)}</span></span>
        <span className="flex items-center justify-between gap-3 sm:justify-end"><span className="font-semibold tabular-nums">{formatEventPrice(order.totalCost)}</span><ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" /></span>
      </button>)}
    </div>}
  </section>
}

function DetailsError({ onRetry }: { onRetry: () => void }) {
  return <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-background px-6 text-center"><h2 className="text-lg font-semibold">Не удалось загрузить подробную статистику</h2><p className="mt-1 text-sm text-muted-foreground">Проверьте соединение и повторите запрос.</p><Button className="mt-5" variant="outline" onClick={onRetry}><RefreshCw /> Повторить</Button></div>
}

function TableShell({ children, minWidth }: { children: ReactNode; minWidth: string }) {
  return <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10"><table className={`w-full text-left text-sm ${minWidth}`}>{children}</table></div>
}

function NameHeading({ children }: { children: ReactNode }) { return <th className="bg-muted/50 px-4 py-3 font-medium text-muted-foreground">{children}</th> }
function NumberHeading({ children }: { children: ReactNode }) { return <th className="bg-muted/50 px-4 py-3 text-right font-medium text-muted-foreground">{children}</th> }
function NameCell({ children }: { children: ReactNode }) { return <td className="px-4 py-3 font-medium">{children}</td> }
function NumberCell({ children, negative = false }: { children: ReactNode; negative?: boolean }) { return <td className={`px-4 py-3 text-right tabular-nums ${negative ? 'text-destructive' : ''}`}>{children}</td> }
function EmptyState({ text }: { text: string }) { return <p className="rounded-xl bg-muted/50 px-4 py-10 text-center text-sm text-muted-foreground">{text}</p> }

function DetailedSkeleton() {
  return <div className="space-y-8 animate-pulse" aria-label="Загрузка подробной статистики">
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-foreground/10 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="bg-muted/45 px-5 py-4"><div className="h-3 w-24 rounded bg-muted" /><div className="mt-3 h-6 w-32 rounded bg-muted" /></div>)}</div>
    <div><div className="h-5 w-64 rounded bg-muted" /><div className="mt-5 space-y-4">{Array.from({ length: 4 }, (_, index) => <div key={index}><div className="h-4 rounded bg-muted" /><div className="mt-2 h-2 rounded bg-muted" /></div>)}</div></div>
    <div><div className="h-5 w-44 rounded bg-muted" /><div className="mt-4 h-64 rounded-xl bg-muted/60" /></div>
    <div className="border-t pt-8"><div className="h-6 w-56 rounded bg-muted" /><div className="mt-4 h-48 rounded-xl bg-muted/60" /></div>
  </div>
}

function formatPriceRange(min: number, max: number) { return min === max ? formatEventPrice(min) : `${formatEventPrice(min)}–${formatEventPrice(max)}` }
function sum(values: number[]) { return values.reduce((total, value) => total + value, 0) }
function clampPercent(value: number) { return Math.min(100, Math.max(0, value)) }
