import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CategoryForm, type CategoryFormData } from '@/features/categories/CategoryForm'
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCategoryHasExpenses,
} from '@/hooks/useCategories'
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation'
import type { Category } from '@/types'

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: (newCategoryId?: string) => void
  category?: Category | null
  initialName?: string
}

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
  initialName,
}: CategoryFormModalProps) {
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const { data: hasExpenses } = useCategoryHasExpenses(category?.id ?? '')

  const deletion = useDeleteConfirmation<Category>({
    onDelete: async (item) => {
      await deleteCategory.mutateAsync(item.id)
    },
    onSuccess: onClose,
  })

  const isEditing = !!category

  const handleSave = async (data: CategoryFormData) => {
    if (isEditing && category) {
      await updateCategory.mutateAsync({
        id: category.id,
        ...data,
      })
      onClose()
    } else {
      const newCategory = await createCategory.mutateAsync(data)
      onClose(newCategory.id)
    }
  }

  const handleDelete = () => {
    if (category) {
      deletion.requestDelete(category)
    }
  }

  const handleClose = () => {
    deletion.cancelDelete()
    onClose()
  }

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={handleClose}
        title={isEditing ? 'Edit Category' : 'Add Category'}
      >
        <CategoryForm
          key={category?.id ?? 'new'}
          category={category}
          initialName={initialName}
          onSubmit={handleSave}
          onCancel={handleClose}
          onDelete={isEditing ? handleDelete : undefined}
          isSubmitting={createCategory.isPending || updateCategory.isPending}
          isDeleting={deletion.isDeleting}
        />
      </Dialog>
      <ConfirmDialog
        isOpen={deletion.isOpen}
        onClose={deletion.cancelDelete}
        onConfirm={deletion.confirmDelete}
        title="Delete Category"
        message={
          hasExpenses
            ? `Cannot delete "${deletion.itemToDelete?.name}" because it has expenses. Please reassign or delete those expenses first.`
            : `Are you sure you want to delete "${deletion.itemToDelete?.name}"?`
        }
        confirmLabel="Delete"
        isLoading={deletion.isDeleting}
      />
    </>
  )
}
