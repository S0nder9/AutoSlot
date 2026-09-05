'use client'

import { type RefObject, useEffect, useRef } from 'react'

const modalStack: symbol[] = []
let modalScrollLockCount = 0
let originalBodyOverflow = ''

export function useModalBehavior(root: RefObject<HTMLDivElement | null>) {
  const modalIdRef = useRef(Symbol('modal'))

  useEffect(() => {
    const modalId = modalIdRef.current
    modalStack.push(modalId)
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const dialog = root.current?.querySelector<HTMLElement>('[role="dialog"], [role="alertdialog"]')
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]') ?? []).filter((item) => item.getClientRects().length > 0)
    const focusFrame = requestAnimationFrame(() => {
      if (modalStack.at(-1) === modalId && !dialog?.contains(document.activeElement)) (focusable()[0] ?? dialog)?.focus()
    })
    function containFocus(event: FocusEvent) {
      if (modalStack.at(-1) === modalId && !root.current?.contains(event.target as Node)) (focusable()[0] ?? dialog)?.focus()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (modalStack.at(-1) !== modalId) return
      if (event.key === 'Tab') {
        const items = focusable()
        const first = items[0]
        const last = items.at(-1)
        if (!first) { event.preventDefault(); dialog?.focus() }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', containFocus)
    if (modalScrollLockCount === 0) {
      originalBodyOverflow = document.body.style.overflow
    }
    modalScrollLockCount += 1
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', containFocus)
      cancelAnimationFrame(focusFrame)
      modalScrollLockCount = Math.max(0, modalScrollLockCount - 1)
      if (modalScrollLockCount === 0) {
        document.body.style.overflow = originalBodyOverflow
      }
      const index = modalStack.lastIndexOf(modalId)
      if (index >= 0) modalStack.splice(index, 1)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [root])

}
