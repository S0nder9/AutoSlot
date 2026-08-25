export type Employee = {
  id: string
  firstName: string
  middleName: string | null
  lastName: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export type EmployeePayload = {
  firstName: string
  middleName: string | null
  lastName: string | null
}

export type EmployeeSearchResult = {
  items: Employee[]
  hasMore: boolean
  nextOffset: number | null
}

export function formatEmployeeName(employee: Employee) {
  return [employee.lastName, employee.firstName, employee.middleName]
    .filter(Boolean)
    .join(' ')
}
