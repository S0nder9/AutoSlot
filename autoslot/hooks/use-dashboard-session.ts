'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'

export function useDashboardSession() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      router.replace('/auth/login')
      setIsLoggingOut(false)
    }
  }, [logout, router])

  return { user, isLoggingOut, handleLogout }
}
