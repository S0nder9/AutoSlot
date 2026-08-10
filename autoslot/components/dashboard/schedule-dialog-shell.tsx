'use client'

import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useModalBehavior } from '@/hooks/use-modal-behavior'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type ScheduleDialogShellProps = {
  title: string
  description: ReactNode
  titleId: string
  descriptionId: string
  disabled: boolean
  alert?: boolean
  narrow?: boolean
  onClose: () => void
  children: ReactNode
}

export function ScheduleDialogShell({
  title,
  description,
  titleId,
  descriptionId,
  disabled,
  alert = false,
  narrow = false,
  onClose,
  children,
}: ScheduleDialogShellProps) {
  const handleOverlayMouseDown = useModalBehavior(disabled, onClose)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={handleOverlayMouseDown}
    >
      <Card
        className={`w-full shadow-2xl ${narrow ? 'max-w-md' : 'max-w-lg'}`}
        role={alert ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <CardHeader>
          <CardTitle id={titleId} className="text-xl">
            {title}
          </CardTitle>
          <CardDescription id={descriptionId}>{description}</CardDescription>
          {!alert && (
            <CardAction>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Закрыть окно"
                disabled={disabled}
                onClick={onClose}
              >
                <X />
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}
