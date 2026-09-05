import {
  CalendarDays,
  CarFront,
  ChartPie,
  Gauge,
  Package,
  ServerCog,
  SquareFunction,
  Users,
  UsersRound,
  WorkflowIcon,
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
  { label: 'Работы', href: '/dashboard/jobs', icon: WorkflowIcon },
  { label: 'Сотрудники', href: '/dashboard/employees', icon: Users },
  { label: 'Клиенты', href: '/dashboard/clients', icon: UsersRound },
  { label: 'Автомобили', href: '/dashboard/cars', icon: CarFront },
  { label: 'Запчасти', href: '/dashboard/parts', icon: Package },
  { label: 'Аналитика', href: '/dashboard/analytics', icon: ChartPie },
  { label: 'Сервер', href: '/dashboard/server', icon: ServerCog },
  { label: 'Функции', href: '/dashboard/functions', icon: SquareFunction },
]
