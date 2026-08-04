'use client'

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api, setUnauthorizedHandler } from '@/lib/api'
import type { ApiResponse, User } from '@/lib/auth-types'
import type { LoginPayload, RegisterPayload } from '@/lib/validations/auth'

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login(username: string, password: string): Promise<void>
  register(username: string, password: string): Promise<void>
  logout(): Promise<void>
  refreshUser(): Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<User>>('auth/me')
      setUser(response.data.data)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    void api
      .get<ApiResponse<User>>('auth/me')
      .then((response) => setUser(response.data.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))

    return () => setUnauthorizedHandler(null)
  }, [refreshUser])

  const login = useCallback(async (username: string, password: string) => {
    const payload: LoginPayload = { username, password }
    const response = await api.post<ApiResponse<User>>('auth/login', payload)
    setUser(response.data.data)
  }, [])

  const register = useCallback(async (username: string, password: string) => {
    const payload: RegisterPayload = { username, password }
    await api.post<ApiResponse<User>>('auth/register', payload)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('auth/logout')
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      refreshUser,
    }),
    [isLoading, login, logout, refreshUser, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
