import { useState } from 'react'
import { format, addMonths, subMonths, isSameMonth } from 'date-fns'
import { Dialog } from '@/components/ui/Dialog'
import { PeriodNavigator } from '@/components/ui/PeriodNavigator'
import { MonthGrid } from '@/features/calendar/MonthGrid'
import { parseDateFromISO } from '@/lib/dates'

// The picker only needs date selection, so it renders a clean grid with no
// per-day spend totals (DayCell hides the amount when the total is 0).
const EMPTY_DAY_TOTALS: Record<string, number> = {}

interface ExpenseDatePickerProps {
  isOpen: boolean
  onClose: () => void
  /** Currently selected date, ISO 'yyyy-MM-dd'. The picker opens to its month. */
  selectedDate: string
  onSelect: (date: string) => void
}

export function ExpenseDatePicker({
  isOpen,
  onClose,
  selectedDate,
  onSelect,
}: ExpenseDatePickerProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Select date">
      <DatePickerCalendar
        selectedDate={selectedDate}
        onSelect={(date) => {
          onSelect(date)
          onClose()
        }}
      />
    </Dialog>
  )
}

interface DatePickerCalendarProps {
  selectedDate: string
  onSelect: (date: string) => void
}

// Rendered inside the Dialog, which Radix unmounts on close. That means this
// component re-mounts on each open, so its visible month always re-anchors on
// the selected date — no effect needed to reset navigation state.
function DatePickerCalendar({ selectedDate, onSelect }: DatePickerCalendarProps) {
  const [viewDate, setViewDate] = useState(() => parseDateFromISO(selectedDate))
  const isCurrentMonth = isSameMonth(viewDate, new Date())

  return (
    <div className="space-y-4">
      <PeriodNavigator
        label={format(viewDate, 'MMMM yyyy')}
        onPrevious={() => setViewDate((prev) => subMonths(prev, 1))}
        onNext={() => setViewDate((prev) => addMonths(prev, 1))}
        onToday={() => setViewDate(new Date())}
        isCurrentPeriod={isCurrentMonth}
        periodName="month"
      />
      <MonthGrid
        year={viewDate.getFullYear()}
        month={viewDate.getMonth() + 1}
        dayTotals={EMPTY_DAY_TOTALS}
        onDayClick={onSelect}
        selectedDate={selectedDate}
      />
    </div>
  )
}
