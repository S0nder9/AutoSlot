import { JobsPageContent } from '@/components/jobs/jobs-page-content'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

export default function JobsPage() {
   return (
    <Suspense
      fallback={
        <div className="flex min-h-[500px] items-center justify-center">
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  )
}
