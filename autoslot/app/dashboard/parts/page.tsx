import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { PartsPageContent } from '@/components/parts/parts-page-content'

export default function PartsPage() {
  return <Suspense fallback={<div className="flex min-h-[500px] items-center justify-center"><Loader2 className="size-7 animate-spin text-muted-foreground" /></div>}><PartsPageContent /></Suspense>
}
