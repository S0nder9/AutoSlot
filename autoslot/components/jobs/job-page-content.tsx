'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useScheduleJob } from '@/hooks/use-schedule-job'

export function JobPageContent() {
  const params = useParams<{ jobId: string }>()
  const searchParams = useSearchParams()
  const scheduleId = searchParams.get('scheduleId') ?? ''

  useScheduleJob(scheduleId, params.jobId)

  return null
}
