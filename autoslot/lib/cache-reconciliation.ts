import type { InfiniteData, QueryClient, QueryKey } from '@tanstack/react-query'
import { getApiSessionVersion } from '@/lib/api'
import { CanceledError } from 'axios'

type CatalogItem = { id: string; isActive: boolean }
type SearchPage<T> = { items: T[]; hasMore: boolean; nextOffset: number | null }

export function invalidateScheduleAnalytics(client: QueryClient, scheduleId: string) {
  return client.invalidateQueries({
    predicate: ({ queryKey }) => queryKey[1] === scheduleId &&
      (queryKey[0] === 'schedule-statistics' || queryKey[0] === 'entity-analytics'),
    refetchType: 'none',
  })
}

// Keep confirmed catalog values coherent without guessing server fuzzy matches.
export async function reconcileCatalogMutation<T extends CatalogItem>(
  client: QueryClient, key: QueryKey, itemOrId: T | string,
  compare: (left: T, right: T) => number,
) {
  const version = getApiSessionVersion()
  await client.cancelQueries({ queryKey: key })
  if (version !== getApiSessionVersion()) throw new CanceledError('Session changed')
  const removed = typeof itemOrId === 'string' || !itemOrId.isActive
  const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id
  client.setQueryData<T[]>(key, (current) => {
    if (!current) return current // Never turn a not-yet-loaded list into a partial one.
    const next = current.filter((item) => item.id !== id)
    if (!removed && typeof itemOrId !== 'string') next.push(itemOrId)
    return next.sort(compare)
  })
  client.setQueriesData<T>({ queryKey: [...key, 'detail', id] }, (current) =>
    current && (typeof itemOrId === 'string' ? { ...current, isActive: false } : itemOrId))
  const searchKey = [...key, 'search']
  client.setQueriesData<InfiniteData<SearchPage<T>, number>>({ queryKey: searchKey }, (current) => {
    if (!current) return current
    let deleted = 0
    const pageParams: number[] = []
    const pages = current.pages.map((page, index) => {
      pageParams.push(Math.max(0, current.pageParams[index] - deleted))
      const items = page.items.flatMap((item) => {
        if (item.id !== id) return [item]
        if (removed) { deleted += 1; return [] }
        return typeof itemOrId === 'string' ? [] : [itemOrId]
      })
      return { ...page, items, nextOffset: page.nextOffset === null ? null : Math.max(0, page.nextOffset - deleted) }
    })
    return { ...current, pages, pageParams }
  })
  // A changed name/owner can change search membership and order. Only active
  // search observers refetch; no list GET after a normal successful mutation.
  void client.invalidateQueries({ queryKey: searchKey, refetchType: removed ? 'none' : 'active' })
  if (client.getQueryData(key) === undefined) void client.refetchQueries({ queryKey: key, exact: true, type: 'active' })
  if (typeof key[1] === 'string') void invalidateScheduleAnalytics(client, key[1])
}
