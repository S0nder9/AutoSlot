export const scheduleJobKeys = {
  all: ['schedule-jobs'] as const,
  schedule: (scheduleId: string) =>
    [...scheduleJobKeys.all, scheduleId] as const,
  detail: (scheduleId: string, jobId: string) =>
    [...scheduleJobKeys.schedule(scheduleId), 'detail', jobId] as const,
  search: (scheduleId: string, text: string, limit: number) =>
    [...scheduleJobKeys.schedule(scheduleId), 'search', text, limit] as const,
}
