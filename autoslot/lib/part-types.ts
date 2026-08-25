export type Part = {
  id: string
  name: string
  description: string | null
  article: string | null
  purchasePrice: number
  basePrice: number
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export type PartPayload = {
  name: string
  description: string | null
  article: string | null
  purchasePrice: number
  basePrice: number
}

export type PartSearchResult = {
  items: Part[]
  hasMore: boolean
  nextOffset: number | null
}
