export const scheduleCarKeys = {
  all: ['schedule-cars'] as const,
  schedule: (scheduleId: string) => [...scheduleCarKeys.all, scheduleId] as const,
  search: (scheduleId: string, text: string, limit: number, clientId?: string) =>
    [...scheduleCarKeys.schedule(scheduleId), 'search', text, limit, clientId ?? null] as const,
}
