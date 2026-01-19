import { ChevronRight } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { formatCentsToUsd } from '../../services/money'
import type { Expense } from '../../types'

interface ExpenseListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
}

export function ExpenseList({ expenses, onEdit }: ExpenseListProps) {
  const { data: categories = [] } = useCategories()

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name ?? 'Unknown'
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.color ?? '#6b7280'
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <button
          key={expense.id}
          onClick={() => onEdit(expense)}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors text-left"
        >
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: getCategoryColor(expense.categoryId) }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-[var(--color-text-primary)]">
              {formatCentsToUsd(expense.amountCents)}
            </div>
            <div className="text-sm text-[var(--color-text-secondary)] truncate">
              {getCategoryName(expense.categoryId)}
              {expense.note && ` - ${expense.note}`}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--color-text-secondary)] flex-shrink-0" />
        </button>
      ))}
    </div>
  )
}
