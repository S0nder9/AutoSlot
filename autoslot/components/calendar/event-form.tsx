'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { EventJobsField } from '@/components/calendar/event-jobs-field'
import { EventClientField } from '@/components/calendar/event-client-field'
import { EventCarField } from '@/components/calendar/event-car-field'
import { EventPartsField } from '@/components/calendar/event-parts-field'
import type { EventFormValues } from '@/lib/validations/event'
import type {
  EventFieldsPayload,
  EventFormPayload,
  EventPartFormItem,
  ScheduleEventJob,
  ScheduleEventPart,
  UpdateEventJobPayload,
} from '@/lib/calendar-types'
import { useEventForm } from '@/hooks/use-event-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatEventPrice } from '@/lib/format-event'

type EventFormProps = {
  scheduleId: string
  initialValues?: EventFormValues
  initialJobs?: ScheduleEventJob[]
  initialParts?: ScheduleEventPart[]
  initialClientId?: string | null
  initialClientName?: string | null
  initialCarId?: string | null
  initialCarName?: string | null
  isPending: boolean
  submitLabel: string
  onSubmit: (payload: EventFormPayload) => Promise<boolean>
  onSuccess: () => void
  onCancel: () => void
}

export function EventForm({
  scheduleId,
  initialValues,
  initialJobs = [],
  initialParts = [],
  initialClientId = null,
  initialClientName,
  initialCarId = null,
  initialCarName,
  isPending,
  submitLabel,
  onSubmit,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const [jobs, setJobs] = useState<UpdateEventJobPayload[]>(() =>
    initialJobs.map(({ jobId, employeeId, clientPrice }) => ({
      jobId,
      employeeId: employeeId || undefined,
      clientPrice,
    })),
  )
  const [jobsError, setJobsError] = useState<string>()
  const [parts, setParts] = useState<EventPartFormItem[]>(() =>
    initialParts.map(({ partId, partName, purchasePrice, quantity, unitPrice }) => ({
      partId,
      partName,
      purchasePrice,
      quantity,
      unitPrice,
    })),
  )
  const [partsError, setPartsError] = useState<string>()
  const [clientId, setClientId] = useState<string | null>(initialClientId)
  const [clientName, setClientName] = useState<string | null>(initialClientName ?? null)
  const [carId, setCarId] = useState<string | null>(initialCarId)

  const handleClientChange = (nextClientId: string | null, nextClientName?: string | null) => {
    if (nextClientId !== clientId) setCarId(null)
    setClientId(nextClientId)
    setClientName(nextClientName ?? null)
  }

  const handleJobsChange = (nextJobs: UpdateEventJobPayload[]) => {
    setJobs(nextJobs)
    setJobsError(undefined)
  }

  const handlePartsChange = (nextParts: EventPartFormItem[]) => {
    setParts(nextParts)
    setPartsError(undefined)
  }

  const handleSubmit = async (payload: EventFieldsPayload) => {
    if (jobs.some(({ clientPrice }) => !Number.isFinite(clientPrice) || clientPrice < 0)) {
      setJobsError('Укажите корректную цену для каждой работы.')
      return false
    }
    if (parts.some(({ quantity, unitPrice }) => !Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(unitPrice) || unitPrice < 0)) {
      setPartsError('Укажите корректное количество и цену для каждой запчасти.')
      return false
    }
    if (new Set(parts.map(({ partId }) => partId)).size !== parts.length) {
      setPartsError('Одна запчасть не может быть добавлена дважды.')
      return false
    }
    return onSubmit({
      ...payload,
      clientId,
      carId,
      jobs: jobs.map(({ employeeId, ...job }) => ({
        ...job,
        ...(employeeId ? { employeeId } : {}),
      })),
      parts: parts.map(({ partId, quantity, unitPrice }) => ({
        partId,
        quantity,
        unitPrice,
      })),
    })
  }

  const form = useEventForm(handleSubmit, onSuccess, initialValues)
  const workTotal = jobs.reduce((total, job) => total + job.clientPrice, 0)
  const partsTotal = parts.reduce((total, part) => total + part.quantity * part.unitPrice, 0)

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="event-title">Название</Label>
        <Input
          id="event-title"
          name="title"
          value={form.values.title}
          onChange={form.handleChange}
          aria-invalid={Boolean(form.errors.title)}
          autoFocus
        />
        {form.errors.title && (
          <p className="text-sm text-destructive">{form.errors.title}</p>
        )}
      </div>

      <EventClientField scheduleId={scheduleId} value={clientId} initialName={initialClientName} onChange={handleClientChange} />
      <EventCarField scheduleId={scheduleId} clientId={clientId} clientName={clientName} value={carId} initialName={initialCarName} onChange={setCarId} />

      <div className="space-y-2">
        <Label htmlFor="event-description">Описание</Label>
        <textarea
          id="event-description"
          name="description"
          value={form.values.description}
          onChange={form.handleChange}
          className="min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="event-start">Начало</Label>
          <Input
            id="event-start"
            name="startTime"
            type="datetime-local"
            value={form.values.startTime}
            onChange={form.handleChange}
            aria-invalid={Boolean(form.errors.startTime)}
          />
          {form.errors.startTime && (
            <p className="text-sm text-destructive">{form.errors.startTime}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-end">Окончание</Label>
          <Input
            id="event-end"
            name="endTime"
            type="datetime-local"
            value={form.values.endTime}
            onChange={form.handleChange}
            aria-invalid={Boolean(form.errors.endTime)}
          />
          {form.errors.endTime && (
            <p className="text-sm text-destructive">{form.errors.endTime}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.values.isPaid}
            onChange={form.handlePaidChange}
            className="size-4"
          />
          Оплачено
        </label>
        <div className="flex items-center gap-2">
          <Label htmlFor="event-color">Цвет</Label>
          <input
            id="event-color"
            name="color"
            type="color"
            value={form.values.color}
            onChange={form.handleChange}
            className="size-9 cursor-pointer rounded border"
          />
        </div>
      </div>

      <EventJobsField
        scheduleId={scheduleId}
        value={jobs}
        initialJobs={initialJobs}
        error={jobsError}
        onChange={handleJobsChange}
      />

      <EventPartsField
        scheduleId={scheduleId}
        value={parts}
        error={partsError}
        onChange={handlePartsChange}
      />

      <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
        <div className="flex justify-between gap-4 text-muted-foreground"><span>Работы</span><span>{formatEventPrice(workTotal)}</span></div>
        <div className="flex justify-between gap-4 text-muted-foreground"><span>Запчасти</span><span>{formatEventPrice(partsTotal)}</span></div>
        <div className="flex justify-between gap-4 border-t pt-2 font-semibold"><span>Итого</span><span>{formatEventPrice(workTotal + partsTotal)}</span></div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
