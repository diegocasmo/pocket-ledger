import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface MonthNavigatorProps {
  monthLabel: string
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  isCurrentMonth: boolean
}

export function MonthNavigator({ monthLabel, onPrevious, onNext, onToday, isCurrentMonth }: MonthNavigatorProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrevious}
        aria-label="Previous month"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          {monthLabel}
        </h1>
        {!isCurrentMonth && (
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
      {isCurrentMonth ? (
        <div className="w-8 h-8" aria-hidden="true" />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  )
}
