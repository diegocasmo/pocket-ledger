import { useState } from 'react'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { ExpenseForm } from './ExpenseForm'
import {
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useDuplicateExpense,
} from '../../hooks/useExpenses'
import type { Expense } from '../../types'

interface ExpenseFormModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  expense?: Expense | null
}

export function ExpenseFormModal({
  isOpen,
  onClose,
  date,
  expense,
}: ExpenseFormModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const deleteExpense = useDeleteExpense()
  const duplicateExpense = useDuplicateExpense()

  const isEditing = !!expense
  const isSubmitting =
    createExpense.isPending ||
    updateExpense.isPending ||
    deleteExpense.isPending ||
    duplicateExpense.isPending

  const handleSubmit = async (data: {
    amountCents: number
    categoryId: string
    note?: string
  }) => {
    if (isEditing && expense) {
      await updateExpense.mutateAsync({
        id: expense.id,
        ...data,
      })
    } else {
      await createExpense.mutateAsync({
        date,
        ...data,
      })
    }
    onClose()
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (expense) {
      await deleteExpense.mutateAsync(expense.id)
      setShowDeleteConfirm(false)
      onClose()
    }
  }

  const handleDuplicate = async () => {
    if (expense) {
      await duplicateExpense.mutateAsync({
        date: expense.date,
        amountCents: expense.amountCents,
        categoryId: expense.categoryId,
        note: expense.note,
      })
      onClose()
    }
  }

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? 'Edit Expense' : 'Add Expense'}
      >
        <ExpenseForm
          date={date}
          expense={expense}
          onSubmit={handleSubmit}
          onDelete={isEditing ? handleDelete : undefined}
          onDuplicate={isEditing ? handleDuplicate : undefined}
          isSubmitting={isSubmitting}
        />
      </BottomSheet>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={deleteExpense.isPending}
      />
    </>
  )
}
