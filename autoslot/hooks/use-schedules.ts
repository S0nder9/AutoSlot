'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { getApiSessionVersion } from '@/lib/api'
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
  const router = useRouter()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['schedules'], queryFn: ({ signal }) => getSchedules(signal), staleTime: 30_000, retry: false })
  const schedules = query.data ?? []
  const isLoading = query.isPending
  const setSchedules = useCallback((update: (current: Schedule[]) => Schedule[]) => {
    queryClient.setQueryData<Schedule[]>(['schedules'], (current) => current ? update(current) : current)
  }, [queryClient])
  const createLock = useRef(false)
  const changeLock = useRef(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const reload = query.refetch

  useEffect(() => {
    if (query.error) toast.error(getRequestError(query.error, 'Не удалось загрузить календари.'))
  }, [query.error])

  const create = useCallback(
    async (name: string) => {
      if (createLock.current) return false
      createLock.current = true
      setIsCreating(true)
      const version = getApiSessionVersion()
      try {
        const schedule = await createSchedule(name)
        await queryClient.cancelQueries({ queryKey: ['schedules'], exact: true })
        if (version !== getApiSessionVersion()) return false
        if (schedule && queryClient.getQueryData(['schedules'])) {
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
        createLock.current = false
        setIsCreating(false)
      }
    },
    [queryClient, reload, setSchedules],
  )

  const update = useCallback(async (schedule: Schedule, name: string) => {
    if (changeLock.current) return false
    changeLock.current = true
    setPendingId(schedule.id)
    const version = getApiSessionVersion()
    try {
      const updated = await updateSchedule(schedule.id, name)
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['schedules'], exact: true }),
        queryClient.cancelQueries({ queryKey: ['schedules', schedule.id], exact: true }),
      ])
      if (version !== getApiSessionVersion()) return false
      setSchedules((current) =>
        current.map((item) =>
          item.id === schedule.id ? (updated ?? { ...item, name }) : item,
        ),
      )
      queryClient.setQueryData<Schedule>(['schedules', schedule.id], (current) => current ? { ...current, ...updated, name: updated?.name ?? name } : current)
      for (const key of [['schedules'], ['schedules', schedule.id]]) {
        if (queryClient.getQueryData(key) === undefined) void queryClient.refetchQueries({ queryKey: key, exact: true, type: 'active' })
      }
      toast.success('Название обновлено')
      return true
    } catch (error) {
      toast.error(getRequestError(error, 'Не удалось обновить календарь.'))
      return false
    } finally {
      changeLock.current = false
      setPendingId(null)
    }
  }, [queryClient, setSchedules])

  const remove = useCallback(async (schedule: Schedule) => {
    if (changeLock.current) return false
    changeLock.current = true
    setPendingId(schedule.id)
    const version = getApiSessionVersion()
    try {
      await deleteSchedule(schedule.id)
      await queryClient.cancelQueries({ predicate: ({ queryKey }) => queryKey[1] === schedule.id })
      await queryClient.cancelQueries({ queryKey: ['schedules'], exact: true })
      if (version !== getApiSessionVersion()) return false
      queryClient.removeQueries({ predicate: ({ queryKey }) => queryKey[1] === schedule.id })
      setSchedules((current) => current.filter(({ id }) => id !== schedule.id))
      const url = new URL(window.location.href)
      if (url.searchParams.get('scheduleId') === schedule.id) {
        url.searchParams.delete('scheduleId')
        router.replace(`/dashboard/schedule${url.search}`)
      }
      toast.success('Календарь удалён')
      return true
    } catch (error) {
      toast.error(getRequestError(error, 'Не удалось удалить календарь.'))
      return false
    } finally {
      changeLock.current = false
      setPendingId(null)
    }
  }, [queryClient, router, setSchedules])

  return { schedules, isLoading, error: query.error, reload, isCreating, pendingId, create, update, remove }
}
