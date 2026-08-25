export type Job = {
  id: string
  name: string
  description: string | null
  basePrice: number
  estimatedHours: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export type JobPayload = {
  name: string
  description: string | null
  basePrice: number
  estimatedHours: number | null
}

export type JobSearchResult = {
  items: Job[]
  hasMore: boolean
  nextOffset: number | null
}
