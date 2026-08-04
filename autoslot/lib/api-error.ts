export type ApiErrorItem = {
  code: string
  field?: string | null
  message: string
}

export type ApiErrorResponse = {
  data?: unknown | null
  errors: ApiErrorItem[] | null
  success: boolean
}

export function isApiErrorResponse(
  value: unknown,
): value is ApiErrorResponse & { errors: ApiErrorItem[] } {
  if (!value || typeof value !== 'object' || !('errors' in value)) {
    return false
  }

  const { errors } = value

  return (
    Array.isArray(errors) &&
    errors.every(
      (error) =>
        error &&
        typeof error === 'object' &&
        typeof error.message === 'string' &&
        (typeof error.field === 'string' ||
          error.field === null ||
          error.field === undefined),
    )
  )
}
