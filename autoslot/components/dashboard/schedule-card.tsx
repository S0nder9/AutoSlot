import { CalendarDays, Pencil, Trash2, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useScheduleCardActions } from '@/hooks/use-schedule-card-actions'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Schedule } from '@/lib/schedule-types'

type ScheduleCardProps = {
  schedule: Schedule
  ownerName?: string
  onEdit: (schedule: Schedule) => void
  onDelete: (schedule: Schedule) => void
  onClick: () => void
}

export function ScheduleCard({
  schedule,
  ownerName,
  onEdit,
  onDelete,
  onClick,
}: ScheduleCardProps) {
  const actions = useScheduleCardActions(schedule, onEdit, onDelete)

  return (
    <Card className="min-h-56 transition-transform duration-300 ease-in-out hover:scale-105 hover:cursor-pointer" onClick={onClick}>
      <CardHeader>
        <CalendarDays className="mb-2 size-6" />
        <CardTitle className="text-xl">{schedule.name}</CardTitle>
        <CardDescription className="break-all">ID: {schedule.id}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserRound className="size-4" />
          Владелец: {ownerName}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            size="icon"
            variant="outline"
            aria-label="Переименовать календарь"
            onClick={actions.handleEdit}
          >
            <Pencil />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            aria-label="Удалить календарь"
            onClick={actions.handleDelete}
          >
            <Trash2 />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
