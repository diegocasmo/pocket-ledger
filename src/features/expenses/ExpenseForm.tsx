import { useState, useEffect, FormEvent } from 'react'
import { format } from 'date-fns'
import { AmountInput } from '../../components/ui/AmountInput'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { CategorySelect } from '../categories/CategorySelect'
import { parseDateFromISO, isFutureDate } from '../../lib/dates'
import { parseUsdToCents } from '../../services/money'
import type { Expense } from '../../types'

interface ExpenseFormProps {
  date: string
  expense?: Expense | null
  onSubmit: (data: { amountCents: number; categoryId: string; note?: string }) => void
  onDelete?: () => void
  isSubmitting?: boolean
}

interface FormErrors {
  amount?: string
  category?: string
  note?: string
  date?: string
}

export function ExpenseForm({
  date,
  expense,
  onSubmit,
  onDelete,
  isSubmitting = false,
}: ExpenseFormProps) {
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const isEditing = !!expense

  useEffect(() => {
    if (expense) {
      setAmount((expense.amountCents / 100).toFixed(2))
      setCategoryId(expense.categoryId)
      setNote(expense.note ?? '')
    } else {
      setAmount('')
      setCategoryId('')
      setNote('')
    }
    setErrors({})
  }, [expense])

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    const cents = parseUsdToCents(amount)
    if (cents === null || cents <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }

    if (!categoryId) {
      newErrors.category = 'Please select a category'
    }

    if (note && note.length > 500) {
      newErrors.note = 'Note must be 500 characters or less'
    }

    if (isFutureDate(date)) {
      newErrors.date = "Can't add expenses for future dates"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const cents = parseUsdToCents(amount)
    if (cents === null) return

    onSubmit({
      amountCents: cents,
      categoryId,
      note: note.trim() || undefined,
    })
  }

  const dateObj = parseDateFromISO(date)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-[var(--color-text-secondary)]">
        Date: {format(dateObj, 'MMMM d, yyyy')}
        {errors.date && <p className="text-red-500 mt-1">{errors.date}</p>}
      </div>

      <AmountInput
        value={amount}
        onChange={setAmount}
        error={errors.amount}
        autoFocus={!isEditing}
      />

      <CategorySelect
        value={categoryId}
        onChange={setCategoryId}
        error={errors.category}
      />

      <Input
        label="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What was this expense for?"
        maxLength={500}
        error={errors.note}
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
