import { Button } from '@/components/ui/Button'

type RangeType = 'week' | 'month' | 'year'

interface RangePickerProps {
  rangeType: RangeType
  onRangeTypeChange: (type: RangeType) => void
}

export function RangePicker({ rangeType, onRangeTypeChange }: RangePickerProps) {
  const presets: { type: RangeType; label: string }[] = [
    { type: 'week', label: 'Week' },
    { type: 'month', label: 'Month' },
    { type: 'year', label: 'Year' },
  ]

  return (
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
    </div>
  )
}
