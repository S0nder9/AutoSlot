'use client'

import { useCallback, useState } from 'react'
import type { Schedule } from '@/lib/schedule-types'

export function useScheduleDialogs() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null)

  const openCreate = useCallback(() => setIsCreateOpen(true), [])
  const closeCreate = useCallback(() => setIsCreateOpen(false), [])
  const openEdit = useCallback((schedule: Schedule) => setEditingSchedule(schedule), [])
  const closeEdit = useCallback(() => setEditingSchedule(null), [])
  const openDelete = useCallback(
    (schedule: Schedule) => setDeletingSchedule(schedule),
    [],
  )
  const closeDelete = useCallback(() => setDeletingSchedule(null), [])

  return {
    isCreateOpen,
    editingSchedule,
    deletingSchedule,
    openCreate,
    closeCreate,
    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
  }
}
