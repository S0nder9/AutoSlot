'use client'

import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'autoslot:sidebar-collapsed'
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      listener()
    }
  }

  listeners.add(listener)
  window.addEventListener('storage', handleStorage)

  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', handleStorage)
  }
}

function getSnapshot() {
  const savedValue = window.localStorage.getItem(STORAGE_KEY)
  return savedValue === null ? true : savedValue === 'true'
}

function getServerSnapshot() {
  return true
}

export function useDesktopSidebar() {
  const isCollapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  const toggle = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, String(!getSnapshot()))
    listeners.forEach((listener) => listener())
  }, [])

  return { isCollapsed, toggle }
}
