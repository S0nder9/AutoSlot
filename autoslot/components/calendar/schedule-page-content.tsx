'use client'

import { useSearchParams } from 'next/navigation'
import { SelectedScheduleCalendar } from '@/components/calendar/selected-schedule-calendar'
import { ProfileDashboard } from '@/components/dashboard/profile-dashboard'

export function SchedulePageContent() {
  const scheduleId = useSearchParams().get('scheduleId')

  return scheduleId ? (
    <SelectedScheduleCalendar key={scheduleId} scheduleId={scheduleId} />
  ) : (
    <ProfileDashboard />
  )
}
