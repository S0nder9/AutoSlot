'use client'

import { useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { addDays, addMonths, addWeeks, addYears, differenceInCalendarDays, format, startOfDay } from 'date-fns'
import { getStatisticsRange, parseStatisticsDate, STATISTICS_PERIOD_LABELS } from '@/lib/statistics-period'
import type { StatisticsPeriod } from '@/lib/statistics-types'
import type { EmployeeStatisticsBucket } from '@/lib/employee-statistics-types'

export function useEmployeeAnalyticsPeriod() {
  const params = useSearchParams()
  const pathname = usePathname()
  const todayText = format(new Date(), 'yyyy-MM-dd')
  const requestedPeriod = params.get('period') ?? 'week'
  const period: StatisticsPeriod = Object.hasOwn(STATISTICS_PERIOD_LABELS, requestedPeriod) ? requestedPeriod as StatisticsPeriod : 'week'
  const dateText = params.get('date') ?? todayText
  const date = useMemo(() => parseStatisticsDate(dateText) ?? startOfDay(new Date()), [dateText])
  const customStart = params.get('from') ?? todayText
  const customEnd = params.get('to') ?? todayText
  const range = useMemo(() => getStatisticsRange(period, date, customStart, customEnd), [period, date, customStart, customEnd])
  const bucket: EmployeeStatisticsBucket = period === 'year' || (period === 'custom' && range && differenceInCalendarDays(range.end, range.start) > 62) ? 'month' : 'day'

  function replace(values: Record<string, string>) {
    const url = new URL(window.location.href)
    Object.entries(values).forEach(([key, value]) => url.searchParams.set(key, value))
    // Passing history.state forwards Next's __NA flag and bypasses its URL sync.
    // Next copies its internal state itself when called with null.
    window.history.replaceState(null, '', `${pathname}${url.search}${url.hash}`)
  }

  function shift(amount: number) {
    // Read the latest URL: fast clicks can happen before the router re-renders.
    const latest = new URLSearchParams(window.location.search)
    const currentDate = parseStatisticsDate(latest.get('date') ?? '') ?? startOfDay(new Date())
    const currentPeriod = latest.get('period') ?? period
    const next = currentPeriod === 'day' ? addDays(currentDate, amount) : currentPeriod === 'month' ? addMonths(currentDate, amount) : currentPeriod === 'year' ? addYears(currentDate, amount) : addWeeks(currentDate, amount)
    replace({ date: format(next, 'yyyy-MM-dd') })
  }

  return {
    period, date, customStart, customEnd, range, bucket, shift,
    changePeriod: (value: StatisticsPeriod) => replace({ period: value }),
    applyCustom: (from: string, to: string) => {
      if (getStatisticsRange('custom', date, from, to)) replace({ from, to })
    },
    reset: () => replace({ date: todayText, ...(period === 'custom' ? { from: todayText, to: todayText } : {}) }),
  }
}

// Analytics pages share one URL-backed period model. Keep the old export for
// compatibility with the employee page while new screens use the generic name.
export const useAnalyticsPeriod = useEmployeeAnalyticsPeriod
