'use client'

import { useRef, type ReactNode } from 'react'
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
  const overlayRef = useRef<HTMLDivElement>(null)
  useModalBehavior(overlayRef)

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="presentation"
      onSubmit={(event) => event.stopPropagation()}
    >
      <Card
        className={`${compact ? 'sm:max-h-[85vh]' : 'sm:max-h-[calc(100vh-2rem)]'} max-h-[92dvh] w-full gap-0 overflow-hidden rounded-b-none border-b-0 py-0 shadow-2xl animate-in slide-in-from-bottom-4 duration-200 sm:rounded-xl sm:border-b sm:py-4 sm:slide-in-from-bottom-0 ${narrow ? 'max-w-md' : wide ? 'max-w-2xl' : 'max-w-lg'} ${alert ? 'ring-destructive/20' : ''}`}
        role={alert ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <CardHeader className="shrink-0 border-b px-4 py-4 sm:px-(--card-spacing) sm:pt-0">
          <CardTitle id={titleId} className="pr-2 text-lg sm:text-xl">
            {title}
          </CardTitle>
          <CardDescription id={descriptionId} className={descriptionHidden ? 'sr-only' : undefined}>{description}</CardDescription>
          {!alert && (
            <CardAction className="flex items-center gap-1">
              {headerActions}
              <Button
                size="icon"
                variant="ghost"
                className="size-10 sm:size-8"
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
        <CardContent className={`${alert ? '[&>div]:grid [&>div]:grid-cols-1 [&>div]:gap-2 [&_button]:w-full sm:[&>div]:flex sm:[&>div]:justify-end sm:[&_button]:w-auto' : ''} min-h-0 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-(--card-spacing)`}>{children}</CardContent>
      </Card>
    </div>
  )
}
