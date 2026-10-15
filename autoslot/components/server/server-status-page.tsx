'use client'

import type { ReactNode } from 'react'
import {
  Clock3,
  Cloud,
  Database,
  RefreshCw,
  Server,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { useServerStatus } from '@/hooks/use-server-status'
import type { ServerHealthStatus } from '@/lib/server-status-types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const STATUS_META: Record<
  ServerHealthStatus,
  { label: string; dotClassName: string; panelClassName: string }
> = {
  Healthy: {
    label: 'Работает',
    dotClassName: 'bg-emerald-500',
    panelClassName: 'border-emerald-500/25 bg-emerald-500/5',
  },
  Degraded: {
    label: 'Есть проблемы',
    dotClassName: 'bg-amber-500',
    panelClassName: 'border-amber-500/25 bg-amber-500/5',
  },
  Unhealthy: {
    label: 'Недоступен',
    dotClassName: 'bg-destructive',
    panelClassName: 'border-destructive/25 bg-destructive/5',
  },
}

const SYSTEM_TITLES: Record<ServerHealthStatus, string> = {
  Healthy: 'Система работает нормально',
  Degraded: 'Некоторые компоненты работают с ограничениями',
  Unhealthy: 'Система временно недоступна',
}

export function ServerStatusPage() {
  const statusQuery = useServerStatus()
  const status = statusQuery.data

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Сервер</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Состояние инфраструктуры AutoSlot
          </p>
        </div>

        <Button
          variant="outline"
          disabled={statusQuery.isFetching}
          aria-label="Обновить состояние сервера"
          onClick={() => void statusQuery.refetch()}
        >
          <RefreshCw className={statusQuery.isFetching ? 'animate-spin' : undefined} />
          {statusQuery.isFetching ? 'Обновляем…' : 'Обновить'}
        </Button>
      </div>

      {statusQuery.isPending ? (
        <ServerStatusSkeleton />
      ) : !status ? (
        <InitialError onRetry={() => void statusQuery.refetch()} />
      ) : (
        <div className="mt-8 space-y-4">
          {statusQuery.isError && (
            <div
              role="alert"
              className="flex flex-col items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm sm:flex-row"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">Не удалось обновить данные</p>
                <p className="mt-0.5 text-muted-foreground">
                  Показано последнее успешно полученное состояние.
                </p>
              </div>
              <Button className="sm:ml-auto" size="sm" variant="outline" onClick={() => void statusQuery.refetch()}>
                Повторить
              </Button>
            </div>
          )}

          <OverallStatusCard
            status={status.status}
            checkedAtUtc={status.checkedAtUtc}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <ServiceCard
              icon={<Server />}
              title="API"
              status={status.api.status}
            >
              <Metric label="Время работы" value={formatUptime(status.api.uptimeSeconds)} />
              <Metric label="Версия" value={status.api.version || 'Не указана'} />
            </ServiceCard>

            <ServiceCard
              icon={<Database />}
              title="База данных"
              subtitle="PostgreSQL"
              status={status.database.status}
            >
              <Metric
                label="Время ответа"
                value={`${Math.max(0, status.database.latencyMs)} мс`}
              />
            </ServiceCard>
          </div>

          <InfrastructureCard />
        </div>
      )}
    </main>
  )
}

function OverallStatusCard({
  status,
  checkedAtUtc,
}: {
  status: ServerHealthStatus
  checkedAtUtc: string
}) {
  const meta = STATUS_META[status]

  return (
    <Card className={meta.panelClassName}>
      <CardHeader>
        <CardTitle className="text-xl">{SYSTEM_TITLES[status]}</CardTitle>
        <CardDescription>
          Актуальное состояние API и подключения к базе данных
        </CardDescription>
        <CardAction className="col-span-2 col-start-1 row-start-3 mt-2 justify-self-start sm:col-span-1 sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:mt-0 sm:justify-self-end">
          <StatusLabel status={status} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 className="size-4" />
          <span>Последняя проверка</span>
          <time dateTime={checkedAtUtc} className="font-medium text-foreground">
            {formatCheckedAt(checkedAtUtc)}
          </time>
        </div>
      </CardContent>
    </Card>
  )
}

function ServiceCard({
  icon,
  title,
  subtitle,
  status,
  children,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  status: ServerHealthStatus
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted [&_svg]:size-4">
            {icon}
          </span>
          <div>
            <CardTitle>{title}</CardTitle>
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </div>
        </div>
        <CardAction>
          <StatusLabel status={status} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 border-t pt-4 sm:grid-cols-2">{children}</dl>
      </CardContent>
    </Card>
  )
}

function StatusLabel({ status }: { status: ServerHealthStatus }) {
  const meta = STATUS_META[status]

  return (
    <span className="inline-flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 text-xs font-medium">
      <span aria-hidden className={`size-2 rounded-full ${meta.dotClassName}`} />
      {meta.label}
    </span>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold tabular-nums break-words">{value}</dd>
    </div>
  )
}

function InfrastructureCard() {
  const items = [
    { icon: Cloud, label: 'Frontend', value: 'Vercel' },
    { icon: Server, label: 'Backend', value: 'Selectel' },
    { icon: Database, label: 'Database', value: 'PostgreSQL' },
    { icon: ShieldCheck, label: 'HTTPS / Reverse proxy', value: 'Caddy' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Инфраструктура</CardTitle>
        <CardDescription>
          Информация о размещении компонентов, не live-метрики
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex min-w-0 items-center gap-3 rounded-lg border p-3">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="truncate font-medium">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

function InitialError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="mt-8 border-destructive/25">
      <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
        <TriangleAlert className="size-9 text-destructive" />
        <h2 className="mt-4 text-lg font-semibold">
          Не удалось получить состояние сервера
        </h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Проверьте подключение и повторите запрос. Ранее загруженных данных нет.
        </p>
        <Button className="mt-5" variant="outline" onClick={onRetry}>
          <RefreshCw /> Повторить
        </Button>
      </CardContent>
    </Card>
  )
}

function ServerStatusSkeleton() {
  return (
    <div role="status" aria-label="Загрузка состояния сервера" className="mt-8 space-y-4 animate-pulse">
      <div className="h-40 rounded-xl bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-52 rounded-xl bg-muted" />
        <div className="h-52 rounded-xl bg-muted" />
      </div>
      <div className="h-44 rounded-xl bg-muted" />
    </div>
  )
}

export function formatUptime(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const days = Math.floor(seconds / 86_400)
  const hours = Math.floor((seconds % 86_400) / 3_600)
  const minutes = Math.floor((seconds % 3_600) / 60)
  const remainingSeconds = seconds % 60

  const parts = [
    days ? `${days} д.` : '',
    hours ? `${hours} ч.` : '',
    minutes ? `${minutes} мин.` : '',
  ].filter(Boolean)

  if (parts.length === 0) return `${remainingSeconds} сек.`
  return parts.slice(0, 3).join(' ')
}

function formatCheckedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Неизвестно'

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date)
}
