'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChartNoAxesColumn, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, Workflow } from 'lucide-react'
import { DeleteJobDialog } from '@/components/jobs/delete-job-dialog'
import { JobFormDialog } from '@/components/jobs/job-form-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useScheduleJobs } from '@/hooks/use-schedule-jobs'
import { useScheduleJobSearch } from '@/hooks/use-schedule-job-search'
import { useSchedules } from '@/hooks/use-schedules'
import { formatEventPrice } from '@/lib/format-event'
import type { Job } from '@/lib/job-types'
import { entityAnalyticsHref } from '@/lib/entity-analytics-queries'

function formatEstimatedHours(value: number | null) {
  if (value == null) return 'Не указано'
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value)} ч.`
}

export function JobsPageContent() {
  const scope = useSearchParams().get('scheduleId') ?? ''
  return <JobsPageScope key={scope} />
}

function JobsPageScope() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scheduleId = searchParams.get('scheduleId') ?? ''
  const schedules = useSchedules()
  const jobs = useScheduleJobs(scheduleId)
  const [search, setSearch] = useState('')
  const jobSearch = useScheduleJobSearch(scheduleId, search)
  const [dialogJob, setDialogJob] = useState<Job | null | undefined>(undefined)
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null)

  const normalizedSearch = search.trim()
  const visibleJobs = normalizedSearch
    ? jobSearch.debouncedText === normalizedSearch
      ? jobSearch.jobs
      : []
    : jobs.jobs

  const handleScheduleChange = (nextScheduleId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (nextScheduleId) params.set('scheduleId', nextScheduleId)
    else params.delete('scheduleId')
    router.replace(`/dashboard/jobs?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!jobToDelete) return
    if (await jobs.deleteJob(jobToDelete.id)) setJobToDelete(null)
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Работы</h1>
          <p className="mt-1 text-sm text-muted-foreground">Управление работами автосервиса</p>
        </div>
        <Button disabled={!scheduleId} onClick={() => setDialogJob(null)}>
          <Plus /> Создать работу
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(220px,320px)_1fr_auto]">
        <label className="space-y-2 text-sm font-medium">
          Календарь
          <select value={scheduleId} onChange={(event) => handleScheduleChange(event.target.value)} className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
            <option value="">Выберите календарь</option>
            {schedules.schedules.map((schedule) => <option key={schedule.id} value={schedule.id}>{schedule.name}</option>)}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Поиск
          <span className="relative block">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Поиск работ..." value={search} onChange={(event) => setSearch(event.target.value)} disabled={!scheduleId} />
          </span>
        </label>
        <Button className="self-end" variant="outline" disabled={!scheduleId || jobs.isFetching || jobSearch.isSearching || jobSearch.isLoadingMore} onClick={() => void (search.trim() ? jobSearch.refetch() : jobs.refetch())}>
          <RefreshCw className={jobs.isFetching ? 'animate-spin' : undefined} /> Обновить
        </Button>
      </div>

      {!scheduleId ? (
        <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-background px-6 text-center">
          <Workflow className="size-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Выберите календарь</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Работы принадлежат конкретному календарю и не смешиваются между автосервисами.</p>
        </div>
      ) : jobs.isLoading ? (
        <div className="flex min-h-64 items-center justify-center"><Loader2 className="size-7 animate-spin text-muted-foreground" /></div>
      ) : jobs.error ? (
        <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-background px-6 text-center">
          <h2 className="text-lg font-semibold">Не удалось загрузить работы</h2>
          <Button className="mt-4" variant="outline" onClick={() => void (search.trim() ? jobSearch.refetch() : jobs.refetch())}>Повторить</Button>
        </div>
      ) : jobs.jobs.length === 0 ? (
        <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-background px-6 text-center">
          <Workflow className="size-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Работ пока нет</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Создайте первую работу, чтобы затем добавлять её в события календаря.</p>
          <Button className="mt-5" onClick={() => setDialogJob(null)}><Plus /> Создать работу</Button>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border bg-background">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3 text-sm text-muted-foreground">
            <span>Найдено работ: {visibleJobs.length}</span>
            {jobSearch.isSearching && <Loader2 className="size-4 animate-spin" />}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Название</th><th className="px-4 py-3 font-medium">Описание</th><th className="px-4 py-3 font-medium">Базовая цена</th><th className="px-4 py-3 font-medium">Оценочное время</th><th className="px-4 py-3 text-right font-medium">Действия</th></tr></thead>
              <tbody>
                {visibleJobs.map((job) => (
                  <tr key={job.id} className="border-t first:border-t-0">
                    <td className="px-4 py-3 font-medium">
                      <Link className="hover:underline" href={`/dashboard/jobs/${job.id}?scheduleId=${scheduleId}`}>{job.name}</Link>
                      {!job.isActive && <span className="ml-2 text-xs text-muted-foreground">Неактивна</span>}
                    </td>
                    <td className="max-w-sm px-4 py-3 text-muted-foreground"><span className="line-clamp-2">{job.description || '—'}</span></td>
                    <td className="px-4 py-3">{formatEventPrice(job.basePrice)}</td>
                    <td className="px-4 py-3">{formatEstimatedHours(job.estimatedHours)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={entityAnalyticsHref('jobs', scheduleId, job.id)} className={buttonVariants({ size: 'sm', variant: 'outline' })}><ChartNoAxesColumn /> Статистика</Link>
                        <Button size="sm" variant="outline" onClick={() => setDialogJob(job)}><Pencil /> Редактировать</Button>
                        <Button size="sm" variant="destructive" aria-label={`Удалить работу «${job.name}»`} onClick={() => setJobToDelete(job)}><Trash2 /> Удалить</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {normalizedSearch && jobSearch.error && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-destructive">
                      Не удалось выполнить поиск работ.
                    </td>
                  </tr>
                )}
                {normalizedSearch && !jobSearch.error && !jobSearch.isSearching && visibleJobs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      По вашему запросу ничего не найдено.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {normalizedSearch && jobSearch.hasMore && (
            <div className="flex justify-center border-t p-3">
              <Button variant="outline" disabled={jobSearch.isLoadingMore} onClick={() => void jobSearch.loadMore()}>
                {jobSearch.isLoadingMore && <Loader2 className="animate-spin" />}
                Показать ещё
              </Button>
            </div>
          )}
        </div>
      )}

      {dialogJob !== undefined && scheduleId && <JobFormDialog scheduleId={scheduleId} job={dialogJob ?? undefined} onClose={() => setDialogJob(undefined)} />}
      {jobToDelete && (
        <DeleteJobDialog
          job={jobToDelete}
          isPending={jobs.isDeleting}
          onConfirm={() => void handleDelete()}
          onClose={() => setJobToDelete(null)}
        />
      )}
    </main>
  )
}
