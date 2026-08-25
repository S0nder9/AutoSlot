export type Car = {
  id: string
  clientId: string
  brand: string
  model: string | null
  licensePlate: string | null
  vin: string | null
  displayName: string
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export type CarPayload = {
  clientId: string
  brand: string
  model: string | null
  licensePlate: string | null
  vin: string | null
}

export type CarSearchResult = {
  items: Car[]
  hasMore: boolean
  nextOffset: number | null
}
