import { Loader2, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User } from '@/lib/auth-types'

type DashboardHeaderProps = {
  user: User | null
  isLoggingOut: boolean
  onLogout: () => void
  onMenuOpen: () => void
}

export function DashboardHeader({
  user,
  isLoggingOut,
  onLogout,
  onMenuOpen,
}: DashboardHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="flex min-h-[72px] items-center justify-between px-5 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            className="lg:hidden"
            aria-label="Открыть меню"
            onClick={onMenuOpen}
          >
            <Menu />
          </Button>
          <div>
          <p className="text-lg font-semibold">autoSlot</p>
          <p className="text-sm text-muted-foreground">
            {user?.username} · {user?.role}
          </p>
          </div>
        </div>
        <Button variant="outline" disabled={isLoggingOut} onClick={onLogout}>
          {isLoggingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
          Выйти
        </Button>
      </div>
    </header>
  )
}
