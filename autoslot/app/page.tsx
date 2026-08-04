'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const { user, isLoading, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logout()
      toast.success('Вы вышли из аккаунта')
    } catch {
      toast.error('Не удалось завершить сессию на сервере', {
        description: 'Вы вышли из аккаунта в текущем интерфейсе.',
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex max-w-md flex-col items-center text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground text-balance sm:text-5xl">
          autoSlot
        </h1>
        <p className="mt-4 text-base text-muted-foreground text-pretty leading-relaxed">
          Запись клиентов в автосервис. Календари, события, работы и запчасти — в
          одном месте.
        </p>

        {isLoading ? (
          <Loader2
            className="mt-8 size-6 animate-spin text-muted-foreground"
            aria-label="Проверка сессии"
          />
        ) : user ? (
          <div className="mt-8 w-full rounded-xl border border-border bg-card p-5 text-left shadow-sm">
            <h2 className="text-lg font-semibold text-card-foreground">
              Ваш профиль
            </h2>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Имя</dt>
              <dd className="break-all font-medium text-foreground">
                {user.username}
              </dd>
              <dt className="text-muted-foreground">Роль</dt>
              <dd className="break-all font-medium text-foreground">
                {user.role}
              </dd>
              <dt className="text-muted-foreground">ID</dt>
              <dd className="break-all font-mono text-xs text-foreground">
                {user.id}
              </dd>
            </dl>
            <Button
              type="button"
              variant="outline"
              className="mt-5 w-full"
              disabled={isLoggingOut}
              onClick={handleLogout}
            >
              {isLoggingOut ? (
                <Loader2 className="animate-spin" />
              ) : (
                <LogOut />
              )}
              Выйти
            </Button>
          </div>
        ) : (
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/auth/register">Регистрация</Link>}
            />
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/auth/login">Вход</Link>}
            />
          </div>
        )}
      </div>
    </main>
  )
}
