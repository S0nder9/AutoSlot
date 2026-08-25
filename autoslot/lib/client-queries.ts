export const scheduleClientKeys = {
  all: ['schedule-clients'] as const,
  schedule: (scheduleId: string) =>
    [...scheduleClientKeys.all, scheduleId] as const,
  search: (scheduleId: string, text: string, limit: number) =>
    [...scheduleClientKeys.schedule(scheduleId), 'search', text, limit] as const,
}
