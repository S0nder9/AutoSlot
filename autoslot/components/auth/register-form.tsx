'use client'

import { Loader2 } from 'lucide-react'
import { useRegister } from '@/hooks/use-register'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RegisterForm() {
  const { fieldErrors, form, handleChange, handleSubmit, loading } = useRegister()

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Имя пользователя</Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          placeholder="ivan"
          value={form.username}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.username)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.password)}
        />
      </div>
      

      <Button type="submit" className="mt-2 w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Создать аккаунт
      </Button>
    </form>
  )
}
