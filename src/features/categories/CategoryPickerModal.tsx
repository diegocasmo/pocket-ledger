import { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { CategoryFormModal } from '@/features/categories/CategoryFormModal'
import { useCategories } from '@/hooks/useCategories'
import { Check, X } from 'lucide-react'
import type { Category } from '@/types'

interface CategoryPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (categoryId: string) => void
  selectedCategoryId?: string
}

export function CategoryPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedCategoryId,
}: CategoryPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const { data: categories = [] } = useCategories()

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const hasFilteredCategories = filteredCategories.length > 0

  const getCreateButtonText = () => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return 'New Category'
    const truncated = trimmed.length > 12 ? `${trimmed.slice(0, 12)}...` : trimmed
    return `Create "${truncated}" category`
  }

  const handleCategoryClick = (categoryId: string) => {
    onSelect(categoryId)
    onClose()
  }

  const handleCloseForm = (newCategoryId?: string) => {
    setEditingCategory(null)
    setIsCreating(false)

    // Auto-select newly created category
    if (newCategoryId) {
      onSelect(newCategoryId)
      onClose()
    }
  }

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
    }
  }, [isOpen])

  return (
    <>
      <Dialog isOpen={isOpen} onClose={onClose} title="Select Category">
        <div className="space-y-4">
          {/* Search input - no auto-focus */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full px-3 py-2 pr-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category list */}
          <div className="space-y-1 max-h-64 overflow-auto min-h-48">
            {!hasFilteredCategories ? (
              <div className="flex flex-col items-center justify-center py-4 gap-3">
                <p className="text-[var(--color-text-secondary)]">
                  No categories found
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  {getCreateButtonText()}
                </Button>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors min-h-[44px]"
                >
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(category.id)}
                    className="flex items-center gap-3 flex-1 text-left min-w-0"
                    data-testid={`category-option-${category.id}`}
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="flex-1 text-[var(--color-text-primary)] truncate">
                      {category.name}
                    </span>
                    {selectedCategoryId === category.id && (
                      <Check className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    )}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCategory(category)}
                  >
                    Edit
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Add category button - only show when categories exist (empty state has its own button) */}
          {hasFilteredCategories && (
            <Button onClick={() => setIsCreating(true)} className="w-full">
              {getCreateButtonText()}
            </Button>
          )}
        </div>
      </Dialog>

      <CategoryFormModal
        key={editingCategory?.id ?? (isCreating ? 'create' : 'closed')}
        isOpen={isCreating || editingCategory !== null}
        onClose={handleCloseForm}
        category={editingCategory}
        initialName={isCreating ? searchQuery : undefined}
      />
    </>
  )
}
