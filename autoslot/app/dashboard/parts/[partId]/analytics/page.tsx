import { Suspense } from 'react'
import { EntityAnalyticsPageContent } from '@/components/analytics/entity-analytics-page-content'
export default function Page() { return <Suspense fallback={null}><EntityAnalyticsPageContent kind="parts" /></Suspense> }
