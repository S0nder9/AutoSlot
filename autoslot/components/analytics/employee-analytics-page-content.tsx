'use client'

import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowLeft, Info, Loader2, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmployeeAnalyticsPeriod } from '@/components/analytics/employee-analytics-period'
import { EmployeeWorkPercentForm } from '@/components/analytics/employee-work-percent-form'
import { EventDetailsDialog } from '@/components/calendar/event-details-dialog'
import { useEventDetails } from '@/hooks/use-event-details'
import { useEmployeeAnalyticsPeriod } from '@/hooks/use-employee-analytics-period'
import { useEmployeeStatistics } from '@/hooks/use-employee-statistics'
import { formatEmployeeName } from '@/lib/employee-types'
import { formatEventDate, formatEventPrice, formatPercentage } from '@/lib/format-event'
import { parseStatisticsDate } from '@/lib/statistics-period'
import { getRequestError } from '@/lib/request-error'
import type { EmployeeStatistics, EmployeeStatisticsBucket } from '@/lib/employee-statistics-types'
import type { StatisticsPeriod } from '@/lib/statistics-types'
import { useState, type ReactNode } from 'react'

export function EmployeeAnalyticsPageContent() {
  const { employeeId } = useParams<{ employeeId: string }>()
  const params = useSearchParams()
  const scheduleId = params.get('scheduleId') ?? ''
  if (!scheduleId) return <main className="p-8"><h1 className="text-xl font-semibold">Выберите календарь сотрудника</h1><Link href="/dashboard/employees" className="mt-3 inline-block text-sm underline">К сотрудникам</Link></main>
  return <EmployeeAnalyticsScreen key={`${scheduleId}:${employeeId}`} scheduleId={scheduleId} employeeId={employeeId} />
}

function EmployeeAnalyticsScreen({ scheduleId, employeeId }: { scheduleId: string; employeeId: string }) {
  const router = useRouter()
  const period = useEmployeeAnalyticsPeriod()
  const { employee, analytics, history, entries } = useEmployeeStatistics(scheduleId, employeeId, period.range, period.bucket)
  const employeesHref = `/dashboard/employees?${new URLSearchParams({ scheduleId })}`
  const employeeName = employee.data ? formatEmployeeName(employee.data) : analytics.data?.employee.employeeName
  const active = employee.data?.isActive ?? analytics.data?.employee.isActive
  const [workView, setWorkView] = useState<'jobs' | 'history'>('jobs')
  const details = useEventDetails(scheduleId)

  return <main className="mx-auto w-full min-w-0 max-w-7xl space-y-6 px-5 py-6 sm:px-8">
    <header>
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" onClick={() => window.history.length > 1 ? router.back() : router.push(employeesHref)}><ArrowLeft /> Назад</Button>
        <Link href={employeesHref} className="text-sm text-muted-foreground hover:text-foreground">Сотрудники</Link>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3 py-2">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400"><UserRound className="size-5" /></span>
          <div className="min-w-0"><p className="mb-1 text-xs text-muted-foreground">Статистика сотрудника</p>
            <div className="flex flex-wrap items-center gap-2"><h1 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">{employeeName ?? 'Загрузка…'}</h1>{active === false && <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">Неактивен</span>}</div>
          </div>
        </div>
        {employee.isPending ? <SectionSkeleton label="Загрузка сотрудника" className="h-20 w-64" /> : employee.data ? <EmployeeWorkPercentForm key={`${employee.data.id}:${employee.data.workPercent}`} scheduleId={scheduleId} employee={employee.data} /> : <QueryError title="Не удалось загрузить настройки сотрудника" error={employee.error} onRetry={() => void employee.refetch()} />}
      </div>
    </header>

    <EmployeeAnalyticsPeriod value={period} isFetching={analytics.isFetching || history.isFetching} />

    {period.range && <>
      {analytics.isPending ? <AnalyticsSkeleton /> : analytics.error ? <QueryError title="Не удалось загрузить статистику сотрудника" error={analytics.error} onRetry={() => void analytics.refetch()} /> : analytics.data ? <>
        {analytics.data.summary.jobsCount === 0 && <EmptyState>У сотрудника нет работ за выбранный период</EmptyState>}
        <Summary data={analytics.data} />
        <Timeline data={analytics.data} period={period.period} bucket={period.bucket} />
      </> : null}

      <section className="space-y-4 border-t pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Детализация работ</h2>
          <div className="flex gap-1 rounded-lg bg-muted/50 p-1" aria-label="Вид детализации">
            <Button size="sm" variant="ghost" className={workView === 'jobs' ? 'bg-background shadow-sm' : 'text-muted-foreground'} aria-pressed={workView === 'jobs'} onClick={() => setWorkView('jobs')}>По видам работ</Button>
            <Button size="sm" variant="ghost" className={workView === 'history' ? 'bg-background shadow-sm' : 'text-muted-foreground'} aria-pressed={workView === 'history'} onClick={() => setWorkView('history')}>Все записи</Button>
          </div>
        </div>
        {workView === 'jobs' ? analytics.data && !analytics.error ? <JobsBreakdown data={analytics.data} /> : analytics.isPending ? <SectionSkeleton label="Загрузка работ за период" className="h-36" /> : <EmptyState>Детализация будет доступна после загрузки статистики.</EmptyState> : <>
        <p className="text-xs text-muted-foreground">Каждая выполненная работа и ставка на момент её добавления. По 50 записей за загрузку.</p>
        {history.isPending ? <SectionSkeleton label="Загрузка истории работ" className="h-64" /> : <>
          {entries.length > 0 ? <TableSurface label="История работ" minWidth="min-w-[1050px]">
            <thead><tr>{['Дата', 'Работа', 'Заказ / автомобиль', 'Цена работы', 'Процент', 'К выплате'].map((title, index) => <th key={title} className={index >= 3 ? 'text-right' : 'text-left'}>{title}</th>)}</tr></thead>
            <tbody>{entries.map(({ entry, key }) => <tr key={key}>
              <td className="whitespace-nowrap text-muted-foreground">{formatEventDate(entry.eventStartTime)}</td>
              <td className="font-medium">{entry.jobName}</td>
              <td><button type="button" className="text-left font-medium underline-offset-4 hover:underline" onClick={() => void details.open({ id: entry.eventId })}>{entry.eventTitle}</button><span className="block text-xs text-muted-foreground">{entry.carName ?? 'Автомобиль не указан'}</span><span className="block text-xs text-muted-foreground">{entry.clientName ?? 'Клиент не указан'}</span></td>
              <MoneyCell value={entry.clientPrice} />
              <td className="text-right tabular-nums">{entry.employeePercent === null ? <span className="text-xs text-muted-foreground">Ставка не зафиксирована</span> : formatPercentage(entry.employeePercent, 2)}</td>
              <td className="text-right tabular-nums">{entry.payout === null ? <span className="text-xs text-muted-foreground">Выплата не рассчитана</span> : formatEventPrice(entry.payout)}</td>
            </tr>)}</tbody>
          </TableSurface> : !history.error ? <EmptyState>За выбранный период записей нет</EmptyState> : null}
          {history.error && <QueryError title="Не удалось загрузить историю работ" error={history.error} onRetry={() => void (history.isFetchNextPageError ? history.fetchNextPage({ cancelRefetch: false }) : history.refetch())} />}
          {history.hasNextPage && <div className="flex justify-center"><Button variant="outline" disabled={history.isFetching} onClick={() => void history.fetchNextPage({ cancelRefetch: false })}>{history.isFetchingNextPage && <Loader2 className="animate-spin" />} Показать ещё</Button></div>}
        </>}
        </>}
      </section>
    </>}
    {details.isOpen && <EventDetailsDialog scheduleId={scheduleId} event={details.event} isLoading={details.isLoading} isUpdating={false} isDeleting={false} isTimeMutationPending={false} readOnly onClose={details.close} />}
  </main>
}

function Summary({ data }: { data: EmployeeStatistics }) {
  const summary = data.summary
  const hasLegacy = summary.uncalculatedJobsCount > 0
  const items = [
    { label: 'Заказов', value: summary.ordersCount },
    { label: 'Выполнено работ', value: summary.jobsCount },
    { label: 'Средняя цена работы', value: formatEventPrice(summary.averageJobPrice) },
    { label: 'Средняя выплата', value: summary.calculatedJobsCount ? formatEventPrice(summary.averagePayout) : '—' },
  ]
  return <section className="overflow-hidden rounded-xl border bg-background" aria-label="Итоги за выбранный период">
    <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
      <div className="p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">Работы на сумму</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{formatEventPrice(summary.workSalesTotal)}</p>
        <p className="mt-2 text-xs text-muted-foreground">Стоимость всех работ сотрудника за период</p>
      </div>
      <div className="bg-blue-500/5 p-5 sm:p-6">
        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">К выплате</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{formatEventPrice(summary.payoutTotal)}</p>
        <p className="mt-2 text-xs text-muted-foreground">{summary.calculatedJobsCount ? `По сохранённым ставкам · работ в расчёте: ${summary.calculatedJobsCount}` : summary.jobsCount ? 'Нет работ с сохранённой ставкой' : 'За этот период работ нет'}</p>
      </div>
    </div>
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t px-5 py-4 lg:grid-cols-4 sm:px-6">
      {items.map((item) => <div key={item.label}><dt className="text-xs text-muted-foreground">{item.label}</dt><dd className="mt-1 text-base font-semibold tabular-nums">{item.value}</dd></div>)}
    </dl>
    {hasLegacy && <div role="note" className="flex gap-2.5 border-t bg-amber-500/5 px-5 py-3 sm:px-6">
      <Info className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400" />
      <div className="text-xs leading-relaxed"><p className="font-medium">Расчёт выплаты неполный · без ставки: {summary.uncalculatedJobsCount}</p><p className="mt-0.5 text-muted-foreground">Эти работы учтены в сумме работ, но выплата для них не рассчитана. Изменение текущей ставки не меняет старые работы.</p></div>
    </div>}
  </section>
}
function Timeline({ data, period, bucket }: { data: EmployeeStatistics; period: StatisticsPeriod; bucket: EmployeeStatisticsBucket }) {
  const maximum = Math.max(0, ...data.timeline.flatMap((point) => [point.workSalesTotal, point.payoutTotal]))
  return <section className="space-y-4 rounded-xl border p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-base font-semibold">{bucket === 'month' ? 'По месяцам' : 'По дням'}</h2><p className="mt-1 text-xs text-muted-foreground">Сумма работ и расчётная выплата</p></div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-2"><span className="size-2 rounded bg-blue-500/35" />Работы</span><span className="flex items-center gap-2"><span className="size-2 rounded bg-blue-500" />К выплате</span></div>
    </div>
    {!data.timeline.length ? <EmptyState>Нет данных для распределения за этот период</EmptyState> : <div className={`${period === 'day' || data.timeline.length === 1 ? '' : 'max-h-[32rem] overflow-y-auto pr-2'} space-y-4`}>
      {data.timeline.map((point) => {
        // periodStart identifies a calendar bucket in the requested report timezone.
        const date = parseStatisticsDate(point.periodStart.slice(0, 10))
        const label = date ? format(date, bucket === 'month' ? 'LLL yyyy' : period === 'week' ? 'EEEE, d MMM' : 'd MMM yyyy', { locale: ru }) : point.periodStart.slice(0, 10)
        return <div key={point.periodStart} className="grid gap-2 border-t pt-3 first:border-0 first:pt-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
          <div><p className="text-sm font-medium capitalize">{label}</p><p className="text-xs text-muted-foreground">Работ: {point.jobsCount} · Заказов: {point.ordersCount}</p></div>
          <div className="min-w-0 space-y-2">
            <TimelineBar label="Работы на сумму" value={point.workSalesTotal} maximum={maximum} />
            <TimelineBar label="К выплате" value={point.payoutTotal} maximum={maximum} payout />
          </div>
        </div>
      })}
    </div>}
    <p className="text-[11px] text-muted-foreground">«К выплате» — расчётная сумма за выбранный период, а не отметка о фактической выплате.</p>
  </section>
}

function TimelineBar({ label, value, maximum, payout = false }: { label: string; value: number; maximum: number; payout?: boolean }) {
  const width = maximum > 0 ? Math.min(100, Math.max(0, value / maximum * 100)) : 0
  return <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3" aria-label={`${label}: ${formatEventPrice(value)}`}>
    <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true"><div className={`h-full rounded-full ${payout ? 'bg-blue-500' : 'bg-blue-500/35'}`} style={{ width: `${width}%` }} /></div>
    <span className="min-w-24 text-right text-xs tabular-nums">{formatEventPrice(value)}</span>
  </div>
}

function JobsBreakdown({ data }: { data: EmployeeStatistics }) {
  return <section className="space-y-4">
    <p className="text-xs text-muted-foreground">Количество и стоимость по каждой работе за выбранный период.</p>
    {!data.jobs.length ? <EmptyState>У сотрудника нет работ за выбранный период</EmptyState> : <TableSurface label="Работы за период" minWidth="min-w-[1000px]">
      <thead><tr>{['Работа', 'Заказов', 'Выполнено', 'Работы на сумму', 'К выплате', 'Средняя цена', 'Средняя выплата'].map((title, index) => <th key={title} className={index ? 'text-right' : 'text-left'}>{title}</th>)}</tr></thead>
      <tbody>{data.jobs.map((job) => <tr key={`${job.jobId}:${job.jobName}`}>
        <td className="font-medium">{job.jobName}{job.uncalculatedJobsCount > 0 && <span className="mt-1 block text-xs font-normal text-muted-foreground">Без исторической ставки: {job.uncalculatedJobsCount}</span>}</td>
        <td className="text-right tabular-nums">{job.ordersCount}</td><td className="text-right tabular-nums">{job.count}</td>
        <MoneyCell value={job.workSalesTotal} /><MoneyCell value={job.payoutTotal} /><MoneyCell value={job.averageClientPrice} /><MoneyCell value={job.averagePayout} />
      </tr>)}</tbody>
    </TableSurface>}
  </section>
}

function TableSurface({ label, minWidth, children }: { label: string; minWidth: string; children: ReactNode }) {
  return <div className="overflow-x-auto rounded-xl border"><table aria-label={label} className={`w-full text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:bg-muted/40 [&_th]:px-4 [&_th]:py-3 [&_th]:font-medium [&_th]:text-muted-foreground [&_tbody_tr]:border-t ${minWidth}`}>{children}</table></div>
}

function MoneyCell({ value }: { value: number }) {
  return <td className="whitespace-nowrap text-right tabular-nums">{formatEventPrice(value)}</td>
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-muted/30 px-5 py-6 text-sm text-muted-foreground">{children}</p>
}

function QueryError({ title, error, onRetry }: { title: string; error: unknown; onRetry: () => void }) {
  return <div role="alert" className="rounded-xl bg-muted/40 p-5"><h2 className="font-medium">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{getRequestError(error, 'Проверьте соединение и повторите запрос.')}</p><Button className="mt-3" variant="outline" onClick={onRetry}>Повторить</Button></div>
}

function SectionSkeleton({ label, className }: { label: string; className: string }) {
  return <div role="status" className={`animate-pulse rounded-xl bg-muted/50 ${className}`}><span className="sr-only">{label}</span></div>
}

function AnalyticsSkeleton() {
  return <>
    <div className="rounded-xl border p-5"><div className="grid gap-4 sm:grid-cols-2"><SectionSkeleton label="Загрузка суммы работ" className="h-24" /><SectionSkeleton label="Загрузка выплаты" className="h-24" /></div><div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <SectionSkeleton key={index} label="Загрузка показателя" className="h-10" />)}</div></div>
    <SectionSkeleton label="Загрузка распределения" className="h-40" />
  </>
}
