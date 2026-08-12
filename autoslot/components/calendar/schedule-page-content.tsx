'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { SelectedScheduleCalendar } from '@/components/calendar/selected-schedule-calendar'
import { ProfileDashboard } from '@/components/dashboard/profile-dashboard'
import {
  formatCalendarDate,
  parseCalendarDate,
  parseCalendarView,
  type CalendarView,
} from '@/lib/calendar-navigation'

export function SchedulePageContent() {
  const searchParams = useSearchParams()
  const scheduleId = searchParams.get('scheduleId')
  const rawDate = searchParams.get('date')
  const rawView = searchParams.get('view')
  const initialDate = useMemo(
    () => parseCalendarDate(rawDate) ?? new Date(),
    [rawDate],
  )
  const initialView = parseCalendarView(rawView)
  const normalizedDate = formatCalendarDate(initialDate)

  const replaceCalendarState = useCallback(
    (date: Date, view: CalendarView) => {
      const url = new URL(window.location.href)
      url.searchParams.set('date', formatCalendarDate(date))
      url.searchParams.set('view', view)

      window.history.replaceState(
        window.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`,
      )
    },
    [],
  )

  useEffect(() => {
    if (
      scheduleId &&
      (rawDate !== normalizedDate || rawView !== initialView)
    ) {
      replaceCalendarState(initialDate, initialView)
    }
  }, [
    initialDate,
    initialView,
    normalizedDate,
    rawDate,
    rawView,
    replaceCalendarState,
    scheduleId,
  ])

  return scheduleId ? (
    <SelectedScheduleCalendar
      key={scheduleId}
      scheduleId={scheduleId}
      initialDate={initialDate}
      initialView={initialView}
      onCalendarStateChange={replaceCalendarState}
    />
  ) : (
    <ProfileDashboard />
  )
}
