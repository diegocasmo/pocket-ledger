import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { DateRangePicker } from '@/components/ui/DateRangePicker'

type RangeType = 'week' | 'month' | 'year' | 'custom'

interface RangePickerProps {
  rangeType: RangeType
  customStart: string
  customEnd: string
  maxDate: string
  onRangeTypeChange: (type: RangeType) => void
  onCustomRangeChange: (start: string, end: string) => void
}

export function RangePicker({
  rangeType,
  customStart,
  customEnd,
  maxDate,
  onRangeTypeChange,
  onCustomRangeChange,
}: RangePickerProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [tempStart, setTempStart] = useState(customStart)
  const [tempEnd, setTempEnd] = useState(customEnd)

  const presets: { type: RangeType; label: string }[] = [
    { type: 'week', label: 'Week' },
    { type: 'month', label: 'Month' },
    { type: 'year', label: 'Year' },
  ]

  const handleCustomClick = () => {
    setTempStart(customStart)
    setTempEnd(customEnd)
    setShowCustomPicker(true)
  }

  const handleApply = () => {
    onCustomRangeChange(tempStart, tempEnd)
    setShowCustomPicker(false)
  }

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {presets.map(({ type, label }) => (
          <Button
            key={type}
            variant={rangeType === type ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onRangeTypeChange(type)}
          >
            {label}
          </Button>
        ))}
        <Button
          variant={rangeType === 'custom' ? 'primary' : 'secondary'}
          size="sm"
          onClick={handleCustomClick}
        >
          Custom
        </Button>
      </div>

      <Dialog
        isOpen={showCustomPicker}
        onClose={() => setShowCustomPicker(false)}
        title="Select Date Range"
      >
        <div className="space-y-4">
          <DateRangePicker
            startDate={tempStart}
            endDate={tempEnd}
            onRangeChange={(start, end) => {
              setTempStart(start)
              setTempEnd(end)
            }}
            maxDate={maxDate}
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowCustomPicker(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
