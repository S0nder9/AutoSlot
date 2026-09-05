'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { BarChart3, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, Users } from 'lucide-react'
import { DeleteEmployeeDialog } from '@/components/employees/delete-employee-dialog'
import { EmployeeFormDialog } from '@/components/employees/employee-form-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useScheduleEmployees } from '@/hooks/use-schedule-employees'
import { useScheduleEmployeeSearch } from '@/hooks/use-schedule-employee-search'
import { useSchedules } from '@/hooks/use-schedules'
import { formatEmployeeName, type Employee } from '@/lib/employee-types'
import { employeeAnalyticsHref } from '@/lib/employee-statistics-queries'

export function EmployeesPageContent() {
  const scope = useSearchParams().get('scheduleId') ?? ''
  return <EmployeesPageScope key={scope} />
}

function EmployeesPageScope() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scheduleId = searchParams.get('scheduleId') ?? ''
  const schedules = useSchedules()
  const employees = useScheduleEmployees(scheduleId)
  const [search, setSearch] = useState('')
  const employeeSearch = useScheduleEmployeeSearch(scheduleId, search)
  const [dialogEmployee, setDialogEmployee] = useState<Employee | null | undefined>(undefined)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)

  const normalizedSearch = search.trim()
  const visibleEmployees = normalizedSearch
    ? employeeSearch.debouncedText === normalizedSearch
      ? employeeSearch.employees
      : []
    : employees.employees

  const handleScheduleChange = (nextScheduleId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (nextScheduleId) params.set('scheduleId', nextScheduleId)
    else params.delete('scheduleId')
    router.replace(`/dashboard/employees?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!employeeToDelete) return
    if (await employees.deleteEmployee(employeeToDelete.id)) {
      setEmployeeToDelete(null)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Сотрудники</h1>
          <p className="mt-1 text-sm text-muted-foreground">Управление сотрудниками автосервиса</p>
        </div>
        <Button disabled={!scheduleId} onClick={() => setDialogEmployee(null)}><Plus /> Добавить сотрудника</Button>
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
            <Input className="pl-8" placeholder="Поиск сотрудников..." value={search} onChange={(event) => setSearch(event.target.value)} disabled={!scheduleId} />
          </span>
        </label>
        <Button className="self-end" variant="outline" disabled={!scheduleId || employees.isFetching || employeeSearch.isSearching || employeeSearch.isLoadingMore} onClick={() => void (search.trim() ? employeeSearch.refetch() : employees.refetch())}><RefreshCw className={employees.isFetching ? 'animate-spin' : undefined} /> Обновить</Button>
      </div>

      {!scheduleId ? (
        <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-background px-6 text-center">
          <Users className="size-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Выберите календарь</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Сотрудники принадлежат конкретному календарю.</p>
        </div>
      ) : employees.isLoading ? (
        <div className="flex min-h-64 items-center justify-center"><Loader2 className="size-7 animate-spin text-muted-foreground" /></div>
      ) : employees.error ? (
        <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-background px-6 text-center">
          <h2 className="text-lg font-semibold">Не удалось загрузить сотрудников</h2>
          <Button className="mt-4" variant="outline" onClick={() => void (search.trim() ? employeeSearch.refetch() : employees.refetch())}>Повторить</Button>
        </div>
      ) : employees.employees.length === 0 ? (
        <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-background px-6 text-center">
          <Users className="size-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Сотрудников пока нет</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Добавьте первого сотрудника, чтобы назначать его на работы в событиях календаря.</p>
          <Button className="mt-5" onClick={() => setDialogEmployee(null)}><Plus /> Добавить сотрудника</Button>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border bg-background">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3 text-sm text-muted-foreground">
            <span>Найдено сотрудников: {visibleEmployees.length}</span>
            {employeeSearch.isSearching && <Loader2 className="size-4 animate-spin" />}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Фамилия</th><th className="px-4 py-3 font-medium">Имя</th><th className="px-4 py-3 font-medium">Отчество</th><th className="px-4 py-3 text-right font-medium">Действия</th></tr></thead>
              <tbody>
                {visibleEmployees.map((employee) => (
                  <tr key={employee.id} className="border-t first:border-t-0">
                    <td className="px-4 py-3">{employee.lastName || '—'}</td>
                    <td className="px-4 py-3 font-medium">{employee.firstName}{!employee.isActive && <span className="ml-2 text-xs text-muted-foreground">Неактивен</span>}</td>
                    <td className="px-4 py-3">{employee.middleName || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={employeeAnalyticsHref(scheduleId, employee.id)} className={buttonVariants({ size: 'sm', variant: 'outline' })}><BarChart3 /> Статистика</Link>
                        <Button size="sm" variant="outline" onClick={() => setDialogEmployee(employee)}><Pencil /> Редактировать</Button>
                        <Button size="sm" variant="destructive" aria-label={`Удалить сотрудника «${formatEmployeeName(employee)}»`} onClick={() => setEmployeeToDelete(employee)}><Trash2 /> Удалить</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {normalizedSearch && employeeSearch.error && <tr><td colSpan={4} className="px-4 py-10 text-center text-destructive">Не удалось выполнить поиск сотрудников.</td></tr>}
                {normalizedSearch && !employeeSearch.error && !employeeSearch.isSearching && visibleEmployees.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">По вашему запросу ничего не найдено.</td></tr>}
              </tbody>
            </table>
          </div>
          {normalizedSearch && employeeSearch.hasMore && (
            <div className="flex justify-center border-t p-3">
              <Button variant="outline" disabled={employeeSearch.isLoadingMore} onClick={() => void employeeSearch.loadMore()}>
                {employeeSearch.isLoadingMore && <Loader2 className="animate-spin" />}
                Показать ещё
              </Button>
            </div>
          )}
        </div>
      )}

      {dialogEmployee !== undefined && scheduleId && <EmployeeFormDialog scheduleId={scheduleId} employee={dialogEmployee ?? undefined} onClose={() => setDialogEmployee(undefined)} />}
      {employeeToDelete && (
        <DeleteEmployeeDialog
          employee={employeeToDelete}
          isPending={employees.isDeleting}
          onConfirm={() => void handleDelete()}
          onClose={() => setEmployeeToDelete(null)}
        />
      )}
    </main>
  )
}
