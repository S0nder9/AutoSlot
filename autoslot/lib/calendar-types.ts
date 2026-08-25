import type { Schedule } from '@/lib/schedule-types'

export type ScheduleEvent = {
  id: string
  clientId: string | null
  clientName: string | null
  carId: string | null
  carName: string | null
  title: string
  description: string | null
  color: string
  startTime: string
  endTime: string
  workTotal: number
  partsTotal: number
  totalCost: number
  isPaid: boolean
  jobs: ScheduleEventJob[]
  parts: ScheduleEventPart[]
  createdAt: string
  updatedAt: string
}

export type CalendarEventSummary = {
  id: string
  title: string
  color: string
  isPaid: boolean
  startTime: string
  endTime: string
}

export type EventSearchResult = {
  items: CalendarEventSummary[]
  hasMore: boolean
  nextOffset: number | null
}

export type ScheduleEventJob = {
  id: string
  jobId: string
  employeeId: string
  clientPrice: number
  jobName: string
  employeeName: string
}

export type ScheduleEventPart = {
  id: string
  partId: string
  partName: string
  purchasePrice: number
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type CalendarEvent = {
  id: string
  title: string
  color: string
  isPaid: boolean
  start: Date
  end: Date
  resource: CalendarEventSummary
}

export type CalendarRange = {
  start: Date
  end: Date
}

export type EventFieldsPayload = {
  title: string
  description: string
  color: string
  startTime: Date
  endTime: Date
  isPaid: boolean
}

export type UpdateEventJobPayload = {
  jobId: string
  employeeId?: string
  clientPrice: number
}

export type UpdateEventPartPayload = {
  partId: string
  quantity: number
  unitPrice: number
}

export type EventPartFormItem = UpdateEventPartPayload & {
  partName: string
  purchasePrice: number
}

export type EventFormPayload = EventFieldsPayload & {
  clientId: string | null
  carId: string | null
  jobs: UpdateEventJobPayload[]
  parts: UpdateEventPartPayload[]
}

export type CreateEventPayload = EventFormPayload
export type UpdateEventPayload = EventFormPayload

export type SelectedSchedule = Schedule
