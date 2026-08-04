export type User = {
  id: string
  username: string
  role: string
}

export type ApiResponse<T> = {
  success: boolean
  data: T | null
  errors: Array<{
    code: string
    message: string
    field?: string | null
  }> | null
}
