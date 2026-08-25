'use client'

import { Loader2 } from 'lucide-react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePartForm } from '@/hooks/use-part-form'
import type { Part, PartPayload } from '@/lib/part-types'

type PartFormProps = {
  part?: Part
  isPending: boolean
  onSubmit: (payload: PartPayload) => Promise<Part | null>
  onSuccess: (part: Part) => void
  onCancel: () => void
}

export function PartForm({ part, isPending, onSubmit, onSuccess, onCancel }: PartFormProps) {
  const form = usePartForm(part, onSubmit, onSuccess)
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.stopPropagation()
    void form.handleSubmit(event)
  }

  return <form className="space-y-4" onSubmit={handleSubmit}>
    <div className="space-y-2"><Label htmlFor="part-name">Название *</Label><Input id="part-name" name="name" value={form.values.name} onChange={form.handleChange} aria-invalid={Boolean(form.errors.name)} maxLength={200} autoFocus />{form.errors.name && <p className="text-sm text-destructive">{form.errors.name}</p>}</div>
    <div className="space-y-2"><Label htmlFor="part-article">Артикул</Label><Input id="part-article" name="article" value={form.values.article} onChange={form.handleChange} aria-invalid={Boolean(form.errors.article)} maxLength={100} />{form.errors.article && <p className="text-sm text-destructive">{form.errors.article}</p>}</div>
    <div className="space-y-2"><Label htmlFor="part-description">Описание</Label><textarea id="part-description" name="description" value={form.values.description} onChange={form.handleChange} maxLength={500} aria-invalid={Boolean(form.errors.description)} className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" />{form.errors.description && <p className="text-sm text-destructive">{form.errors.description}</p>}</div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="part-purchase-price">Закупочная цена (₽)</Label><Input id="part-purchase-price" name="purchasePrice" type="number" min="0" step="any" inputMode="decimal" value={form.values.purchasePrice} onChange={form.handleChange} aria-invalid={Boolean(form.errors.purchasePrice)} />{form.errors.purchasePrice && <p className="text-sm text-destructive">{form.errors.purchasePrice}</p>}</div>
      <div className="space-y-2"><Label htmlFor="part-base-price">Базовая цена продажи (₽)</Label><Input id="part-base-price" name="basePrice" type="number" min="0" step="any" inputMode="decimal" value={form.values.basePrice} onChange={form.handleChange} aria-invalid={Boolean(form.errors.basePrice)} />{form.errors.basePrice && <p className="text-sm text-destructive">{form.errors.basePrice}</p>}</div>
    </div>
    <div className="flex justify-end gap-3 pt-2"><Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>Отмена</Button><Button type="submit" disabled={isPending}>{isPending && <Loader2 className="animate-spin" />}{isPending ? part ? 'Сохранение...' : 'Создание...' : part ? 'Сохранить' : 'Создать'}</Button></div>
  </form>
}
