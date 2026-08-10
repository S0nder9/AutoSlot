import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const refreshExcludedPaths = [
  'auth/login',
  'auth/register',
  'auth/refresh-tokens',
]

let refreshPromise: Promise<void> | null = null
let unauthorizedHandler: (() => void) | null = null
let refreshSuccessHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

export function setRefreshSuccessHandler(handler: (() => void) | null) {
  refreshSuccessHandler = handler
}

export function refreshAccessToken(): Promise<void> {
  refreshPromise ??= api
    .post('auth/refresh-tokens')
    .then(() => {
      refreshSuccessHandler?.()
    })
    .catch((refreshError) => {
      unauthorizedHandler?.()
      throw refreshError
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

function isRefreshExcluded(url?: string) {
  return refreshExcludedPaths.some((path) => url?.includes(path))
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined

    if (
      !request ||
      request._retry ||
      error.response?.status !== 401 ||
      isRefreshExcluded(request.url)
    ) {
      return Promise.reject(error)
    }

    request._retry = true

    try {
      await refreshAccessToken()
    } catch {
      return Promise.reject(error)
    }

    return api(request)
  },
)
