'use client'

import type { ReactNode } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { useDashboardSession } from '@/hooks/use-dashboard-session'
import { useMobileSidebar } from '@/hooks/use-mobile-sidebar'

export function DashboardShell({ children }: { children: ReactNode }) {
  const session = useDashboardSession()
  const sidebar = useMobileSidebar()

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-muted/20">
        <DashboardSidebar />

        {sidebar.isOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <DashboardSidebar mobile onNavigate={sidebar.close} />
            <button
              type="button"
              className="flex-1 bg-black/50 backdrop-blur-[1px]"
              aria-label="Закрыть меню"
              onClick={sidebar.close}
            />
          </div>
        )}

        <div className="min-w-0 flex-1 ип">
          <DashboardHeader
            user={session.user}
            isLoggingOut={session.isLoggingOut}
            onLogout={session.handleLogout}
            onMenuOpen={sidebar.open}
          />
          {children}
        </div>
      </div>
    </ProtectedRoute>
  )
}
