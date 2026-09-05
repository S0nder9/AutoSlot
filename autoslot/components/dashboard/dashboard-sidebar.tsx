'use client'

import Link from 'next/link'
import { ChevronRight, PanelLeftClose, PanelLeftOpen, ShieldCheck, UserRound, X } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { dashboardNavigation } from '@/lib/dashboard-navigation'

type DashboardSidebarProps = {
  mobile?: boolean
  collapsed?: boolean
  onCollapseToggle?: () => void
  onNavigate?: () => void
}

export function DashboardSidebar({
  mobile = false,
  collapsed = false,
  onCollapseToggle,
  onNavigate,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const scheduleId = useSearchParams().get('scheduleId')

  return (
    <aside
      className={cn(
        'relative flex h-full shrink-0 flex-col border-r bg-background transition-[width] duration-200',
        mobile || !collapsed ? 'w-64' : 'w-20',
        !mobile && 'fixed inset-y-0 left-0 z-40 hidden h-dvh lg:flex',
      )}
      aria-label="Основная навигация"
    >
      <div className={cn('flex h-[73px] items-center gap-3 border-b py-2', collapsed && !mobile ? 'justify-center px-3' : 'px-6')}>
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-slate-950 text-sm font-bold text-white shadow-sm">
          M
        </div>
        {(!collapsed || mobile) && <span className="font-semibold">Меню</span>}
        {(!collapsed || mobile) && <ShieldCheck className="size-4 text-muted-foreground" />}
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
        {!mobile && (
          <Button
            className={cn(collapsed ? 'absolute top-[82px] left-1/2 -translate-x-1/2' : 'ml-auto')}
            size="icon"
            variant="ghost"
            aria-label={collapsed ? 'Развернуть боковую панель' : 'Свернуть боковую панель'}
            title={collapsed ? 'Развернуть панель' : 'Свернуть панель'}
            onClick={onCollapseToggle}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
        )}
      </div>

      <nav className={cn('flex flex-1 flex-col gap-2', collapsed && !mobile ? 'px-3 pt-14 pb-4' : 'p-4')}>
        {dashboardNavigation.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          const scoped = ['/dashboard/jobs', '/dashboard/employees', '/dashboard/clients', '/dashboard/cars', '/dashboard/parts', '/dashboard/analytics', '/dashboard/schedule'].includes(item.href)
          const href = scoped && scheduleId ? `${item.href}?${new URLSearchParams({ scheduleId })}` : item.href

          return (
            <Link
              key={item.href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              aria-label={collapsed && !mobile ? item.label : undefined}
              title={collapsed && !mobile ? item.label : undefined}
              className={cn(
                'group flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                collapsed && !mobile && 'justify-center px-0',
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
              {(!collapsed || mobile) && <span>{item.label}</span>}
              <ChevronRight
                className={cn(
                  'ml-auto size-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60',
                  collapsed && !mobile && 'hidden',
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
          aria-label={collapsed && !mobile ? 'Профиль' : undefined}
          title={collapsed && !mobile ? 'Профиль' : undefined}
          className={cn(
            'group mt-auto flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
            collapsed && !mobile && 'justify-center px-0',
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
          {(!collapsed || mobile) && <span>Профиль</span>}
          <ChevronRight
            className={cn(
              'ml-auto size-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60',
              pathname.startsWith('/account') && 'opacity-100',
              collapsed && !mobile && 'hidden',
            )}
          />
        </Link>
      </nav>
    </aside>
  )
}
