import { isAxiosError } from 'axios'
import { isApiErrorResponse } from '@/lib/api-error'

export function getRequestError(error: unknown, fallback: string) {
  if (isAxiosError(error) && isApiErrorResponse(error.response?.data)) {
    return error.response.data.errors[0]?.message ?? fallback
  }

  return fallback
}
