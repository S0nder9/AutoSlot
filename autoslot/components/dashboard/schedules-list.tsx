import { CalendarDays, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScheduleCard } from '@/components/dashboard/schedule-card'
import type { Schedule } from '@/lib/schedule-types'
import { useRouter } from 'next/navigation'

type SchedulesListProps = {
  schedules: Schedule[]
  ownerName?: string
  isLoading: boolean
  onCreate: () => void
  onEdit: (schedule: Schedule) => void
  onDelete: (schedule: Schedule) => void
}

export function SchedulesList({
  schedules,
  ownerName,
  isLoading,
  onCreate,
  onEdit,
  onDelete,
}: SchedulesListProps) {
  const nav = useRouter();
  
  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="size-7 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <div className="mt-10 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-background px-6 text-center">
        <CalendarDays className="size-10 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Календарей пока нет</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Создайте первый календарь, чтобы добавлять сотрудников, работы и записи
          клиентов.
        </p>
        <Button className="mt-5" onClick={onCreate}>
          <Plus />
          Создать календарь
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {schedules.map((schedule) => (
        <ScheduleCard
          key={schedule.id}
          schedule={schedule}
          ownerName={ownerName}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={() => nav.push(`/dashboard/schedule?scheduleId=${schedule.id}`)}
        />
      ))}
    </div>
  )
}
