'use client'

import { useQuery } from '@tanstack/react-query'
import { getServerStatus } from '@/lib/services/server-status'

export const serverStatusQueryKey = ['server-status'] as const

export function useServerStatus() {
  return useQuery({
    queryKey: serverStatusQueryKey,
    queryFn: ({ signal }) => getServerStatus(signal),
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
    retry: false,
  })
}
