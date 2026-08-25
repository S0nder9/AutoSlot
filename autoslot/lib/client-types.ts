export type Client = {
  id: string
  name: string
  phone: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export type ClientPayload = {
  name: string
  phone: string | null
}

export type ClientSearchResult = {
  items: Client[]
  hasMore: boolean
  nextOffset: number | null
}
