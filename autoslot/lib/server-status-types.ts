export type ServerHealthStatus = 'Healthy' | 'Degraded' | 'Unhealthy'

export type ServerStatus = {
  status: ServerHealthStatus
  checkedAtUtc: string
  api: {
    status: ServerHealthStatus
    uptimeSeconds: number
    version: string | null
  }
  database: {
    status: ServerHealthStatus
    latencyMs: number
  }
}
