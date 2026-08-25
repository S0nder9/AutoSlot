import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { ClientsPageContent } from '@/components/clients/clients-page-content'

export default function ClientsPage() {
  return <Suspense fallback={<div className="flex min-h-[500px] items-center justify-center"><Loader2 className="size-7 animate-spin text-muted-foreground" /></div>}><ClientsPageContent /></Suspense>
}
