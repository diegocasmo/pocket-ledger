import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PeriodNavigatorProps {
  label: string
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  isCurrentPeriod: boolean
  periodName?: string
}

export function PeriodNavigator({ label, onPrevious, onNext, onToday, isCurrentPeriod, periodName = 'period' }: PeriodNavigatorProps) {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrevious}
        aria-label={`Previous ${periodName}`}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-[var(--color-text-primary)]">
          {label}
        </span>
        {!isCurrentPeriod && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToday}
            aria-label="Go to today"
            className="text-sm text-[var(--color-text-secondary)]"
          >
            Today
          </Button>
        )}
      </div>
      {isCurrentPeriod ? (
        <div className="w-8 h-8" aria-hidden="true" />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          aria-label={`Next ${periodName}`}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  )
}
