'use client'

import type { ReactNode } from 'react'

export function AnalyticsMetrics({ items }: { items: Array<{ label: string; value: ReactNode; accent?: boolean; negative?: boolean }> }) {
  return <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{items.map((item) => <div key={item.label} className={`rounded-xl border p-4 ${item.accent ? 'border-blue-500/30 bg-blue-500/5' : 'bg-background'}`}><dt className="text-xs text-muted-foreground">{item.label}</dt><dd className={`mt-2 text-xl font-semibold tabular-nums ${item.negative ? 'text-destructive' : item.accent ? 'text-blue-700 dark:text-blue-400' : ''}`}>{item.value}</dd></div>)}</dl>
}

export function AnalyticsState({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <div className={`rounded-xl border border-dashed px-5 py-10 text-center text-sm ${error ? 'text-destructive' : 'text-muted-foreground'}`}>{children}</div>
}

export function AnalyticsSkeleton() {
  return <div className="space-y-5 animate-pulse" aria-label="Загрузка аналитики"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-24 rounded-xl bg-muted" />)}</div><div className="h-52 rounded-xl bg-muted" /><div className="h-48 rounded-xl bg-muted" /></div>
}

export function AnalyticsTable({ label, minWidth, children }: { label: string; minWidth: string; children: ReactNode }) {
  return <div className="overflow-x-auto rounded-xl border"><table aria-label={label} className={`w-full text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:bg-muted/40 [&_th]:px-4 [&_th]:py-3 [&_th]:font-medium [&_th]:text-muted-foreground [&_tbody_tr]:border-t ${minWidth}`}>{children}</table></div>
}
