import { useState } from 'react'
import {
  useParams,
  useNavigate,
  useSearchParams,
  Navigate,
} from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AmountInput } from '@/components/ui/AmountInput'
import { AutocompleteInput } from '@/components/ui/AutocompleteInput'
import { Button } from '@/components/ui/Button'
import { ExpenseDatePicker } from '@/features/expenses/ExpenseDatePicker'
import {
  useExpense,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '@/hooks/useExpenses'
import { useCategories } from '@/hooks/useCategories'
import { useNoteSuggestions } from '@/hooks/useNoteSuggestions'
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation'
import { useExpenseFormContext } from '@/contexts/ExpenseFormContext'
import {
  isFutureDate,
  getTodayISO,
  formatRelativeDate,
  isValidISODate,
} from '@/lib/dates'
import { parseUsdToCents } from '@/services/money'
import type { Expense } from '@/types'

const expenseFormSchema = z.object({
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

type ExpenseFormInput = z.input<typeof expenseFormSchema>
type ExpenseFormData = z.output<typeof expenseFormSchema>

export function ExpensePage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const { draft, setDraft, clearDraft } = useExpenseFormContext()
  const { data: expense, isLoading: expenseLoading } = useExpense(id ?? null)
  const { data: categories = [] } = useCategories()

  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const deleteExpense = useDeleteExpense()

  const deletion = useDeleteConfirmation<Expense>({
    onDelete: async (item) => {
      await deleteExpense.mutateAsync(item.id)
    },
    onSuccess: () => {
      clearDraft()
      navigate('/calendar')
    },
  })

  const isEditing = !!id
  const isSubmitting =
    createExpense.isPending || updateExpense.isPending || deletion.isDeleting

  // The selected date lives in the URL (?date=) — a single, shareable source of
  // truth, so there is no draft/effect to keep in sync. It's untrusted (it comes
  // from a shareable URL), so it's validated; it falls back to the expense's own
  // date (edit) or today (create) when the param is absent.
  const dateParam = searchParams.get('date')
  const formDate =
    dateParam && isValidISODate(dateParam) && !isFutureDate(dateParam)
      ? dateParam
      : isEditing
        ? (expense?.date ?? getTodayISO())
        : getTodayISO()

  // Initial form values, derived (no effect): an in-progress draft from a
  // category-picker round trip wins; otherwise the loaded expense (edit) or
  // empty (create). react-hook-form's `values` prop re-syncs the form when this
  // changes — e.g. when the expense finishes loading — so no init/sync effect.
  const draftMatchesForm = isEditing
    ? draft?.expenseId === id
    : !!draft && !draft.expenseId
  const values: ExpenseFormInput = draftMatchesForm
    ? { amount: draft!.amount, categoryId: draft!.categoryId, note: draft!.note }
    : isEditing && expense
      ? {
          amount: (expense.amountCents / 100).toFixed(2),
          categoryId: expense.categoryId,
          note: expense.note ?? '',
        }
      : { amount: '', categoryId: '', note: '' }

  const {
    control,
    handleSubmit,
    setError,
    watch,
    getValues,
    formState: { errors },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    mode: 'onBlur',
    values,
    // If `values` re-syncs while a field is dirty (e.g. the open expense's
    // cached data changes in another tab), keep the user's unsaved edits.
    resetOptions: { keepDirtyValues: true },
  })

  const categoryId = watch('categoryId')
  const noteValue = watch('note')

  const { suggestions } = useNoteSuggestions({
    categoryId: categoryId || null,
    query: noteValue ?? '',
  })

  const selectedCategory = categories.find((c) => c.id === categoryId)

  const handleDateSelect = (newDate: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('date', newDate)
        return next
      },
      { replace: true }
    )
  }

  const handleCategoryClick = () => {
    // The category picker is a separate route, so snapshot the in-progress
    // fields into the draft to survive the round trip, and carry the date along
    // in the URL so it's preserved too.
    setDraft({
      amount: getValues('amount'),
      categoryId: getValues('categoryId'),
      note: getValues('note') ?? '',
      expenseId: id,
    })
    const pickerPath = id ? `/expenses/${id}/category` : '/expenses/new/category'
    navigate(`${pickerPath}?date=${formDate}`)
  }

  const onFormSubmit = async (data: ExpenseFormData) => {
    if (isFutureDate(formDate)) {
      setError('root.date', { message: "Can't add expenses for future dates" })
      return
    }

    if (isEditing && expense) {
      await updateExpense.mutateAsync({
        id: expense.id,
        date: formDate,
        amountCents: data.amount,
        categoryId: data.categoryId,
        note: data.note,
      })
    } else {
      await createExpense.mutateAsync({
        date: formDate,
        amountCents: data.amount,
        categoryId: data.categoryId,
        note: data.note,
      })
    }

    clearDraft()
    navigate('/calendar')
  }

  const handleDelete = () => {
    if (expense) {
      deletion.requestDelete(expense)
    }
  }

  const handleCancel = () => {
    clearDraft()
    navigate('/calendar')
  }

  // Show loading state when editing and expense not loaded yet
  if (isEditing && expenseLoading) {
    return (
      <>
        <PageHeader title="Edit Expense" onBack={handleCancel} />
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse text-[var(--color-text-secondary)]">
            Loading...
          </div>
        </div>
      </>
    )
  }

  // Expense not found - redirect without an effect
  if (isEditing && !expense) {
    return <Navigate to="/calendar" replace />
  }

  return (
    <>
      <PageHeader
        title={isEditing ? 'Edit Expense' : 'Add Expense'}
        onBack={handleCancel}
      />
      <div className="p-4">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="w-full">
            <span className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Date
            </span>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              data-testid="date-trigger"
              className={`
                w-full py-2 px-3 rounded-lg border text-left flex items-center gap-2
                bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${errors.root?.date ? 'border-red-500' : 'border-[var(--color-border)]'}
              `}
            >
              <Calendar className="w-5 h-5 text-[var(--color-text-secondary)] flex-shrink-0" />
              <span className="flex-1 truncate">{formatRelativeDate(formDate)}</span>
              <ChevronDown className="w-5 h-5 text-[var(--color-text-secondary)] flex-shrink-0" />
            </button>
            {errors.root?.date && (
              <p className="mt-1 text-sm text-red-500">{errors.root.date.message}</p>
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

          {/* Category Select - navigates to picker page */}
          <div className="w-full">
            <span className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Category
            </span>
            <button
              type="button"
              onClick={handleCategoryClick}
              data-testid="category-trigger"
              className={`
                w-full py-2 px-3 rounded-lg border text-left flex items-center gap-2
                bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${errors.categoryId ? 'border-red-500' : 'border-[var(--color-border)]'}
              `}
            >
              {selectedCategory ? (
                <>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  <span className="flex-1 truncate">{selectedCategory.name}</span>
                </>
              ) : (
                <span className="flex-1 text-[var(--color-text-secondary)]">
                  Select a category
                </span>
              )}
              <ChevronDown className="w-5 h-5 text-[var(--color-text-secondary)] flex-shrink-0" />
            </button>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-500">{errors.categoryId.message}</p>
            )}
          </div>

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
                <Button
                  type="button"
                  variant="danger"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Delete
                </Button>
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
      </div>

      <ExpenseDatePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={formDate}
        onSelect={handleDateSelect}
      />

      <ConfirmDialog
        isOpen={deletion.isOpen}
        onClose={deletion.cancelDelete}
        onConfirm={deletion.confirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={deletion.isDeleting}
      />
    </>
  )
}

export default ExpensePage
