import type { Schedule } from '@/lib/schedule-types'

export type ScheduleEvent = {
  id: string
  title: string
  description: string | null
  color: string
  startTime: string
  endTime: string
  totalCost: number
  isPaid: boolean
  jobs: ScheduleEventJob[]
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

export type ScheduleEventJob = {
  jobId: string
  employeeId: string
  clientPrice: number
  jobName?: string | null
  employeeName?: string | null
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

export type CreateEventPayload = {
  title: string
  description: string
  color: string
  startTime: string
  endTime: string
  isPaid: boolean
  jobs: []
}

export type SelectedSchedule = Schedule
