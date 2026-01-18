import { useState, useCallback } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isAfter,
  isBefore,
} from 'date-fns'
import { Button } from './Button'
import { formatDateToISO, parseDateFromISO } from '../../lib/dates'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onRangeChange: (start: string, end: string) => void
  maxDate?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  maxDate,
}: DateRangePickerProps) {
  const [viewDate, setViewDate] = useState(() => parseDateFromISO(startDate))
  const [selectingStart, setSelectingStart] = useState(true)

  const start = parseDateFromISO(startDate)
  const end = parseDateFromISO(endDate)
  const max = maxDate ? parseDateFromISO(maxDate) : null

  const handleDateClick = useCallback(
    (date: Date) => {
      if (max && isAfter(date, max)) return

      if (selectingStart) {
        onRangeChange(formatDateToISO(date), formatDateToISO(date))
        setSelectingStart(false)
      } else {
        if (isBefore(date, start)) {
          onRangeChange(formatDateToISO(date), formatDateToISO(start))
        } else {
          onRangeChange(formatDateToISO(start), formatDateToISO(date))
        }
        setSelectingStart(true)
      }
    },
    [selectingStart, start, onRangeChange, max]
  )

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days: Date[] = []
  let day = calendarStart
  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const isInRange = (date: Date) => {
    return (
      (isAfter(date, start) || isSameDay(date, start)) &&
      (isBefore(date, end) || isSameDay(date, end))
    )
  }

  const isDisabled = (date: Date) => {
    return max ? isAfter(date, max) : false
  }

  return (
    <div className="bg-[var(--color-bg-primary)] rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewDate(subMonths(viewDate, 1))}
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
        <span className="font-semibold text-[var(--color-text-primary)]">
          {format(viewDate, 'MMMM yyyy')}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewDate(addMonths(viewDate, 1))}
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

      <div className="mb-2 text-xs text-[var(--color-text-secondary)] text-center">
        {selectingStart ? 'Select start date' : 'Select end date'}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-[var(--color-text-secondary)] py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date, idx) => {
          const isCurrentMonth = isSameMonth(date, viewDate)
          const isStart = isSameDay(date, start)
          const isEnd = isSameDay(date, end)
          const inRange = isInRange(date)
          const disabled = isDisabled(date)

          return (
            <button
              key={idx}
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              className={`
                p-2 text-sm rounded-lg transition-colors
                ${!isCurrentMonth ? 'text-[var(--color-text-secondary)] opacity-40' : ''}
                ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--color-bg-tertiary)]'}
                ${inRange && !isStart && !isEnd ? 'bg-primary-100 dark:bg-primary-900/30' : ''}
                ${isStart || isEnd ? 'bg-primary-500 text-white font-semibold' : ''}
                ${!inRange && !isStart && !isEnd && isCurrentMonth ? 'text-[var(--color-text-primary)]' : ''}
              `}
            >
              {format(date, 'd')}
            </button>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
        <span>
          {format(start, 'MMM d, yyyy')} - {format(end, 'MMM d, yyyy')}
        </span>
      </div>
    </div>
  )
}
