import { format } from 'date-fns'
import { parseDateFromISO, isToday, isFutureDate } from '../../lib/dates'
import { formatCentsToWholeDollars } from '../../services/money'

interface DayCellProps {
  date: string
  isCurrentMonth: boolean
  totalCents: number
  onClick: () => void
}

export function DayCell({ date, isCurrentMonth, totalCents, onClick }: DayCellProps) {
  const dateObj = parseDateFromISO(date)
  const dayNumber = format(dateObj, 'd')
  const today = isToday(date)
  const future = isFutureDate(date)

  return (
    <button
      onClick={onClick}
      disabled={future}
      className={`
        flex flex-col items-center justify-center
        aspect-square rounded-lg p-1
        transition-colors
        ${!isCurrentMonth ? 'opacity-40' : ''}
        ${future ? 'cursor-not-allowed opacity-30' : 'hover:bg-[var(--color-bg-tertiary)] active:bg-[var(--color-bg-tertiary)]'}
        ${today ? 'ring-2 ring-primary-500' : ''}
      `}
      aria-label={`${format(dateObj, 'MMMM d, yyyy')}${totalCents > 0 ? `, ${formatCentsToWholeDollars(totalCents)} spent` : ''}`}
    >
      <span
        className={`
          text-sm font-medium
          ${today ? 'text-primary-500' : 'text-[var(--color-text-primary)]'}
        `}
      >
        {dayNumber}
      </span>
      {totalCents > 0 && (
        <span className="text-[10px] text-[var(--color-text-secondary)] truncate max-w-full">
          {formatCentsToWholeDollars(totalCents)}
        </span>
      )}
    </button>
  )
}
