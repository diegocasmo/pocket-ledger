import { ReactNode, useCallback, useRef, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { X } from 'lucide-react'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startY = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return
      const currentY = e.touches[0].clientY
      const diff = currentY - startY.current
      if (diff > 0) {
        setDragOffset(diff)
      }
    },
    [isDragging]
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    if (dragOffset > 100) {
      onClose()
    }
    setDragOffset(0)
  }, [dragOffset, onClose])

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed z-50 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
          onOpenAutoFocus={(e) => {
            // Focus first focusable element inside the dialog
            const dialog = e.currentTarget as HTMLElement | null
            const firstInput = dialog?.querySelector<HTMLElement>(
              'input, select, textarea, button:not([aria-label="Close"])'
            )
            if (firstInput) {
              e.preventDefault()
              firstInput.focus()
            }
          }}
        >
          <VisuallyHidden>
            <DialogPrimitive.Description>Dialog content</DialogPrimitive.Description>
          </VisuallyHidden>
          {/* Mobile bottom sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-primary)] rounded-t-2xl shadow-xl max-h-[85vh] overflow-auto md:hidden safe-bottom"
            style={{
              transform: `translateY(${dragOffset}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            {/* Drag handle */}
            <div
              className="flex justify-center py-2 cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="w-10 h-1 bg-[var(--color-border)] rounded-full" />
            </div>
            {title && (
              <div className="flex items-center justify-between px-4 pb-3 border-b border-[var(--color-border)]">
                <DialogPrimitive.Title className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Close asChild>
                  <button
                    className="p-1 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </DialogPrimitive.Close>
              </div>
            )}
            <div className="p-4 pb-8 touch-action-manipulation">{children}</div>
          </div>

          {/* Desktop modal */}
          <div className="relative hidden md:block w-full max-w-md bg-[var(--color-bg-primary)] rounded-xl shadow-xl max-h-[85vh] overflow-auto">
            {title && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                <DialogPrimitive.Title className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Close asChild>
                  <button
                    className="p-1 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </DialogPrimitive.Close>
              </div>
            )}
            <div className="p-4">{children}</div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
