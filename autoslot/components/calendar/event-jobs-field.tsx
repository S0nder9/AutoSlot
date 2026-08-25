'use client'

import { useMemo, useState } from 'react'
import { Loader2, Plus, Search, Trash2, UserPlus, Wrench } from 'lucide-react'
import { EmployeeFormDialog } from '@/components/employees/employee-form-dialog'
import { JobFormDialog } from '@/components/jobs/job-form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useScheduleEmployees } from '@/hooks/use-schedule-employees'
import { useScheduleEmployeeSearch } from '@/hooks/use-schedule-employee-search'
import { useScheduleJobs } from '@/hooks/use-schedule-jobs'
import { useScheduleJobSearch } from '@/hooks/use-schedule-job-search'
import type {
  ScheduleEventJob,
  UpdateEventJobPayload,
} from '@/lib/calendar-types'
import { formatEmployeeName } from '@/lib/employee-types'
import type { Employee } from '@/lib/employee-types'
import { formatEventPrice } from '@/lib/format-event'
import type { Job } from '@/lib/job-types'

type EventJobsFieldProps = {
  scheduleId: string
  value: UpdateEventJobPayload[]
  initialJobs?: ScheduleEventJob[]
  error?: string
  onChange: (jobs: UpdateEventJobPayload[]) => void
}

export function EventJobsField({
  scheduleId,
  value,
  initialJobs = [],
  error,
  onChange,
}: EventJobsFieldProps) {
  const jobsQuery = useScheduleJobs(scheduleId)
  const employeesQuery = useScheduleEmployees(scheduleId)
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const jobSearch = useScheduleJobSearch(scheduleId, search)
  const [employeeSelectorJobId, setEmployeeSelectorJobId] = useState<string | null>(null)
  const [employeeCreateJobId, setEmployeeCreateJobId] = useState<string | null>(null)
  const [employeeSearchText, setEmployeeSearchText] = useState('')
  const employeeSearch = useScheduleEmployeeSearch(scheduleId, employeeSearchText)

  const normalizedEmployeeSearch = employeeSearchText.trim()
  const selectableEmployees = normalizedEmployeeSearch
    ? employeeSearch.debouncedText === normalizedEmployeeSearch
      ? employeeSearch.employees
      : []
    : employeesQuery.employees

  const initialJobsById = useMemo(
    () => new Map(initialJobs.map((job) => [job.jobId, job])),
    [initialJobs],
  )
  const availableJobs = useMemo(() => {
    const selectedIds = new Set(value.map(({ jobId }) => jobId))
    const normalizedSearch = search.trim()
    const sourceJobs = normalizedSearch
      ? jobSearch.debouncedText === normalizedSearch
        ? jobSearch.jobs
        : []
      : jobsQuery.jobs
    return sourceJobs.filter(
      (job) =>
        job.isActive &&
        !selectedIds.has(job.id),
    )
  }, [jobSearch.debouncedText, jobSearch.jobs, jobsQuery.jobs, search, value])

  const addJob = (job: Job) => {
    const activeEmployees = employeesQuery.employees.filter(({ isActive }) => isActive)
    onChange([
      ...value,
      {
        jobId: job.id,
        employeeId: activeEmployees.length === 1 ? activeEmployees[0].id : undefined,
        clientPrice: job.basePrice,
      },
    ])
    setSearch('')
    setIsSelectorOpen(false)
  }

  const updateJob = (jobId: string, patch: Partial<UpdateEventJobPayload>) => {
    onChange(value.map((item) => (item.jobId === jobId ? { ...item, ...patch } : item)))
  }

  const assignEmployee = (jobId: string, employee?: Employee) => {
    updateJob(jobId, { employeeId: employee?.id })
    setEmployeeSelectorJobId(null)
    setEmployeeSearchText('')
  }

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wrench className="size-4" />
          <Label>Работы</Label>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => setIsSelectorOpen((open) => !open)}>
          <Plus /> Добавить работу
        </Button>
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground">Работы не выбраны.</p>
      ) : (
        <div className="space-y-3">
          {value.map((selectedJob) => {
            const catalogJob = jobsQuery.jobs.find(({ id }) => id === selectedJob.jobId)
            const initialJob = initialJobsById.get(selectedJob.jobId)
            const employeeExists = employeesQuery.employees.some(({ id }) => id === selectedJob.employeeId)
            return (
              <div key={selectedJob.jobId} className="space-y-3 rounded-lg bg-muted/50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{catalogJob?.name ?? initialJob?.jobName ?? `Работа ${selectedJob.jobId}`}</p>
                    {catalogJob && <p className="text-xs text-muted-foreground">Базовая цена: {formatEventPrice(catalogJob.basePrice)}</p>}
                  </div>
                  <Button type="button" size="icon-sm" variant="ghost" aria-label="Убрать работу" onClick={() => onChange(value.filter(({ jobId }) => jobId !== selectedJob.jobId))}>
                    <Trash2 />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1 text-xs font-medium">
                    <span>Сотрудник</span>
                    <Button type="button" className="w-full justify-start" variant="outline" onClick={() => {
                      setEmployeeSelectorJobId((current) => current === selectedJob.jobId ? null : selectedJob.jobId)
                      setEmployeeSearchText('')
                    }}>
                      {employeesQuery.employees.find(({ id }) => id === selectedJob.employeeId)
                        ? formatEmployeeName(employeesQuery.employees.find(({ id }) => id === selectedJob.employeeId)!)
                        : selectedJob.employeeId
                          ? initialJob?.employeeName ?? 'Назначенный сотрудник'
                          : 'Без сотрудника'}
                    </Button>
                  </div>
                  <label className="space-y-1 text-xs font-medium">
                    Цена для события (₽)
                    <Input type="number" min="0" step="any" value={selectedJob.clientPrice} onChange={(event) => updateJob(selectedJob.jobId, { clientPrice: Math.max(0, Number(event.target.value)) })} />
                  </label>
                </div>
                {employeeSelectorJobId === selectedJob.jobId && (
                  <div className="space-y-2 rounded-lg border bg-background p-3">
                    <span className="relative block">
                      <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input className="pl-8" placeholder="Поиск сотрудника..." value={employeeSearchText} onChange={(event) => setEmployeeSearchText(event.target.value)} autoFocus />
                    </span>
                    <div className="max-h-40 space-y-1 overflow-y-auto">
                      <button type="button" className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted" onClick={() => assignEmployee(selectedJob.jobId)}>Без сотрудника</button>
                      {!employeeExists && selectedJob.employeeId && (
                        <button type="button" className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted" onClick={() => {
                          setEmployeeSelectorJobId(null)
                          setEmployeeSearchText('')
                        }}>{initialJob?.employeeName ?? 'Назначенный сотрудник'}</button>
                      )}
                      {(normalizedEmployeeSearch ? employeeSearch.isSearching : employeesQuery.isLoading) ? (
                        <div className="flex justify-center py-3"><Loader2 className="size-5 animate-spin" /></div>
                      ) : normalizedEmployeeSearch && employeeSearch.error ? (
                        <p className="px-2 py-2 text-sm text-destructive">Не удалось выполнить поиск сотрудников.</p>
                      ) : selectableEmployees
                        .filter((employee) => employee.isActive)
                        .map((employee) => (
                          <button key={employee.id} type="button" className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted" onClick={() => assignEmployee(selectedJob.jobId, employee)}>{formatEmployeeName(employee)}</button>
                        ))}
                    </div>
                    {normalizedEmployeeSearch && employeeSearch.hasMore && (
                      <Button type="button" className="w-full" variant="ghost" disabled={employeeSearch.isLoadingMore} onClick={() => void employeeSearch.loadMore()}>
                        {employeeSearch.isLoadingMore && <Loader2 className="animate-spin" />}
                        Показать ещё
                      </Button>
                    )}
                    <Button type="button" className="w-full" variant="outline" onClick={() => setEmployeeCreateJobId(selectedJob.jobId)}><UserPlus /> Добавить сотрудника</Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isSelectorOpen && (
        <div className="space-y-2 rounded-lg border bg-background p-3">
          <span className="relative block">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Поиск работы..." value={search} onChange={(event) => setSearch(event.target.value)} autoFocus />
          </span>
          {(search.trim() ? jobSearch.isSearching : jobsQuery.isLoading) ? (
            <div className="flex justify-center py-4"><Loader2 className="size-5 animate-spin" /></div>
          ) : jobSearch.error && search.trim() ? (
            <p className="py-2 text-sm text-destructive">Не удалось выполнить поиск работ.</p>
          ) : availableJobs.length ? (
            <div className="max-h-44 space-y-1 overflow-y-auto">
              {availableJobs.map((job) => <button key={job.id} type="button" className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-muted" onClick={() => addJob(job)}><span>{job.name}</span><span className="text-muted-foreground">{formatEventPrice(job.basePrice)}</span></button>)}
            </div>
          ) : (
            <p className="py-2 text-sm text-muted-foreground">Подходящих работ не найдено.</p>
          )}
          {search.trim() && jobSearch.hasMore && (
            <Button type="button" className="w-full" variant="ghost" disabled={jobSearch.isLoadingMore} onClick={() => void jobSearch.loadMore()}>
              {jobSearch.isLoadingMore && <Loader2 className="animate-spin" />}
              Показать ещё
            </Button>
          )}
          <Button type="button" className="w-full" variant="outline" onClick={() => setIsCreateOpen(true)}><Plus /> Добавить новую работу</Button>
        </div>
      )}

      {isCreateOpen && <JobFormDialog scheduleId={scheduleId} onClose={() => setIsCreateOpen(false)} onCreated={addJob} />}
      {employeeCreateJobId && (
        <EmployeeFormDialog
          scheduleId={scheduleId}
          onClose={() => setEmployeeCreateJobId(null)}
          onCreated={(employee) => assignEmployee(employeeCreateJobId, employee)}
        />
      )}
    </div>
  )
}
