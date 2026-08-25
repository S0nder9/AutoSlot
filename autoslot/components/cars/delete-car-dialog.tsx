'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { ScheduleDialogShell } from '@/components/dashboard/schedule-dialog-shell'
import { Button } from '@/components/ui/button'
import type { Car } from '@/lib/car-types'

export function DeleteCarDialog({ car, isPending, onConfirm, onClose }: { car: Car; isPending: boolean; onConfirm: () => void; onClose: () => void }) { return <ScheduleDialogShell title="Удалить автомобиль?" description={`Автомобиль «${car.displayName}» больше не будет доступен для новых событий.`} titleId="delete-car-title" descriptionId="delete-car-description" disabled={isPending} alert narrow onClose={onClose}><div className="flex justify-end gap-3"><Button variant="outline" disabled={isPending} onClick={onClose}>Отмена</Button><Button variant="destructive" disabled={isPending} onClick={onConfirm}>{isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}{isPending ? 'Удаление...' : 'Удалить'}</Button></div></ScheduleDialogShell> }
