'use client'

import { type ReactNode, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2
          className="size-7 animate-spin text-muted-foreground"
          aria-label="Проверка сессии"
        />
      </main>
    )
  }

  return children
}
