import { useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CategoryForm, type CategoryFormData } from '@/features/categories/CategoryForm'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCategoryHasExpenses,
} from '@/hooks/useCategories'
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation'
import { useExpenseFormContext } from '@/contexts/ExpenseFormContext'
import type { Category } from '@/types'

export function CategoryFormPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { updateDraft } = useExpenseFormContext()

  const returnPath = searchParams.get('returnPath')
  const initialName = searchParams.get('initialName') ?? undefined

  const { data: categories = [] } = useCategories()
  const category = id ? categories.find((c) => c.id === id) : null
  const isEditing = !!id && !!category

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const { data: hasExpenses } = useCategoryHasExpenses(category?.id ?? '')

  const deletion = useDeleteConfirmation<Category>({
    onDelete: async (item) => {
      await deleteCategory.mutateAsync(item.id)
    },
    onSuccess: () => handleReturn(),
  })

  const handleReturn = (newCategoryId?: string) => {
    // If a new category was created and we're returning to a picker, auto-select it
    if (newCategoryId && returnPath?.includes('/category')) {
      updateDraft({ categoryId: newCategoryId })
    }

    if (returnPath) {
      navigate(returnPath)
    } else {
      navigate('/categories')
    }
  }

  const handleSave = async (data: CategoryFormData) => {
    if (isEditing && category) {
      await updateCategory.mutateAsync({
        id: category.id,
        ...data,
      })
      handleReturn()
    } else {
      const newCategory = await createCategory.mutateAsync(data)
      handleReturn(newCategory.id)
    }
  }

  const handleDelete = () => {
    if (category) {
      deletion.requestDelete(category)
    }
  }

  const handleCancel = () => {
    handleReturn()
  }

  // Redirect if category not found
  const categoryNotFound = id && !category && categories.length > 0
  useEffect(() => {
    if (categoryNotFound) {
      navigate('/categories')
    }
  }, [categoryNotFound, navigate])

  // Category not found - render nothing while redirecting
  if (categoryNotFound) {
    return null
  }

  return (
    <>
      <PageHeader
        title={isEditing ? 'Edit Category' : 'New Category'}
        onBack={handleCancel}
      />
      <div className="p-4">
        <CategoryForm
          key={category?.id ?? 'new'}
          category={category}
          initialName={initialName}
          onSubmit={handleSave}
          onCancel={handleCancel}
          onDelete={isEditing ? handleDelete : undefined}
          isSubmitting={createCategory.isPending || updateCategory.isPending}
          isDeleting={deletion.isDeleting}
        />
      </div>
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

export default CategoryFormPage
