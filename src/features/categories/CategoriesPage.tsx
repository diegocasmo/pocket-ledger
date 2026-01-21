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
              <button
                key={category.id}
                type="button"
                className="flex w-full items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] cursor-pointer text-left bg-transparent border-none"
                onClick={() => setEditingCategory(category)}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="flex-1 text-[var(--color-text-primary)]">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
          <Button onClick={() => setIsCreating(true)} className="w-full">
            New Category
          </Button>
        </div>
      </div>

      <CategoryFormModal
        key={editingCategory?.id ?? (isCreating ? 'create' : 'closed')}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={editingCategory}
      />
    </>
  )
}

export default CategoriesPage
