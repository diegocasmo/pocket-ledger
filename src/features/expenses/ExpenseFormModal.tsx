import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ExpenseForm } from '@/features/expenses/ExpenseForm'
import {
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '@/hooks/useExpenses'
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation'
import type { Expense } from '@/types'

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
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const deleteExpense = useDeleteExpense()

  const deletion = useDeleteConfirmation<Expense>({
    onDelete: async (item) => {
      await deleteExpense.mutateAsync(item.id)
    },
    onSuccess: onClose,
  })

  const isEditing = !!expense
  const isSubmitting =
    createExpense.isPending ||
    updateExpense.isPending ||
    deletion.isDeleting

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
    if (expense) {
      deletion.requestDelete(expense)
    }
  }

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? 'Edit Expense' : 'Add Expense'}
        disableAutoFocus={isEditing}
      >
        <ExpenseForm
          key={expense?.id ?? 'new'}
          date={date}
          expense={expense}
          onSubmit={handleSubmit}
          onDelete={isEditing ? handleDelete : undefined}
          isSubmitting={isSubmitting}
        />
      </Dialog>
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
