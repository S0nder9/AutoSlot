export type StatisticsDay = {
  date: string
  ordersCount: number
  ordersTotal: number
}

export type StatisticsOverview = {
  ordersCount: number
  ordersTotal: number
  paidOrdersCount: number
  paidTotal: number
  unpaidOrdersCount: number
  unpaidTotal: number
  uniqueClientsCount: number
  uniqueCarsCount: number
  employeesCount: number
  workTotal: number
  partsTotal: number
  partsCostTotal: number
  partsGrossMargin: number
  days: StatisticsDay[]
}

export type StatisticsRange = {
  start: Date
  end: Date
}

export type StatisticsPeriod = 'day' | 'week' | 'month' | 'year' | 'custom'

export type WeeklyEmployeeStatistics = {
  employeeId: string
  employeeName: string
  ordersCount: number
  jobsCount: number
  workSalesTotal: number
  averageJobPrice: number
  currentWorkPercent: number
  payoutTotal: number
  calculatedJobsCount: number
  uncalculatedJobsCount: number
  workSalesSharePercent: number
  topJobName: string | null
  topJobCount: number
}

export type WeeklyJobStatistics = {
  jobId: string
  jobName: string
  ordersCount: number
  count: number
  salesTotal: number
  averageClientPrice: number
  minClientPrice: number
  maxClientPrice: number
  salesSharePercent: number
}

export type WeeklyPartStatistics = {
  partId: string
  partName: string
  ordersCount: number
  quantity: number
  averageSaleUnitPrice: number
  averageCostUnitPrice: number
  salesTotal: number
  costTotal: number
  grossMargin: number
  grossMarginPercent: number
  salesSharePercent: number
}

export type WeeklyUnpaidOrder = {
  eventId: string
  startTime: string
  title: string
  clientName: string | null
  carName: string | null
  workTotal: number
  partsTotal: number
  totalCost: number
}

export type WeeklyStatisticsDetails = {
  employees: WeeklyEmployeeStatistics[]
  jobs: WeeklyJobStatistics[]
  parts: WeeklyPartStatistics[]
  unpaidOrders: WeeklyUnpaidOrder[]
}
