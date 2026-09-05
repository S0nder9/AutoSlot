'use client'

import { useRef, useState, type FormEvent } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUpdateScheduleEmployee } from '@/hooks/use-schedule-employees'
import type { Employee } from '@/lib/employee-types'
import { getRequestError } from '@/lib/request-error'
import { formatPercentage } from '@/lib/format-event'

export function EmployeeWorkPercentForm({ scheduleId, employee }: { scheduleId: string; employee: Employee }) {
  const [value, setValue] = useState(String(employee.workPercent))
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const submitting = useRef(false)
  const mutation = useUpdateScheduleEmployee(scheduleId)
  const parsed = value.trim().replace(',', '.')
  const number = Number(parsed)

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    if (!/^\d+(?:\.\d{1,2})?$/.test(parsed) || number < 0 || number > 100) {
      setError('Укажите процент от 0 до 100, не более двух знаков после запятой.')
      return
    }
    submitting.current = true
    setError('')
    try {
      await mutation.mutateAsync({ employeeId: employee.id, payload: {
        firstName: employee.firstName, middleName: employee.middleName, lastName: employee.lastName, workPercent: number,
      } })
    } catch (error) {
      setError(getRequestError(error, 'Не удалось сохранить процент.'))
    } finally {
      submitting.current = false
    }
  }

  return <section className="w-full rounded-lg border px-4 py-3 sm:w-auto sm:min-w-64 sm:max-w-sm">
    <div className="flex items-center justify-between gap-4">
      <div><p className="text-xs text-muted-foreground">Ставка для новых работ</p><p className="mt-0.5 text-lg font-semibold tabular-nums">{formatPercentage(employee.workPercent, 2)}</p></div>
      {!editing && <Button size="sm" variant="ghost" aria-expanded={editing} onClick={() => setEditing(true)}><Pencil /> Изменить</Button>}
    </div>
    {editing && <form onSubmit={(event) => void save(event)} className="mt-3 border-t pt-3">
    <label htmlFor="employee-work-percent" className="text-xs font-medium">Процент выплаты сотруднику</label>
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <Input id="employee-work-percent" inputMode="decimal" className="w-24" value={value} disabled={mutation.isPending} aria-invalid={Boolean(error)} aria-describedby={error ? 'employee-percent-help employee-percent-error' : 'employee-percent-help'} onChange={(event) => { setValue(event.target.value); setError('') }} />
      <span aria-hidden="true">%</span>
      <Button type="submit" disabled={mutation.isPending || number === employee.workPercent}>{mutation.isPending ? 'Сохранение…' : 'Сохранить'}</Button>
      <Button type="button" size="sm" variant="ghost" disabled={mutation.isPending} onClick={() => { setValue(String(employee.workPercent)); setError(''); setEditing(false) }}>Отмена</Button>
    </div>
    {error && <p id="employee-percent-error" role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
    <p id="employee-percent-help" className="mt-3 text-xs leading-relaxed text-muted-foreground">Только для новых работ. У выполненных работ сохраняется прежняя ставка.</p>
    </form>}
  </section>
}
