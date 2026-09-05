import { Suspense } from 'react'
import { EmployeeAnalyticsPageContent } from '@/components/analytics/employee-analytics-page-content'

export default function EmployeeAnalyticsPage() {
  return <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Загрузка аналитики сотрудника…</div>}>
    <EmployeeAnalyticsPageContent />
  </Suspense>
}
