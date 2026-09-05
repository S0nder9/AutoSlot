'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEmployeeForm } from '@/hooks/use-employee-form'
import type { Employee, EmployeePayload } from '@/lib/employee-types'

type EmployeeFormProps = {
  employee?: Employee
  isPending: boolean
  onSubmit: (payload: EmployeePayload) => Promise<Employee | null>
  onSuccess: (employee: Employee) => void
  onCancel: () => void
}

export function EmployeeForm({ employee, isPending, onSubmit, onSuccess, onCancel }: EmployeeFormProps) {
  const form = useEmployeeForm(employee, onSubmit, onSuccess)

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="employee-first-name">Имя *</Label>
        <Input id="employee-first-name" name="firstName" value={form.values.firstName} onChange={form.handleChange} aria-invalid={Boolean(form.errors.firstName)} autoFocus />
        {form.errors.firstName && <p className="text-sm text-destructive">{form.errors.firstName}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="employee-last-name">Фамилия</Label>
          <Input id="employee-last-name" name="lastName" value={form.values.lastName} onChange={form.handleChange} />
          {form.errors.lastName && <p className="text-sm text-destructive">{form.errors.lastName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="employee-middle-name">Отчество</Label>
          <Input id="employee-middle-name" name="middleName" value={form.values.middleName} onChange={form.handleChange} />
          {form.errors.middleName && <p className="text-sm text-destructive">{form.errors.middleName}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>Отмена</Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          {isPending ? (employee ? 'Сохранение...' : 'Создание...') : (employee ? 'Сохранить' : 'Создать')}
        </Button>
      </div>
    </form>
  )
}
