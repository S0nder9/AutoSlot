import type { ChangeEventHandler } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ScheduleNameFieldProps = {
  id: string
  value: string
  error: string | null
  placeholder?: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

export function ScheduleNameField({
  id,
  value,
  error,
  placeholder,
  onChange,
}: ScheduleNameFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Название</Label>
      <Input
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
