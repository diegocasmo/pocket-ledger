import { useState, useEffect } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCategoryHasExpenses,
} from '../../hooks/useCategories'
import type { Category } from '../../types'

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
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const { data: hasExpenses } = useCategoryHasExpenses(category?.id ?? '')

  const isEditing = !!category

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name)
        setColor(category.color)
      } else {
        setName('')
        setColor(PRESET_COLORS[0])
      }
    }
  }, [isOpen, category])

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
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (category) {
      await deleteCategory.mutateAsync(category.id)
      setShowDeleteConfirm(false)
      onClose()
    }
  }

  const handleClose = () => {
    setShowDeleteConfirm(false)
    onClose()
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isEditing ? 'Edit Category' : 'Add Category'}
      >
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
                    color === presetColor
                      ? 'ring-2 ring-primary-500 ring-offset-2 scale-110'
                      : ''
                  }`}
                  style={{ backgroundColor: presetColor }}
                  aria-label={`Select color ${presetColor}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  className="flex-1"
                  disabled={deleteCategory.isPending}
                >
                  Delete
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
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  className="flex-1"
                >
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
                  Create
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={
          hasExpenses
            ? `Cannot delete "${category?.name}" because it has expenses. Please reassign or delete those expenses first.`
            : `Are you sure you want to delete "${category?.name}"?`
        }
        confirmLabel="Delete"
        isLoading={deleteCategory.isPending}
      />
    </>
  )
}
