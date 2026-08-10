import {
  BarChart3,
  CalendarDays,
  ChartPie,
  Gauge,
  ServerCog,
  SquareFunction,
  type LucideIcon,
} from 'lucide-react'

export type DashboardNavigationItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const dashboardNavigation: DashboardNavigationItem[] = [
  { label: 'Обзор', href: '/dashboard/profile', icon: Gauge },
  { label: 'Календарь', href: '/dashboard/schedule', icon: CalendarDays },
  { label: 'Статистика', href: '/dashboard/statistics', icon: BarChart3 },
  { label: 'Аналитика', href: '/dashboard/analytics', icon: ChartPie },
  { label: 'Сервер', href: '/dashboard/server', icon: ServerCog },
  { label: 'Функции', href: '/dashboard/functions', icon: SquareFunction },
]
