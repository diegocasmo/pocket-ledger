import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCategoryHasExpenses,
} from '../../hooks/useCategories'
import type { Category } from '../../types'

interface CategoryManagerModalProps {
  isOpen: boolean
  onClose: () => void
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
]

export function CategoryManagerModal({ isOpen, onClose }: CategoryManagerModalProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)

  const { data: categories = [] } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()
  const { data: hasExpenses } = useCategoryHasExpenses(deleteCategory?.id ?? '')

  const resetForm = () => {
    setName('')
    setColor(PRESET_COLORS[0])
    setEditingCategory(null)
    setIsCreating(false)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setColor(category.color)
    setIsCreating(false)
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingCategory(null)
    setName('')
    setColor(PRESET_COLORS[0])
  }

  const handleSave = async () => {
    if (!name.trim()) return

    if (editingCategory) {
      await updateCategory.mutateAsync({
        id: editingCategory.id,
        name: name.trim(),
        color,
      })
    } else {
      await createCategory.mutateAsync({
        name: name.trim(),
        color,
      })
    }
    resetForm()
  }

  const handleDelete = (category: Category) => {
    setDeleteCategory(category)
  }

  const confirmDelete = async () => {
    if (deleteCategory) {
      await deleteCategoryMutation.mutateAsync(deleteCategory.id)
      setDeleteCategory(null)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const isFormOpen = isCreating || editingCategory !== null

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Manage Categories">
        {!isFormOpen ? (
          <div className="space-y-4">
            <div className="space-y-2 max-h-64 overflow-auto">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-bg-secondary)]"
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="flex-1 text-[var(--color-text-primary)]">
                    {category.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
            <Button onClick={handleCreate} className="w-full">
              Add Category
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              autoFocus
            />
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      color === presetColor ? 'ring-2 ring-primary-500 ring-offset-2 scale-110' : ''
                    }`}
                    style={{ backgroundColor: presetColor }}
                    aria-label={`Select color ${presetColor}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={
                  !name.trim() ||
                  createCategory.isPending ||
                  updateCategory.isPending
                }
              >
                {editingCategory ? 'Save' : 'Create'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog
        isOpen={deleteCategory !== null}
        onClose={() => setDeleteCategory(null)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={
          hasExpenses
            ? `Cannot delete "${deleteCategory?.name}" because it has expenses. Please reassign or delete those expenses first.`
            : `Are you sure you want to delete "${deleteCategory?.name}"?`
        }
        confirmLabel="Delete"
        isLoading={deleteCategoryMutation.isPending}
      />
    </>
  )
}
