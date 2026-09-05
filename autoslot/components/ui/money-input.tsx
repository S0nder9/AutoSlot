'use client'

import { useState, type ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { parseDecimalInput } from '@/lib/validations/money'

// Preserve the user's decimal separator and unfinished input while editing.
export function MoneyInput({ value, onValueChange, ...props }: Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> & { value: number; onValueChange: (value: number) => void }) {
  const [text, setText] = useState(String(value))
  return <Input {...props} type="text" inputMode="decimal" value={text} onChange={(event) => {
    setText(event.target.value)
    onValueChange(parseDecimalInput(event.target.value))
  }} />
}
