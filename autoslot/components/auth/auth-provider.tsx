'use client'

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  api,
  refreshAccessToken,
  setRefreshSuccessHandler,
  setUnauthorizedHandler,
} from '@/lib/api'
import type { ApiResponse, User } from '@/lib/auth-types'
import type {
  LoginPayload,
  RegisterPayload,
} from '@/lib/validations/auth'

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login(username: string, password: string): Promise<void>
  register(username: string, password: string): Promise<void>
  logout(): Promise<void>
  logoutAll(): Promise<void>
  refreshUser(): Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const ACCESS_TOKEN_REFRESH_DELAY = 14 * 60 * 1000

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /*
   * Используется только для повторного запуска эффекта таймера
   * после успешного refresh.
   */
  const [refreshVersion, setRefreshVersion] = useState(0)

  const refreshTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null)

  /*
   * Время последнего успешного login, /me или refresh.
   *
   * Это не механизм безопасности и не срок жизни JWT.
   * Значение используется только для предотвращения
   * лишних refresh-запросов.
   */
  // const lastRefreshAtRef = useRef(Date.now())
  const lastRefreshAtRef = useRef(0 )

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  const clearLocalSession = useCallback(() => {
    clearRefreshTimer()
    queryClient.clear()
    setUser(null)
  }, [clearRefreshTimer, queryClient])

  const markAccessTokenAsFresh = useCallback(() => {
    lastRefreshAtRef.current = Date.now()
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const response =
        await api.get<ApiResponse<User>>('auth/me')

      const currentUser = response.data.data

      if (currentUser) {
        markAccessTokenAsFresh()
      }

      setUser(currentUser)
    } catch {
      setUser(null)
    }
  }, [markAccessTokenAsFresh])

  /*
   * Регистрируем обработчики для общего API-слоя.
   */
  useEffect(() => {
    setUnauthorizedHandler(clearLocalSession)

    setRefreshSuccessHandler(() => {
      markAccessTokenAsFresh()

      /*
       * Эффект ниже перезапустится и создаст новый таймер
       * на следующие 14 минут.
       */
      setRefreshVersion((current) => current + 1)
    })

    return () => {
      setUnauthorizedHandler(null)
      setRefreshSuccessHandler(null)
    }
  }, [clearLocalSession, markAccessTokenAsFresh])

  /*
   * Единственная первоначальная проверка сессии.
   */
  useEffect(() => {
    void api
      .get<ApiResponse<User>>('auth/me')
      .then((response) => {
        const currentUser = response.data.data

        if (currentUser) {
          markAccessTokenAsFresh()
        }

        setUser(currentUser)
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [markAccessTokenAsFresh])

  /*
   * Фоновое обновление access token.
   */
  useEffect(() => {
    if (!user) {
      clearRefreshTimer()
      return
    }

    const runBackgroundRefresh = () => {
      clearRefreshTimer()

      /*
       * После успеха setRefreshSuccessHandler:
       * 1. обновит lastRefreshAtRef;
       * 2. изменит refreshVersion;
       * 3. этот эффект создаст следующий таймер.
       */
      void refreshAccessToken().catch(() => {
        /*
         * unauthorizedHandler уже очистит пользователя
         * при ошибке refresh.
         */
        clearRefreshTimer()
      })
    }

    const elapsed =
      Date.now() - lastRefreshAtRef.current

    const remaining = Math.max(
      ACCESS_TOKEN_REFRESH_DELAY - elapsed,
      0,
    )

    refreshTimerRef.current = setTimeout(
      runBackgroundRefresh,
      remaining,
    )

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        return
      }

      const timeSinceLastRefresh =
        Date.now() - lastRefreshAtRef.current

      /*
       * Обычный Alt+Tab или быстрое переключение вкладок
       * больше не запускает refresh.
       */
      if (
        timeSinceLastRefresh <
        ACCESS_TOKEN_REFRESH_DELAY
      ) {
        return
      }

      runBackgroundRefresh()
    }

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    )

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      )

      clearRefreshTimer()
    }
  }, [
    clearRefreshTimer,
    refreshVersion,
    user,
  ])

  const login = useCallback(
    async (
      username: string,
      password: string,
    ) => {
      const payload: LoginPayload = {
        username,
        password,
      }

      const response =
        await api.post<ApiResponse<User>>(
          'auth/login',
          payload,
        )

      const currentUser = response.data.data

      if (!currentUser) {
        throw new Error(
          'Backend не вернул данные пользователя',
        )
      }

      markAccessTokenAsFresh()
      setUser(currentUser)
    },
    [markAccessTokenAsFresh],
  )

  const register = useCallback(
    async (
      username: string,
      password: string,
    ) => {
      const payload: RegisterPayload = {
        username,
        password,
      }

      await api.post<ApiResponse<User>>(
        'auth/register',
        payload,
      )
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await api.post('auth/logout')
    } finally {
      clearLocalSession()
    }
  }, [clearLocalSession])

  const logoutAll = useCallback(async () => {
    try {
      await api.post('auth/logout-all')
    } finally {
      clearLocalSession()
    }
  }, [clearLocalSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      logoutAll,
      refreshUser,
    }),
    [
      user,
      isLoading,
      login,
      register,
      logout,
      logoutAll,
      refreshUser,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    )
  }

  return context
}
