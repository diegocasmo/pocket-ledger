import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { AmountInput } from '@/components/ui/AmountInput'
import { AutocompleteInput } from '@/components/ui/AutocompleteInput'
import { Button } from '@/components/ui/Button'
import { CategorySelect } from '@/features/categories/CategorySelect'
import { useNoteSuggestions } from '@/hooks/useNoteSuggestions'
import { parseDateFromISO, isFutureDate } from '@/lib/dates'
import { parseUsdToCents } from '@/services/money'
import type { Expense } from '@/types'

export const expenseFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'Please enter a valid amount')
    .refine(
      (val) => {
        const cents = parseUsdToCents(val)
        return cents !== null && cents > 0
      },
      { message: 'Please enter a valid amount' }
    )
    .transform((val) => parseUsdToCents(val) as number),

  categoryId: z.string().min(1, 'Please select a category'),

  note: z
    .string()
    .max(500, 'Note must be 500 characters or less')
    .transform((val) => val.trim() || undefined)
    .optional(),
})

export type ExpenseFormData = z.output<typeof expenseFormSchema>

interface ExpenseFormProps {
  date: string
  expense?: Expense | null
  onSubmit: (data: { amountCents: number; categoryId: string; note?: string }) => void
  onDelete?: () => void
  isSubmitting?: boolean
}

export function ExpenseForm({
  date,
  expense,
  onSubmit,
  onDelete,
  isSubmitting = false,
}: ExpenseFormProps) {
  const isEditing = !!expense

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof expenseFormSchema>, unknown, ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    mode: 'onBlur',
    defaultValues: {
      amount: expense ? (expense.amountCents / 100).toFixed(2) : '',
      categoryId: expense?.categoryId ?? '',
      note: expense?.note ?? '',
    },
  })

  const categoryId = watch('categoryId')
  const noteValue = watch('note')

  const { suggestions } = useNoteSuggestions({
    categoryId: categoryId || null,
    query: noteValue ?? '',
  })

  const onFormSubmit = (data: ExpenseFormData) => {
    if (isFutureDate(date)) {
      setError('root.date', { message: "Can't add expenses for future dates" })
      return
    }

    onSubmit({
      amountCents: data.amount,
      categoryId: data.categoryId,
      note: data.note,
    })
  }

  const dateObj = parseDateFromISO(date)

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="text-sm text-[var(--color-text-secondary)]">
        Date: {format(dateObj, 'MMMM d, yyyy')}
        {errors.root?.date && (
          <p className="text-red-500 mt-1">{errors.root.date.message}</p>
        )}
      </div>

      <Controller
        name="amount"
        control={control}
        render={({ field }) => (
          <AmountInput
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.amount?.message}
            autoFocus={!isEditing}
          />
        )}
      />

      <Controller
        name="categoryId"
        control={control}
        render={({ field }) => (
          <CategorySelect
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.categoryId?.message}
          />
        )}
      />

      <Controller
        name="note"
        control={control}
        render={({ field }) => (
          <AutocompleteInput
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            suggestions={suggestions}
            label="Note (optional)"
            placeholder="What was this expense for?"
            maxLength={500}
            error={errors.note?.message}
          />
        )}
      />

      <div className="pt-2">
        {isEditing ? (
          <div className="flex gap-2">
            {onDelete && (
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                onClick={onDelete}
                disabled={isSubmitting}
              >
                Delete
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        ) : (
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Add Expense'}
          </Button>
        )}
      </div>
    </form>
  )
}
