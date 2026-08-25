export const schedulePartKeys = {
  all: ['schedule-parts'] as const,
  schedule: (scheduleId: string) =>
    [...schedulePartKeys.all, scheduleId] as const,
  search: (scheduleId: string, text: string, limit: number) =>
    [...schedulePartKeys.schedule(scheduleId), 'search', text, limit] as const,
}
