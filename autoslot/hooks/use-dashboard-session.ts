'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { toast } from 'sonner'
import { getRequestError } from '@/lib/request-error'

export function useDashboardSession() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      toast.error(getRequestError(error, 'Сеанс на устройстве завершён. Не удалось подтвердить выход на сервере.'))
    } finally {
      router.replace('/auth/login')
      setIsLoggingOut(false)
    }
  }, [logout, router])

  return { user, isLoggingOut, handleLogout }
}
