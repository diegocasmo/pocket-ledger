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
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
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
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Button>
    </div>
  )
}
