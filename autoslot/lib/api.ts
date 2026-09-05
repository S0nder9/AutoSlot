import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()

export const api = axios.create({
  baseURL: configuredApiUrl || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean
  _sessionVersion?: number
}

const refreshExcludedPaths = [
  'auth/login',
  'auth/register',
  'auth/refresh-tokens',
]

let refreshPromise: Promise<void> | null = null
let unauthorizedHandler: (() => void) | null = null
let refreshSuccessHandler: (() => void) | null = null
let sessionVersion = 0

export const getApiSessionVersion = () => sessionVersion

// Ignore late responses from a previous account, including mutation callbacks.
export function invalidateApiSession() {
  sessionVersion += 1
  refreshPromise = null
}

api.interceptors.request.use((request: RetryableRequest) => {
  request._sessionVersion ??= sessionVersion
  if (request._sessionVersion !== sessionVersion) throw new axios.CanceledError('Session changed')
  return request
})

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

export function setRefreshSuccessHandler(handler: (() => void) | null) {
  refreshSuccessHandler = handler
}

export function refreshAccessToken(): Promise<void> {
  if (refreshPromise) return refreshPromise
  const version = sessionVersion
  const pending = api
    .post('auth/refresh-tokens')
    .then(() => {
      if (version === sessionVersion) refreshSuccessHandler?.()
    })
    .catch((refreshError) => {
      if (version === sessionVersion) unauthorizedHandler?.()
      throw refreshError
    })
    .finally(() => {
      if (refreshPromise === pending) refreshPromise = null
    })

  refreshPromise = pending
  return pending
}

function isRefreshExcluded(url?: string) {
  return refreshExcludedPaths.some((path) => url?.includes(path))
}

api.interceptors.response.use(
  (response) => {
    if ((response.config as RetryableRequest)._sessionVersion !== sessionVersion) {
      throw new axios.CanceledError('Session changed')
    }
    return response
  },
  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined
    if (request && request._sessionVersion !== sessionVersion) {
      return Promise.reject(new axios.CanceledError('Session changed'))
    }

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
