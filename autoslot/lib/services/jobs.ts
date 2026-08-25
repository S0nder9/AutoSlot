import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/auth-types'
import type { Job, JobPayload, JobSearchResult } from '@/lib/job-types'

export async function getScheduleJobs(scheduleId: string) {
  const response = await api.get<ApiResponse<Job[]>>(
    `schedules/${scheduleId}/jobs`,
  )
  return response.data.data ?? []
}

export async function getScheduleJob(scheduleId: string, jobId: string) {
  const response = await api.get<ApiResponse<Job>>(
    `schedules/${scheduleId}/jobs/${jobId}`,
  )

  if (!response.data.data) throw new Error('Invalid job response')
  return response.data.data
}

export async function searchScheduleJobs(
  scheduleId: string,
  text: string,
  limit: number,
  offset: number,
) {
  const response = await api.get<ApiResponse<JobSearchResult>>(
    `schedules/${scheduleId}/jobs/search`,
    { params: { text, limit, offset } },
  )

  if (!response.data.data) throw new Error('Invalid job search response')
  return response.data.data
}

export async function createScheduleJob(
  scheduleId: string,
  payload: JobPayload,
) {
  const response = await api.post<ApiResponse<Job>>(
    `schedules/${scheduleId}/jobs`,
    payload,
  )

  if (!response.data.data) throw new Error('Invalid job create response')
  return response.data.data
}

export async function updateScheduleJob(
  scheduleId: string,
  jobId: string,
  payload: JobPayload,
) {
  const response = await api.patch<ApiResponse<Job>>(
    `schedules/${scheduleId}/jobs/${jobId}`,
    payload,
  )

  if (!response.data.data) throw new Error('Invalid job update response')
  return response.data.data
}

export async function deleteScheduleJob(scheduleId: string, jobId: string) {
  await api.delete(`schedules/${scheduleId}/jobs/${jobId}`)
}
