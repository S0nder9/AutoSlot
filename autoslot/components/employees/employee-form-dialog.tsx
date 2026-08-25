'use client'

import { createPortal } from 'react-dom'
import { EmployeeForm } from '@/components/employees/employee-form'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import { useScheduleEmployees } from '@/hooks/use-schedule-employees'
import type { Employee, EmployeePayload } from '@/lib/employee-types'

type EmployeeFormDialogProps = {
  scheduleId: string
  employee?: Employee
  onClose: () => void
  onCreated?: (employee: Employee) => void
}

export function EmployeeFormDialog({ scheduleId, employee, onClose, onCreated }: EmployeeFormDialogProps) {
  const employees = useScheduleEmployees(scheduleId)
  const isPending = employee ? employees.isUpdating : employees.isCreating
  const handleSubmit = (payload: EmployeePayload) =>
    employee ? employees.updateEmployee(employee.id, payload) : employees.createEmployee(payload)
  const handleSuccess = (savedEmployee: Employee) => {
    if (!employee) onCreated?.(savedEmployee)
    onClose()
  }

  return createPortal(
    <ScheduleDialogShell
      title={employee ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
      description={employee ? 'Измените данные сотрудника и сохраните результат.' : 'Добавьте сотрудника в текущий календарь.'}
      titleId="employee-form-title"
      descriptionId="employee-form-description"
      disabled={isPending}
      onClose={onClose}
    >
      <EmployeeForm employee={employee} isPending={isPending} onSubmit={handleSubmit} onSuccess={handleSuccess} onCancel={onClose} />
    </ScheduleDialogShell>,
    document.body,
  )
}
