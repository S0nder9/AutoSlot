'use client'

import { type ChangeEvent, type FormEvent, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { EventClientField } from '@/components/calendar/event-client-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Car, CarPayload } from '@/lib/car-types'
import { carFormSchema, type CarFormValues } from '@/lib/validations/car'

type Props = { scheduleId: string; car?: Car; fixedClientId?: string; fixedClientName?: string | null; isPending: boolean; onSubmit: (payload: CarPayload) => Promise<Car | null>; onSuccess: (car: Car) => void; onCancel: () => void }

export function CarForm({ scheduleId, car, fixedClientId, fixedClientName, isPending, onSubmit, onSuccess, onCancel }: Props) {
  const [values, setValues] = useState<CarFormValues>(() => ({ clientId: fixedClientId ?? car?.clientId ?? '', brand: car?.brand ?? '', model: car?.model ?? '', licensePlate: car?.licensePlate ?? '', vin: car?.vin ?? '' }))
  const [errors, setErrors] = useState<Partial<Record<keyof CarFormValues, string>>>({}); const submitting = useRef(false)
  const change = (event: ChangeEvent<HTMLInputElement>) => { const { name, value } = event.target; setValues((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: undefined })) }
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); event.stopPropagation(); if (submitting.current) return; const parsed = carFormSchema.safeParse(values); if (!parsed.success) { const next: Partial<Record<keyof CarFormValues, string>> = {}; for (const issue of parsed.error.issues) next[issue.path[0] as keyof CarFormValues] ??= issue.message; setErrors(next); return } submitting.current = true; try { const saved = await onSubmit({ clientId: parsed.data.clientId, brand: parsed.data.brand, model: parsed.data.model || null, licensePlate: parsed.data.licensePlate || null, vin: parsed.data.vin || null }); if (saved) onSuccess(saved) } finally { submitting.current = false } }
  return <form className="space-y-4" onSubmit={submit}>
    {fixedClientId ? <div className="space-y-2"><Label>Клиент</Label><div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">{fixedClientName ?? fixedClientId}</div></div> : <><EventClientField scheduleId={scheduleId} value={values.clientId || null} onChange={(clientId) => { setValues((current) => ({ ...current, clientId: clientId ?? '' })); setErrors((current) => ({ ...current, clientId: undefined })) }} />{errors.clientId && <p className="text-sm text-destructive">{errors.clientId}</p>}</>}
    <div className="grid gap-4 sm:grid-cols-2"><Field id="car-brand" label="Марка *" name="brand" value={values.brand} error={errors.brand} onChange={change} autoFocus /><Field id="car-model" label="Модель" name="model" value={values.model} onChange={change} /></div>
    <div className="grid gap-4 sm:grid-cols-2"><Field id="car-plate" label="Госномер" name="licensePlate" value={values.licensePlate} onChange={change} /><Field id="car-vin" label="VIN" name="vin" value={values.vin} onChange={change} /></div>
    <div className="flex justify-end gap-3"><Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>Отмена</Button><Button type="submit" disabled={isPending}>{isPending && <Loader2 className="animate-spin" />}{isPending ? 'Сохранение...' : car ? 'Сохранить' : 'Создать'}</Button></div>
  </form>
}

function Field({ id, label, error, ...props }: { id: string; label: string; error?: string } & React.ComponentProps<typeof Input>) { return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} aria-invalid={Boolean(error)} {...props} />{error && <p className="text-sm text-destructive">{error}</p>}</div> }
