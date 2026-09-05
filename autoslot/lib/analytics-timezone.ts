export function getReportTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function getAnalyticsBucket(start: Date, end: Date): 'day' | 'month' {
  return end.getTime() - start.getTime() > 62 * 86_400_000 ? 'month' : 'day'
}
