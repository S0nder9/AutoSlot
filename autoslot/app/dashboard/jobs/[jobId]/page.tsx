import { Suspense } from 'react'
import { JobPageContent } from '@/components/jobs/job-page-content'

export default function JobPage() {
  return (
    <Suspense fallback={null}>
      <JobPageContent />
    </Suspense>
  )
}
