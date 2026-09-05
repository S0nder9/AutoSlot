'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Job, JobPayload } from '@/lib/job-types'
import { scheduleJobKeys } from '@/lib/job-queries'
import { reconcileCatalogMutation } from '@/lib/cache-reconciliation'
import { getRequestError } from '@/lib/request-error'
import {
  createScheduleJob,
  deleteScheduleJob,
  getScheduleJobs,
  updateScheduleJob,
} from '@/lib/services/jobs'

export function useScheduleJobs(scheduleId: string) {
  const queryClient = useQueryClient()
  const queryKey = scheduleJobKeys.schedule(scheduleId)
  const query = useQuery({
    queryKey,
    queryFn: () => getScheduleJobs(scheduleId),
    enabled: Boolean(scheduleId),
    staleTime: 30 * 1000,
    retry: false,
  })

  useEffect(() => {
    if (query.error) {
      toast.error(getRequestError(query.error, 'Не удалось загрузить работы.'))
    }
  }, [query.error])

  const createMutation = useMutation({
    mutationFn: (payload: JobPayload) => createScheduleJob(scheduleId, payload),
    onSuccess: async (job) => {
      await reconcileCatalogMutation<Job>(queryClient, queryKey, job, (a, b) => a.name.localeCompare(b.name, 'ru'))
      toast.success('Работа создана')
    },
    onError: (error) => {
      toast.error(getRequestError(error, 'Не удалось создать работу.'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: JobPayload }) =>
      updateScheduleJob(scheduleId, jobId, payload),
    onSuccess: async (job) => {
      await reconcileCatalogMutation<Job>(queryClient, queryKey, job, (a, b) => a.name.localeCompare(b.name, 'ru'))
      toast.success('Работа обновлена')
    },
    onError: (error) => {
      toast.error(getRequestError(error, 'Не удалось обновить работу.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => deleteScheduleJob(scheduleId, jobId),
    onSuccess: async (_, jobId) => {
      await reconcileCatalogMutation<Job>(queryClient, queryKey, jobId, (a, b) => a.name.localeCompare(b.name, 'ru'))
      toast.success('Работа удалена')
    },
    onError: (error) => {
      toast.error(getRequestError(error, 'Не удалось удалить работу.'))
    },
  })

  const createJob = useCallback(
    async (payload: JobPayload) => {
      try {
        return await createMutation.mutateAsync(payload)
      } catch {
        return null
      }
    },
    [createMutation],
  )

  const updateJob = useCallback(
    async (jobId: string, payload: JobPayload) => {
      try {
        return await updateMutation.mutateAsync({ jobId, payload })
      } catch {
        return null
      }
    },
    [updateMutation],
  )

  const deletePending = useRef(false)
  const deleteJob = useCallback(async (jobId: string) => {
    if (deletePending.current) return false
    deletePending.current = true
    try {
      await deleteMutation.mutateAsync(jobId)
      return true
    } catch { return false }
    finally { deletePending.current = false }
  }, [deleteMutation])

  return {
    jobs: query.data ?? [],
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    createJob,
    updateJob,
    deleteJob,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
