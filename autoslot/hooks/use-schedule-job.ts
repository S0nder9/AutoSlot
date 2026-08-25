'use client'

import { useQuery } from '@tanstack/react-query'
import { scheduleJobKeys } from '@/lib/job-queries'
import { getScheduleJob } from '@/lib/services/jobs'

export function useScheduleJob(scheduleId: string, jobId: string) {
  return useQuery({
    queryKey: scheduleJobKeys.detail(scheduleId, jobId),
    queryFn: () => getScheduleJob(scheduleId, jobId),
    enabled: Boolean(scheduleId && jobId),
    staleTime: 30 * 1000,
    retry: false,
  })
}
