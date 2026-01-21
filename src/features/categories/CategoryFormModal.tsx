import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CategoryForm } from '@/features/categories/CategoryForm'
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCategoryHasExpenses,
} from '@/hooks/useCategories'
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation'
import { PRESET_COLORS } from '@/constants/colors'
import type { Category } from '@/types'

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  category?: Category | null
}

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
}: CategoryFormModalProps) {
  const [name, setName] = useState(category?.name ?? '')
  const [color, setColor] = useState<string>(category?.color ?? PRESET_COLORS[0])

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

  const handleSave = async () => {
    if (!name.trim()) return

    if (isEditing && category) {
      await updateCategory.mutateAsync({
        id: category.id,
        name: name.trim(),
        color,
      })
    } else {
      await createCategory.mutateAsync({
        name: name.trim(),
        color,
      })
    }
    onClose()
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
          name={name}
          color={color}
          onNameChange={setName}
          onColorChange={setColor}
          onSubmit={handleSave}
          onCancel={handleClose}
          onDelete={isEditing ? handleDelete : undefined}
          isEditing={isEditing}
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
