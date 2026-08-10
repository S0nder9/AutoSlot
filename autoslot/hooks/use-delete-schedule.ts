'use client'

import { useCallback } from 'react'
import type { Schedule } from '@/lib/schedule-types'

export function useDeleteSchedule(
  schedule: Schedule,
  onDelete: (schedule: Schedule) => Promise<boolean>,
  onSuccess: () => void,
) {
  return useCallback(async () => {
    if (await onDelete(schedule)) {
      onSuccess()
    }
  }, [onDelete, onSuccess, schedule])
}
