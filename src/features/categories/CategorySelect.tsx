import { useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import { CategoryListModal } from '@/features/categories/CategoryListModal'
import { CategoryFormModal } from '@/features/categories/CategoryFormModal'
import type { Category } from '@/types'

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function CategorySelect({ value, onChange, error }: CategorySelectProps) {
  const [showList, setShowList] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const { data: categories = [] } = useCategories()

  const selectedCategory = categories.find((c) => c.id === value)

  const handleEdit = (category: Category) => {
    setShowList(false)
    setEditingCategory(category)
  }

  const handleCreate = () => {
    setShowList(false)
    setIsCreating(true)
  }

  const handleCloseForm = () => {
    setEditingCategory(null)
    setIsCreating(false)
    setShowList(true)
  }

  const handleCloseList = () => {
    setShowList(false)
  }

  return (
    <>
      <div className="w-full">
        <label
          htmlFor="category"
          className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
        >
          Category
        </label>
        <div className="relative">
          <select
            id="category"
            value={value}
            onChange={(e) => {
              if (e.target.value === '__manage__') {
                setShowList(true)
                return
              }
              onChange(e.target.value)
            }}
            className={`
              w-full py-2 pr-3 rounded-lg border appearance-none
              bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${error ? 'border-red-500' : 'border-[var(--color-border)]'}
              ${selectedCategory ? 'pl-8' : 'pl-3'}
            `}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem',
            }}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
            <option value="__manage__">Manage categories...</option>
          </select>
          {selectedCategory && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full pointer-events-none"
              style={{ backgroundColor: selectedCategory.color }}
            />
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
      <CategoryListModal
        isOpen={showList}
        onClose={handleCloseList}
        onEdit={handleEdit}
        onCreate={handleCreate}
      />
      <CategoryFormModal
        isOpen={isCreating || editingCategory !== null}
        onClose={handleCloseForm}
        category={editingCategory}
      />
    </>
  )
}
