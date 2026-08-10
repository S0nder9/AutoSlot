'use client'

import { type MouseEvent, useCallback, useEffect } from 'react'

export function useModalBehavior(disabled: boolean, onClose: () => void) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !disabled) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [disabled, onClose])

  return useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget && !disabled) {
        onClose()
      }
    },
    [disabled, onClose],
  )
}
