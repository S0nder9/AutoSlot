import { Construction } from 'lucide-react'

export function DashboardPlaceholder({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed bg-background px-6 text-center">
        <Construction className="size-10 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Раздел в разработке</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Здесь скоро появятся новые возможности AutoSlot.
        </p>
      </div>
    </main>
  )
}
