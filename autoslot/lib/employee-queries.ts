export const scheduleEmployeeKeys = {
  all: ['schedule-employees'] as const,
  schedule: (scheduleId: string) =>
    [...scheduleEmployeeKeys.all, scheduleId] as const,
  search: (scheduleId: string, text: string, limit: number) =>
    [...scheduleEmployeeKeys.schedule(scheduleId), 'search', text, limit] as const,
  detail: (scheduleId: string, employeeId: string) =>
    [...scheduleEmployeeKeys.schedule(scheduleId), 'detail', employeeId] as const,
}
