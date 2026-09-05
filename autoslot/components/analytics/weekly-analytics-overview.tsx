'use client'

import { useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  Banknote,
  BarChart3,
  CalendarCheck2,
  CarFront,
  CircleDollarSign,
  Eye,
  EyeOff,
  Package,
  ReceiptText,
  RefreshCw,
  UserRound,
  UsersRound,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WeeklyAnalyticsDetails } from '@/components/analytics/weekly-analytics-details'
import { AnalyticsPeriodSelector } from '@/components/analytics/employee-analytics-period'
import { useAnalyticsPeriod } from '@/hooks/use-employee-analytics-period'
import { useScheduleStatistics } from '@/hooks/use-schedule-weekly-statistics'
import { useSchedules } from '@/hooks/use-schedules'
import { formatEventPrice } from '@/lib/format-event'
import type { StatisticsOverview } from '@/lib/statistics-types'

type AnalyticsTab = 'overview' | 'details'

export function WeeklyAnalyticsOverview() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scheduleId = searchParams.get('scheduleId') ?? ''
  const schedules = useSchedules()
  const periodModel = useAnalyticsPeriod()
  const activeTab: AnalyticsTab = searchParams.get('tab') === 'details' ? 'details' : 'overview'
  const range = periodModel.range
  const statistics = useScheduleStatistics(
    scheduleId,
    activeTab === 'overview' ? range : null,
  )
  const customRangeError = periodModel.period === 'custom' && !range

  const changeTab = (nextTab: AnalyticsTab) => {
    const url = new URL(window.location.href)
    url.searchParams.set('tab', nextTab)
    window.history.replaceState(null, '', `${url.pathname}${url.search}`)
  }

  const changeSchedule = (nextScheduleId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (nextScheduleId) params.set('scheduleId', nextScheduleId)
    else params.delete('scheduleId')
    router.replace(`/dashboard/analytics${params.size ? `?${params.toString()}` : ''}`)
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Аналитика</h1>
          <p className="mt-1 text-sm text-muted-foreground">Обзор показателей автосервиса за выбранный период</p>
        </div>
        <label className="w-full space-y-2 text-sm font-medium sm:w-80">
          Календарь
          <select
            value={scheduleId}
            onChange={(event) => changeSchedule(event.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Выберите календарь</option>
            {schedules.schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>{schedule.name}</option>
            ))}
          </select>
        </label>
      </div>

      <section className="mt-8" aria-labelledby="statistics-period-title">
        <h2 id="statistics-period-title" className="sr-only">Период статистики</h2>
        <AnalyticsPeriodSelector
          value={periodModel}
          isFetching={activeTab === 'overview' && statistics.isFetching}
        />

        <div className="mx-auto mt-6 flex w-fit rounded-lg border bg-background p-1" role="tablist" aria-label="Раздел аналитики">
          <Button size="sm" variant={activeTab === 'overview' ? 'default' : 'ghost'} role="tab" aria-selected={activeTab === 'overview'} onClick={() => changeTab('overview')}>Обзор</Button>
          <Button size="sm" variant={activeTab === 'details' ? 'default' : 'ghost'} role="tab" aria-selected={activeTab === 'details'} onClick={() => changeTab('details')}>Подробно</Button>
        </div>

        {!scheduleId ? (
          <AnalyticsMessage title="Выберите календарь" text="Статистика каждого календаря загружается отдельно." />
        ) : activeTab === 'details' && range ? (
          <WeeklyAnalyticsDetails key={scheduleId} scheduleId={scheduleId} range={range} />
        ) : customRangeError ? null : statistics.isLoading ? (
          <AnalyticsSkeleton />
        ) : statistics.error ? (
          <AnalyticsMessage
            title="Не удалось загрузить статистику"
            text="Проверьте соединение и повторите запрос."
            action={<Button variant="outline" onClick={() => void statistics.refetch()}><RefreshCw /> Повторить</Button>}
          />
        ) : statistics.data ? (
          <AnalyticsContent statistics={statistics.data} bucket={periodModel.bucket} />
        ) : null}
      </section>
    </main>
  )
}

function AnalyticsContent({ statistics, bucket }: { statistics: StatisticsOverview; bucket: 'day' | 'month' }) {
  const [showCostMetrics, setShowCostMetrics] = useState(false)
  const kpis = [
    { label: 'Стоимость заказов', value: formatEventPrice(statistics.ordersTotal), hint: 'За выбранный период', icon: <ReceiptText /> },
    { label: 'Заказов', value: String(statistics.ordersCount), hint: 'За выбранный период', icon: <CalendarCheck2 /> },
    { label: 'Статус оплаты', value: `${statistics.paidOrdersCount} / ${statistics.unpaidOrdersCount}`, hint: 'Оплачено / Не оплачено', icon: <CircleDollarSign /> },
    { label: 'Клиенты', value: String(statistics.uniqueClientsCount), hint: 'Уникальных за период', icon: <UsersRound /> },
    { label: 'Автомобили', value: String(statistics.uniqueCarsCount), hint: 'Обслужено за период', icon: <CarFront /> },
    { label: 'Сотрудники', value: String(statistics.employeesCount), hint: 'Задействовано', icon: <UserRound /> },
  ]
  const publicFinances = [
    { label: 'Работы', value: statistics.workTotal, icon: <Wrench /> },
    { label: 'Запчасти', value: statistics.partsTotal, icon: <Package /> },
  ]
  const costFinances = [
    { label: 'Себестоимость запчастей', value: statistics.partsCostTotal, icon: <Banknote /> },
    { label: 'Маржа запчастей', value: statistics.partsGrossMargin, icon: <CircleDollarSign /> },
  ]
  const maximumDailyTotal = Math.max(0, ...statistics.days.map(({ ordersTotal }) => ordersTotal))

  return <div className="mt-8 space-y-6">
    {statistics.ordersCount === 0 && <p className="rounded-lg bg-muted/60 px-4 py-3 text-center text-sm text-muted-foreground">За выбранный период заказов нет</p>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {kpis.map((item) => <Card key={item.label} className="min-h-36 border-l-2 border-l-primary/40">
        <CardHeader className="grid-cols-[1fr_auto] items-center">
          <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
          <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">{item.icon}</span>
        </CardHeader>
        <CardContent className="mt-auto">
          <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{item.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
        </CardContent>
      </Card>)}
    </div>

    <Card>
      <CardHeader className="grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div><CardTitle>{bucket === 'month' ? 'Заказы по месяцам' : 'Заказы по дням'}</CardTitle><p className="mt-1 text-xs text-muted-foreground">Количество и стоимость заказов за каждый {bucket === 'month' ? 'месяц' : 'день'} периода</p></div>
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"><BarChart3 className="size-4" /></span>
      </CardHeader>
      <CardContent>
        {statistics.days.length ? <div className="max-h-[36rem] space-y-4 overflow-y-auto pr-2">
          {statistics.days.map((day) => {
            const date = parseApiCalendarDate(day.date)
            const width = maximumDailyTotal > 0 && day.ordersTotal > 0
              ? Math.max(4, (day.ordersTotal / maximumDailyTotal) * 100)
              : 0
            return <div key={day.date} className="grid gap-2 sm:grid-cols-[minmax(110px,0.8fr)_minmax(180px,2fr)_auto] sm:items-center sm:gap-4">
              <div>
                <p className="text-sm font-medium capitalize">{format(date, bucket === 'month' ? 'LLLL' : 'EEEE', { locale: ru })}</p>
                <p className="text-xs text-muted-foreground">{format(date, bucket === 'month' ? 'yyyy' : 'd MMMM', { locale: ru })}</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true"><div className="h-full rounded-full bg-primary/70 transition-[width]" style={{ width: `${width}%` }} /></div>
              <div className="flex items-baseline justify-between gap-4 sm:block sm:min-w-32 sm:text-right"><p className="text-sm font-semibold">{formatEventPrice(day.ordersTotal)}</p><p className="text-xs text-muted-foreground">Заказов: {day.ordersCount}</p></div>
            </div>
          })}
        </div> : <p className="text-sm text-muted-foreground">Данные по дням отсутствуют.</p>}
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <CardTitle>Финансовая сводка</CardTitle>
        <Button
          size="sm"
          variant="ghost"
          aria-expanded={showCostMetrics}
          onClick={() => setShowCostMetrics((visible) => !visible)}
        >
          {showCostMetrics ? <EyeOff /> : <Eye />}
          {showCostMetrics ? 'Скрыть себестоимость и маржу' : 'Показать себестоимость и маржу'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-x-6 gap-y-5 sm:grid-cols-2 ${showCostMetrics ? 'xl:grid-cols-4' : ''}`}>
          {[...publicFinances, ...(showCostMetrics ? costFinances : [])].map((item) => <div key={item.label} className="flex min-w-0 gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">{item.icon}</span>
            <div className="min-w-0"><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-1 text-lg font-semibold">{formatEventPrice(item.value)}</p></div>
          </div>)}
        </div>
      </CardContent>
    </Card>
  </div>
}

function AnalyticsSkeleton() {
  return <div className="mt-8 space-y-6" aria-label="Загрузка статистики">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => <Card key={index} className="min-h-36 animate-pulse"><CardContent><div className="h-4 w-32 rounded bg-muted" /><div className="mt-8 h-8 w-40 rounded bg-muted" /><div className="mt-3 h-3 w-28 rounded bg-muted" /></CardContent></Card>)}
    </div>
    <Card className="animate-pulse"><CardContent><div className="h-5 w-40 rounded bg-muted" /><div className="mt-8 space-y-5">{Array.from({ length: 7 }, (_, index) => <div key={index} className="grid grid-cols-[100px_1fr_100px] items-center gap-4"><div className="h-4 rounded bg-muted" /><div className="h-2 rounded bg-muted" /><div className="h-4 rounded bg-muted" /></div>)}</div></CardContent></Card>
    <Card className="animate-pulse"><CardContent><div className="h-5 w-44 rounded bg-muted" /><div className="mt-8 grid gap-5 sm:grid-cols-2">{Array.from({ length: 2 }, (_, index) => <div key={index}><div className="h-3 w-28 rounded bg-muted" /><div className="mt-3 h-6 w-32 rounded bg-muted" /></div>)}</div></CardContent></Card>
  </div>
}

function AnalyticsMessage({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-background px-6 text-center"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>{action && <div className="mt-5">{action}</div>}</div>
}

function parseApiCalendarDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}
