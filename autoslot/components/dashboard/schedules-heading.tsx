import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SchedulesHeading({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Мои календари</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Управляйте календарями записей автосервиса
        </p>
      </div>
      <Button size="lg" onClick={onCreate}>
        <Plus />
        Создать календарь
      </Button>
    </div>
  )
}
