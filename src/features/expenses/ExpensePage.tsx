import { useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { ChevronDown } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AmountInput } from '@/components/ui/AmountInput'
import { AutocompleteInput } from '@/components/ui/AutocompleteInput'
import { Button } from '@/components/ui/Button'
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
import { parseDateFromISO, isFutureDate, getTodayISO } from '@/lib/dates'
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

type ExpenseFormData = z.output<typeof expenseFormSchema>

export function ExpensePage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const { draft, setDraft, updateDraft, clearDraft } = useExpenseFormContext()
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

  // Determine date from URL params or use today
  const dateParam = searchParams.get('date')
  const date = dateParam && !isFutureDate(dateParam) ? dateParam : getTodayISO()

  // Initialize draft when entering the page
  useEffect(() => {
    // If editing, initialize from expense data
    if (isEditing && expense && draft?.expenseId !== expense.id) {
      setDraft({
        amount: (expense.amountCents / 100).toFixed(2),
        categoryId: expense.categoryId,
        note: expense.note ?? '',
        date: expense.date,
        expenseId: expense.id,
      })
    }
    // If creating new and no draft exists, initialize empty draft
    else if (!isEditing && !draft) {
      setDraft({
        amount: '',
        categoryId: '',
        note: '',
        date,
      })
    }
    // If creating new but draft has an expenseId (was editing), clear it
    else if (!isEditing && draft?.expenseId) {
      setDraft({
        amount: '',
        categoryId: '',
        note: '',
        date,
      })
    }
  }, [isEditing, expense, draft, date, setDraft])

  const {
    control,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof expenseFormSchema>, unknown, ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    mode: 'onBlur',
    defaultValues: {
      amount: draft?.amount ?? '',
      categoryId: draft?.categoryId ?? '',
      note: draft?.note ?? '',
    },
  })

  // Sync form with draft when draft changes (e.g., after selecting category)
  useEffect(() => {
    if (draft) {
      setValue('amount', draft.amount)
      setValue('categoryId', draft.categoryId)
      setValue('note', draft.note)
    }
  }, [draft, setValue])

  // Redirect if expense not found
  const expenseNotFound = isEditing && !expense && !expenseLoading
  useEffect(() => {
    if (expenseNotFound) {
      navigate('/calendar')
    }
  }, [expenseNotFound, navigate])

  const categoryId = watch('categoryId')
  const noteValue = watch('note')

  const { suggestions } = useNoteSuggestions({
    categoryId: categoryId || null,
    query: noteValue ?? '',
  })

  const selectedCategory = categories.find((c) => c.id === categoryId)

  // Update draft when form values change
  const handleAmountChange = (value: string) => {
    updateDraft({ amount: value })
  }

  const handleNoteChange = (value: string) => {
    updateDraft({ note: value })
  }

  const handleCategoryClick = () => {
    // Save current form state before navigating
    const pickerPath = id ? `/expenses/${id}/category` : '/expenses/new/category'
    navigate(pickerPath)
  }

  const onFormSubmit = async (data: ExpenseFormData) => {
    const formDate = draft?.date ?? date

    if (isFutureDate(formDate)) {
      setError('root.date', { message: "Can't add expenses for future dates" })
      return
    }

    if (isEditing && expense) {
      await updateExpense.mutateAsync({
        id: expense.id,
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

  // Expense not found - render nothing while redirecting
  if (expenseNotFound) {
    return null
  }

  const formDate = draft?.date ?? date
  const dateObj = parseDateFromISO(formDate)

  return (
    <>
      <PageHeader
        title={isEditing ? 'Edit Expense' : 'Add Expense'}
        onBack={handleCancel}
      />
      <div className="p-4">
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
                onChange={(val) => {
                  field.onChange(val)
                  handleAmountChange(val)
                }}
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
                onChange={(val) => {
                  field.onChange(val)
                  handleNoteChange(val)
                }}
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
