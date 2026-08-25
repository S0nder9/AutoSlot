'use client'

import { type MouseEvent, useCallback, useEffect, useRef } from 'react'

const modalStack: symbol[] = []
let modalScrollLockCount = 0
let originalBodyOverflow = ''

export function useModalBehavior(disabled: boolean, onClose: () => void) {
  const modalIdRef = useRef(Symbol('modal'))
  const disabledRef = useRef(disabled)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    disabledRef.current = disabled
    onCloseRef.current = onClose
  }, [disabled, onClose])

  useEffect(() => {
    const modalId = modalIdRef.current
    modalStack.push(modalId)

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key === 'Escape' &&
        modalStack.at(-1) === modalId &&
        !disabledRef.current
      ) {
        onCloseRef.current()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    if (modalScrollLockCount === 0) {
      originalBodyOverflow = document.body.style.overflow
    }
    modalScrollLockCount += 1
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      modalScrollLockCount = Math.max(0, modalScrollLockCount - 1)
      if (modalScrollLockCount === 0) {
        document.body.style.overflow = originalBodyOverflow
      }
      const index = modalStack.lastIndexOf(modalId)
      if (index >= 0) modalStack.splice(index, 1)
    }
  }, [])

  return useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (
        event.target === event.currentTarget &&
        modalStack.at(-1) === modalIdRef.current &&
        !disabledRef.current
      ) {
        event.preventDefault()
        event.stopPropagation()
        onCloseRef.current()
      }
    },
    [],
  )
}
