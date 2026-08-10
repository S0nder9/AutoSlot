'use client'

import { CreateScheduleDialog } from '@/components/dashboard/create-schedule-dialog'
import { DeleteScheduleDialog } from '@/components/dashboard/delete-schedule-dialog'
import { EditScheduleDialog } from '@/components/dashboard/edit-schedule-dialog'
import { SchedulesHeading } from '@/components/dashboard/schedules-heading'
import { SchedulesList } from '@/components/dashboard/schedules-list'
import { useAuth } from '@/components/auth/auth-provider'
import { useScheduleDialogs } from '@/hooks/use-schedule-dialogs'
import { useSchedules } from '@/hooks/use-schedules'

export function ProfileDashboard() {
  const { user } = useAuth()
  const dialogs = useScheduleDialogs()
  const schedules = useSchedules()

  return (
    <main>
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <SchedulesHeading onCreate={dialogs.openCreate} />
        <SchedulesList
          schedules={schedules.schedules}
          ownerName={user?.username}
          isLoading={schedules.isLoading}
          onCreate={dialogs.openCreate}
          onEdit={dialogs.openEdit}
          onDelete={dialogs.openDelete}
        />
      </section>

      {dialogs.isCreateOpen && (
        <CreateScheduleDialog
          isPending={schedules.isCreating}
          onCreate={schedules.create}
          onClose={dialogs.closeCreate}
        />
      )}

      {dialogs.editingSchedule && (
        <EditScheduleDialog
          schedule={dialogs.editingSchedule}
          isPending={schedules.pendingId === dialogs.editingSchedule.id}
          onUpdate={schedules.update}
          onClose={dialogs.closeEdit}
        />
      )}

      {dialogs.deletingSchedule && (
        <DeleteScheduleDialog
          schedule={dialogs.deletingSchedule}
          isPending={schedules.pendingId === dialogs.deletingSchedule.id}
          onDelete={schedules.remove}
          onClose={dialogs.closeDelete}
        />
      )}
    </main>
  )
}
