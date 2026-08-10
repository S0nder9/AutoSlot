'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Schedule } from '@/lib/schedule-types'
import {
  createSchedule,
  deleteSchedule,
  getSchedules,
  updateSchedule,
} from '@/lib/services/schedules'
import { getRequestError } from '@/lib/request-error'

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const reload = useCallback(async () => {
    try {
      setSchedules(await getSchedules())
    } catch (error) {
      toast.error(getRequestError(error, 'Не удалось загрузить календари.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void getSchedules()
      .then(setSchedules)
      .catch((error) => {
        toast.error(getRequestError(error, 'Не удалось загрузить календари.'))
      })
      .finally(() => setIsLoading(false))
  }, [])

  const create = useCallback(
    async (name: string) => {
      setIsCreating(true)
      try {
        const schedule = await createSchedule(name)
        if (schedule) {
          setSchedules((current) => [schedule, ...current])
        } else {
          await reload()
        }
        toast.success('Календарь создан')
        return true
      } catch (error) {
        toast.error(getRequestError(error, 'Не удалось создать календарь.'))
        return false
      } finally {
        setIsCreating(false)
      }
    },
    [reload],
  )

  const update = useCallback(async (schedule: Schedule, name: string) => {
    setPendingId(schedule.id)
    try {
      const updated = await updateSchedule(schedule.id, name)
      setSchedules((current) =>
        current.map((item) =>
          item.id === schedule.id ? (updated ?? { ...item, name }) : item,
        ),
      )
      toast.success('Название обновлено')
      return true
    } catch (error) {
      toast.error(getRequestError(error, 'Не удалось обновить календарь.'))
      return false
    } finally {
      setPendingId(null)
    }
  }, [])

  const remove = useCallback(async (schedule: Schedule) => {
    setPendingId(schedule.id)
    try {
      await deleteSchedule(schedule.id)
      setSchedules((current) => current.filter(({ id }) => id !== schedule.id))
      toast.success('Календарь удалён')
      return true
    } catch (error) {
      toast.error(getRequestError(error, 'Не удалось удалить календарь.'))
      return false
    } finally {
      setPendingId(null)
    }
  }, [])

  return { schedules, isLoading, isCreating, pendingId, create, update, remove }
}
