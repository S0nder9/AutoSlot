import type { Schedule } from '@/lib/schedule-types'

export type ScheduleEvent = {
  id: string
  title: string
  description?: string | null
  color?: string | null
  startTime: string
  endTime: string
  isPaid: boolean
  jobs?: ScheduleEventJob[]
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
  start: Date
  end: Date
  resource: ScheduleEvent
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
