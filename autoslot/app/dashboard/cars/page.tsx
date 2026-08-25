import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { CarsPageContent } from '@/components/cars/cars-page-content'
export default function CarsPage() { return <Suspense fallback={<div className="flex min-h-[500px] items-center justify-center"><Loader2 className="size-7 animate-spin" /></div>}><CarsPageContent /></Suspense> }
