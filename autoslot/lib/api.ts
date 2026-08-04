import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiErrorResponse } from '@/lib/api-error'

/**
 * Общий axios-инстанс для запросов к API autoSlot.
 * Базовый URL задаётся через переменную окружения NEXT_PUBLIC_API_URL.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean }

const refreshExcludedPaths = [
  'auth/login',
  'auth/register',
  'auth/refresh-tokens',
]

let refreshPromise: Promise<void> | null = null
let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

function isRefreshExcluded(url?: string) {
  return refreshExcludedPaths.some((path) => url?.includes(path))
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const request = error.config as RetryableRequest | undefined
    const errorCode = error.response?.data?.errors?.[0]?.code

    if (
      !request ||
      request._retry ||
      error.response?.status !== 401 ||
      errorCode !== 'TOKEN_EXPIRED' ||
      isRefreshExcluded(request.url)
    ) {
      return Promise.reject(error)
    }

    request._retry = true

    refreshPromise ??= api
      .post('auth/refresh-tokens')
      .then(() => undefined)
      .catch((refreshError) => {
        unauthorizedHandler?.()
        throw refreshError
      })
      .finally(() => {
        refreshPromise = null
      })

    await refreshPromise
    return api(request)
  },
)
