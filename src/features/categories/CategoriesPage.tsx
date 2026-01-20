import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCategories'
import { CategoryFormModal } from '@/features/categories/CategoryFormModal'
import type { Category } from '@/types'

export function CategoriesPage() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const { data: categories = [] } = useCategories()

  const isModalOpen = isCreating || editingCategory !== null

  const handleCloseModal = () => {
    setEditingCategory(null)
    setIsCreating(false)
  }

  return (
    <>
      <div className="p-4 space-y-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Categories
        </h1>

        <div className="space-y-4">
          <div className="space-y-2">
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
                  onClick={() => setEditingCategory(category)}
                >
                  Edit
                </Button>
              </div>
            ))}
          </div>
          <Button onClick={() => setIsCreating(true)} className="w-full">
            Add Category
          </Button>
        </div>
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={editingCategory}
      />
    </>
  )
}

export default CategoriesPage
