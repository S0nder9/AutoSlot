'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      richColors
      closeButton
      duration={5000}
      visibleToasts={3}
    />
  )
}
