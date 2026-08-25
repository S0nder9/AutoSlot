'use client'

import { createPortal } from 'react-dom'
import { CarForm } from '@/components/cars/car-form'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import { useScheduleCars } from '@/hooks/use-schedule-cars'
import type { Car, CarPayload } from '@/lib/car-types'

type Props = { scheduleId: string; car?: Car; fixedClientId?: string; fixedClientName?: string | null; onClose: () => void; onCreated?: (car: Car) => void }
export function CarFormDialog({ scheduleId, car, fixedClientId, fixedClientName, onClose, onCreated }: Props) {
  const cars = useScheduleCars(scheduleId); const pending = car ? cars.isUpdating : cars.isCreating
  const submit = (payload: CarPayload) => car ? cars.updateCar(car.id, payload) : cars.createCar(payload)
  const success = (saved: Car) => { if (!car) onCreated?.(saved); onClose() }
  return createPortal(<ScheduleDialogShell title={car ? 'Редактировать автомобиль' : 'Добавить автомобиль'} description={car ? 'Измените данные автомобиля.' : 'Добавьте автомобиль клиента.'} titleId="car-form-title" descriptionId="car-form-description" disabled={pending} onClose={onClose}><CarForm scheduleId={scheduleId} car={car} fixedClientId={fixedClientId} fixedClientName={fixedClientName} isPending={pending} onSubmit={submit} onSuccess={success} onCancel={onClose} /></ScheduleDialogShell>, document.body)
}
