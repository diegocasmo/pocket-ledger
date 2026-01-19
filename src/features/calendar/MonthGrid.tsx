import { isSameMonth } from 'date-fns'
import { DayCell } from './DayCell'
import { formatDateToISO, getCalendarGrid } from '../../lib/dates'

interface MonthGridProps {
  year: number
  month: number // 1-indexed
  dayTotals: Record<string, number>
  onDayClick: (date: string) => void
  selectedDate?: string | null
}

export function MonthGrid({ year, month, dayTotals, onDayClick, selectedDate }: MonthGridProps) {
  const monthDate = new Date(year, month - 1, 1)
  const { weeks } = getCalendarGrid(monthDate, 0)

  return (
    <div className="bg-[var(--color-bg-secondary)] rounded-xl p-2">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
          <div
            key={idx}
            className="text-center text-xs font-medium text-[var(--color-text-secondary)] py-1"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date) => {
          const dateStr = formatDateToISO(date)
          const isCurrentMonth = isSameMonth(date, monthDate)
          const totalCents = dayTotals[dateStr] ?? 0

          return (
            <DayCell
              key={dateStr}
              date={dateStr}
              isCurrentMonth={isCurrentMonth}
              isSelected={dateStr === selectedDate}
              totalCents={totalCents}
              onClick={() => onDayClick(dateStr)}
            />
          )
        })}
      </div>
    </div>
  )
}
