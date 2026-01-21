import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isAfter } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { parseDateFromISO } from '@/lib/dates'

export const dateRangeFormSchema = z
  .object({
    startDate: z.string().min(1, 'Select start date'),
    endDate: z.string().min(1, 'Select end date'),
  })
  .refine(
    (data) => {
      const start = parseDateFromISO(data.startDate)
      const end = parseDateFromISO(data.endDate)
      return !isAfter(start, end)
    },
    { message: 'Start date must be before end date', path: ['endDate'] }
  )

export type DateRangeFormData = z.infer<typeof dateRangeFormSchema>

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
  const {
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof dateRangeFormSchema>, unknown, DateRangeFormData>({
    resolver: zodResolver(dateRangeFormSchema),
    mode: 'onBlur',
    defaultValues: {
      startDate: customStart,
      endDate: customEnd,
    },
  })

  const presets: { type: RangeType; label: string }[] = [
    { type: 'week', label: 'Week' },
    { type: 'month', label: 'Month' },
    { type: 'year', label: 'Year' },
  ]

  const handleCustomClick = () => {
    reset({
      startDate: customStart,
      endDate: customEnd,
    })
    onRangeTypeChange('custom')
  }

  const handleApply = (data: DateRangeFormData) => {
    onCustomRangeChange(data.startDate, data.endDate)
  }

  const handleCloseCustomPicker = () => {
    onRangeTypeChange('month')
  }

  const isCustomPickerOpen = rangeType === 'custom'

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
        isOpen={isCustomPickerOpen}
        onClose={handleCloseCustomPicker}
        title="Select Date Range"
      >
        <form onSubmit={handleSubmit(handleApply)} className="space-y-4">
          <DateRangePicker
            startDate={watch('startDate')}
            endDate={watch('endDate')}
            onRangeChange={(start, end) => {
              setValue('startDate', start)
              setValue('endDate', end)
            }}
            maxDate={maxDate}
          />
          {errors.endDate && (
            <p className="text-sm text-red-500">{errors.endDate.message}</p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseCustomPicker}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Apply
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
