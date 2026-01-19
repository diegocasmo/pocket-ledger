import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'

interface MonthNavigatorProps {
  monthLabel: string
  onPrevious: () => void
  onNext: () => void
}

export function MonthNavigator({ monthLabel, onPrevious, onNext }: MonthNavigatorProps) {
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
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
        {monthLabel}
      </h1>
      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        aria-label="Next month"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  )
}
