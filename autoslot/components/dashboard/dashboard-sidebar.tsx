'use client'

import Link from 'next/link'
import { ChevronRight, ShieldCheck, UserRound, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { dashboardNavigation } from '@/lib/dashboard-navigation'

type DashboardSidebarProps = {
  mobile?: boolean
  onNavigate?: () => void
}

export function DashboardSidebar({
  mobile = false,
  onNavigate,
}: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex h-full w-64 shrink-0 flex-col border-r bg-background ',
        !mobile && 'hidden lg:flex',
      )}
      aria-label="Основная навигация"
    >
      <div className="flex h-[73px] items-center gap-3 border-b px-6 pt-2 pb-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-slate-950 text-sm font-bold text-white shadow-sm">
          M
        </div>
        <span className="font-semibold">Меню</span>
        <ShieldCheck className="size-4 text-muted-foreground" />
        {mobile && (
          <Button
            className="ml-auto"
            size="icon"
            variant="ghost"
            aria-label="Закрыть меню"
            onClick={onNavigate}
          >
            <X />
          </Button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-4">
        {dashboardNavigation.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100 shadow-sm dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900'
                  : 'text-foreground hover:bg-muted',
              )}
            >
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors',
                  isActive && 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300',
                )}
              >
                <Icon className="size-4" />
              </span>
              <span>{item.label}</span>
              <ChevronRight
                className={cn(
                  'ml-auto size-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60',
                  isActive && 'opacity-100',
                )}
              />
            </Link>
          )
        })}

        <Link
          href="/account"
          onClick={onNavigate}
          aria-current={pathname.startsWith('/account') ? 'page' : undefined}
          className={cn(
            'group mt-auto flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
            pathname.startsWith('/account')
              ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100 shadow-sm dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900'
              : 'text-foreground hover:bg-muted',
          )}
        >
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors',
              pathname.startsWith('/account') &&
                'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300',
            )}
          >
            <UserRound className="size-4" />
          </span>
          <span>Профиль</span>
          <ChevronRight
            className={cn(
              'ml-auto size-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60',
              pathname.startsWith('/account') && 'opacity-100',
            )}
          />
        </Link>
      </nav>
    </aside>
  )
}
