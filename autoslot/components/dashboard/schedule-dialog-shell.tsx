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
  title: ReactNode
  description: ReactNode
  titleId: string
  descriptionId: string
  disabled: boolean
  alert?: boolean
  narrow?: boolean
  wide?: boolean
  compact?: boolean
  descriptionHidden?: boolean
  headerActions?: ReactNode
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
  wide = false,
  compact = false,
  descriptionHidden = false,
  headerActions,
  onClose,
  children,
}: ScheduleDialogShellProps) {
  const handleOverlayClick = useModalBehavior(disabled, onClose)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={handleOverlayClick}
    >
      <Card
        className={`${compact ? 'max-h-[85vh]' : 'max-h-[calc(100vh-2rem)]'} w-full overflow-y-auto shadow-2xl ${narrow ? 'max-w-md' : wide ? 'max-w-2xl' : 'max-w-lg'}`}
        role={alert ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <CardHeader>
          <CardTitle id={titleId} className="text-xl">
            {title}
          </CardTitle>
          <CardDescription id={descriptionId} className={descriptionHidden ? 'sr-only' : undefined}>{description}</CardDescription>
          {!alert && (
            <CardAction className="flex items-center gap-1">
              {headerActions}
              <Button
                size="icon"
                variant="ghost"
                aria-label="Закрыть окно"
                title="Закрыть"
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
