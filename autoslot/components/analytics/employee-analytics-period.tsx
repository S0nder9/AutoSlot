'use client'

import { useState, type FormEvent } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { useAnalyticsPeriod } from '@/hooks/use-employee-analytics-period'
import { formatStatisticsRange, getStatisticsRange, STATISTICS_PERIOD_LABELS } from '@/lib/statistics-period'
import type { StatisticsPeriod } from '@/lib/statistics-types'

const CURRENT_LABELS: Record<StatisticsPeriod, string> = {
  day: 'Сегодня', week: 'Эта неделя', month: 'Этот месяц', year: 'Этот год', custom: 'Сегодня',
}

export function AnalyticsPeriodSelector({ value, isFetching }: {
  value: ReturnType<typeof useAnalyticsPeriod>
  isFetching: boolean
}) {
  const title = value.range
    ? value.period === 'month' ? format(value.range.start, 'LLLL yyyy', { locale: ru })
      : value.period === 'year' ? format(value.range.start, 'yyyy')
        : formatStatisticsRange(value.range)
    : 'Выберите даты'
  const current = getStatisticsRange(value.period, new Date(), value.customStart, value.customEnd)
  const isCurrent = value.period !== 'custom' && current?.start.getTime() === value.range?.start.getTime()

  return <section className="space-y-4 rounded-xl border bg-background p-4 sm:p-5" aria-label="Период статистики">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><CalendarDays className="size-4" />Период отчёта</div>
      <div className="flex max-w-full flex-wrap gap-1 rounded-lg bg-muted/60 p-1" aria-label="Выбор периода">
        {(Object.keys(STATISTICS_PERIOD_LABELS) as StatisticsPeriod[]).map((period) => <Button
          key={period}
          size="sm"
          variant="ghost"
          className={period === value.period ? 'bg-background text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground'}
          aria-pressed={period === value.period}
          onClick={() => value.changePeriod(period)}
        >{period === 'custom' ? 'Свои даты' : STATISTICS_PERIOD_LABELS[period]}</Button>)}
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {value.period !== 'custom' && <div className="flex shrink-0 gap-1">
          <Button variant="outline" size="icon" aria-label="Предыдущий период" onClick={() => value.shift(-1)}><ChevronLeft /></Button>
          <Button variant="outline" size="icon" aria-label="Следующий период" onClick={() => value.shift(1)}><ChevronRight /></Button>
        </div>}
        <h2 className="text-base font-semibold capitalize sm:text-xl">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <span role="status" aria-live="polite" className="flex min-h-5 items-center gap-1.5 text-xs text-muted-foreground">
          {isFetching && value.range ? <><Loader2 className="size-3.5 animate-spin" />Обновляем…</> : null}
        </span>
        <Button size="sm" variant="ghost" disabled={isCurrent} onClick={value.reset}>{CURRENT_LABELS[value.period]}</Button>
      </div>
    </div>
    {value.period === 'custom' && <CustomRangeForm key={`${value.customStart}:${value.customEnd}`} value={value} />}
  </section>
}

function CustomRangeForm({ value }: { value: ReturnType<typeof useAnalyticsPeriod> }) {
  const [from, setFrom] = useState(value.customStart)
  const [to, setTo] = useState(value.customEnd)
  const [error, setError] = useState('')
  const changed = from !== value.customStart || to !== value.customEnd

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!getStatisticsRange('custom', value.date, from, to)) {
      setError('Выберите даты по порядку. Максимальный диапазон — 366 дней.')
      return
    }
    setError('')
    value.applyCustom(from, to)
  }

  return <form onSubmit={apply} className="border-t pt-4">
    <div className="flex flex-wrap items-end gap-3">
      <label className="min-w-36 flex-1 space-y-1 text-xs text-muted-foreground">С
        <Input type="date" aria-label="Начало периода" value={from} onChange={(event) => { setFrom(event.target.value); setError('') }} />
      </label>
      <label className="min-w-36 flex-1 space-y-1 text-xs text-muted-foreground">По
        <Input type="date" aria-label="Конец периода" value={to} onChange={(event) => { setTo(event.target.value); setError('') }} />
      </label>
      <Button type="submit" disabled={!changed && Boolean(value.range)}>Применить</Button>
    </div>
    <p className="mt-2 text-xs text-muted-foreground">Обе даты включены. {changed ? 'Нажмите «Применить», чтобы обновить отчёт.' : 'До 366 дней.'}</p>
    {(error || !value.range) && <p role="alert" className="mt-2 text-xs text-destructive">{error || 'Укажите корректный диапазон и нажмите «Применить».'}</p>}
  </form>
}

export const EmployeeAnalyticsPeriod = AnalyticsPeriodSelector
