import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { SchedulePageContent } from '@/components/calendar/schedule-page-content'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

export default function SchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[500px] items-center justify-center">
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SchedulePageContent />
    </Suspense>
  )
}
