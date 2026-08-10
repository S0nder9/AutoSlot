'use client'

import { useCallback } from 'react'
import { useScheduleNameForm } from '@/hooks/use-schedule-name-form'
import type { Schedule } from '@/lib/schedule-types'

export function useEditScheduleForm(
  schedule: Schedule,
  onUpdate: (schedule: Schedule, name: string) => Promise<boolean>,
  onSuccess: () => void,
) {
  const updateCurrentSchedule = useCallback(
    (name: string) => onUpdate(schedule, name),
    [onUpdate, schedule],
  )

  return useScheduleNameForm(schedule.name, updateCurrentSchedule, onSuccess)
}
