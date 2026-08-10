'use client'

import { useCallback, type MouseEvent } from 'react'
import type { Schedule } from '@/lib/schedule-types'

export function useScheduleCardActions(
  schedule: Schedule,
  onEdit: (schedule: Schedule) => void,
  onDelete: (schedule: Schedule) => void,
) {
  const handleEdit = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onEdit(schedule)
    },
    [onEdit, schedule],
  )
  const handleDelete = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onDelete(schedule)
    },
    [onDelete, schedule],
  )

  return { handleEdit, handleDelete }
}
