export type AnalyticsKind = 'jobs' | 'parts' | 'clients' | 'cars'

export type AnalyticsPage<T> = { items: T[]; hasMore: boolean; nextOffset: number | null }
export type TimelinePoint = { periodStart: string; ordersCount: number }

export type JobAnalytics = {
  job: { jobId: string; currentName: string; currentBasePrice: number; isActive: boolean }
  summary: { ordersCount: number; executionsCount: number; salesTotal: number; averageClientPrice: number; minClientPrice: number; maxClientPrice: number; uniqueEmployeesCount: number }
  timeline: Array<TimelinePoint & { executionsCount: number; salesTotal: number }>
  employees: Array<{ employeeId: string; employeeName: string; ordersCount: number; executionsCount: number; salesTotal: number }>
}
export type JobEntry = { eventId: string; eventStartTime: string; eventTitle: string; clientName: string | null; carName: string | null; employeeName: string; clientPrice: number }

export type PartAnalytics = {
  part: { partId: string; currentName: string; currentBasePrice: number; currentPurchasePrice: number; isActive: boolean }
  summary: { ordersCount: number; quantity: number; salesTotal: number; costTotal: number; grossMargin: number; grossMarginPercent: number; averageSaleUnitPrice: number; averageCostUnitPrice: number; minSaleUnitPrice: number; maxSaleUnitPrice: number }
  timeline: Array<TimelinePoint & { quantity: number; salesTotal: number; costTotal: number; grossMargin: number }>
}
export type PartEntry = { eventId: string; eventStartTime: string; eventTitle: string; clientName: string | null; carName: string | null; quantity: number; unitPrice: number; purchasePrice: number; salesTotal: number; costTotal: number; grossMargin: number }

export type CustomerSummary = { ordersCount: number; ordersTotal: number; averageOrderValue: number; paidOrdersCount: number; paidTotal: number; unpaidOrdersCount: number; unpaidTotal: number; workTotal: number; partsTotal: number }
export type CustomerTimelinePoint = TimelinePoint & { ordersTotal: number; paidTotal: number }
export type TopJob = { name: string; count: number; salesTotal: number }
export type TopPart = { name: string; quantity: number; salesTotal: number }
export type ClientAnalytics = {
  client: { clientId: string; name: string; phone: string | null; isActive: boolean }
  summary: CustomerSummary & { uniqueCarsCount: number }
  timeline: CustomerTimelinePoint[]; topJobs: TopJob[]; topParts: TopPart[]
}
export type CarAnalytics = {
  car: { carId: string; displayName: string; brand: string; model: string | null; licensePlate: string | null; vin: string | null; clientId: string; clientName: string; isActive: boolean }
  summary: CustomerSummary; timeline: CustomerTimelinePoint[]; topJobs: TopJob[]; topParts: TopPart[]
}
export type CustomerOrder = { eventId: string; startTime: string; title: string; carName: string | null; workTotal: number; partsTotal: number; totalCost: number; isPaid: boolean }

export type EntityAnalyticsData = JobAnalytics | PartAnalytics | ClientAnalytics | CarAnalytics
export type EntityAnalyticsEntry = JobEntry | PartEntry | CustomerOrder
