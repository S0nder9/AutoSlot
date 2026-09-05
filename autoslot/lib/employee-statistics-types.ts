export type EmployeeStatisticsBucket = 'day' | 'month'

export type EmployeeStatistics = {
  employee: {
    employeeId: string
    employeeName: string
    workPercent: number
    isActive: boolean
  }
  summary: {
    ordersCount: number
    jobsCount: number
    workSalesTotal: number
    payoutTotal: number
    averageJobPrice: number
    averagePayout: number
    calculatedJobsCount: number
    uncalculatedJobsCount: number
  }
  timeline: Array<{
    periodStart: string
    ordersCount: number
    jobsCount: number
    workSalesTotal: number
    payoutTotal: number
  }>
  jobs: Array<{
    jobId: string
    jobName: string
    ordersCount: number
    count: number
    workSalesTotal: number
    payoutTotal: number
    averageClientPrice: number
    averagePayout: number
    uncalculatedJobsCount: number
  }>
}

export type EmployeeWorkEntry = {
  eventId: string
  eventStartTime: string
  eventTitle: string
  clientName: string | null
  carName: string | null
  jobId: string
  jobName: string
  clientPrice: number
  employeePercent: number | null
  payout: number | null
}

export type EmployeeWorkEntries = {
  items: EmployeeWorkEntry[]
  hasMore: boolean
  nextOffset: number | null
}
