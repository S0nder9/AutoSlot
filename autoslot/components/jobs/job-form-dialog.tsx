'use client'

import { createPortal } from 'react-dom'
import { JobForm } from '@/components/jobs/job-form'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import { useScheduleJobs } from '@/hooks/use-schedule-jobs'
import type { Job, JobPayload } from '@/lib/job-types'

type JobFormDialogProps = {
  scheduleId: string
  job?: Job
  onClose: () => void
  onCreated?: (job: Job) => void
}

export function JobFormDialog({
  scheduleId,
  job,
  onClose,
  onCreated,
}: JobFormDialogProps) {
  const jobs = useScheduleJobs(scheduleId)
  const isPending = job ? jobs.isUpdating : jobs.isCreating

  const handleSubmit = (payload: JobPayload) =>
    job ? jobs.updateJob(job.id, payload) : jobs.createJob(payload)

  const handleSuccess = (savedJob: Job) => {
    if (!job) onCreated?.(savedJob)
    onClose()
  }

  return createPortal(
    <ScheduleDialogShell
      title={job ? 'Редактировать работу' : 'Новая работа'}
      description={
        job
          ? 'Измените данные работы и сохраните результат.'
          : 'Добавьте работу в справочник текущего календаря.'
      }
      titleId="job-form-title"
      descriptionId="job-form-description"
      disabled={isPending}
      onClose={onClose}
    >
      <JobForm
        job={job}
        isPending={isPending}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </ScheduleDialogShell>,
    document.body,
  )
}
