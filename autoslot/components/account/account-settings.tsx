'use client'

import { useCallback, useState } from 'react'
import { LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/auth-provider'
import { LogoutAllDialog } from '@/components/account/logout-all-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getRequestError } from '@/lib/request-error'

export function AccountSettings() {
  const { user, logoutAll } = useAuth()
  const router = useRouter()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false)

  const closeConfirmation = useCallback(() => {
    setIsConfirmOpen(false)
  }, [])

  const handleLogoutAll = useCallback(async () => {
    setIsLoggingOutAll(true)

    try {
      await logoutAll()
      toast.success('Все активные сессии завершены')
    } catch (error) {
      toast.error(
        getRequestError(error, 'Не удалось завершить все активные сессии'),
      )
    } finally {
      setIsLoggingOutAll(false)
      setIsConfirmOpen(false)
      router.replace('/auth/login')
    }
  }, [logoutAll, router])

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900">
          <UserRound className="size-5" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Настройки профиля
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Управление аккаунтом и активными сессиями.
          </p>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Аккаунт</CardTitle>
          <CardDescription>
            Основная информация текущего пользователя.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Имя пользователя
            </p>
            <p className="mt-1 font-medium">{user?.username}</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Роль
            </p>
            <p className="mt-1 font-medium">{user?.role}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            Активные сессии
          </CardTitle>
          <CardDescription>
            Завершите все сессии аккаунта, если вы потеряли доступ к одному
            из устройств или заметили подозрительную активность.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setIsConfirmOpen(true)}
          >
            <LogOut />
            Выйти со всех устройств
          </Button>
        </CardContent>
      </Card>

      {isConfirmOpen && (
        <LogoutAllDialog
          isPending={isLoggingOutAll}
          onConfirm={handleLogoutAll}
          onClose={closeConfirmation}
        />
      )}
    </main>
  )
}
