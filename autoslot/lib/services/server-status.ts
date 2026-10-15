import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/auth-types'
import type { ServerStatus } from '@/lib/server-status-types'

export async function getServerStatus(signal?: AbortSignal) {
  const response = await api.get<ApiResponse<ServerStatus>>('server/status', {
    signal,
  })

  if (!response.data.data) {
    throw new Error('Server status response does not contain data.')
  }

  return response.data.data
}
