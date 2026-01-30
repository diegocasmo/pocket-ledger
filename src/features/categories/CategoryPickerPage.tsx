import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCategories'
import { useExpenseFormContext } from '@/contexts/ExpenseFormContext'

export function CategoryPickerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { draft, updateDraft } = useExpenseFormContext()

  const [searchQuery, setSearchQuery] = useState('')
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

  // Determine paths based on whether we're editing or creating an expense
  const returnPath = id ? `/expenses/${id}` : '/expenses/new'
  const pickerPath = id ? `/expenses/${id}/category` : '/expenses/new/category'

  const handleCategoryClick = (categoryId: string) => {
    updateDraft({ categoryId })
    navigate(returnPath)
  }

  const handleCreateCategory = () => {
    const params = new URLSearchParams({
      returnPath: pickerPath,
      expenseFormPath: returnPath,
    })
    if (searchQuery.trim()) {
      params.set('initialName', searchQuery.trim())
    }
    navigate(`/categories/new?${params.toString()}`)
  }

  const handleEditCategory = (categoryId: string) => {
    const params = new URLSearchParams({
      returnPath: pickerPath,
      expenseFormPath: returnPath,
    })
    navigate(`/categories/${categoryId}?${params.toString()}`)
  }

  const handleBack = () => {
    navigate(returnPath)
  }

  return (
    <>
      <PageHeader title="Select Category" onBack={handleBack} />
      <div className="p-4 space-y-4">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            autoFocus
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
        <div className="space-y-1">
          {!hasFilteredCategories ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <p className="text-[var(--color-text-secondary)]">No categories found</p>
              <Button onClick={handleCreateCategory}>{getCreateButtonText()}</Button>
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
                  {draft?.categoryId === category.id && (
                    <Check className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  )}
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditCategory(category.id)}
                >
                  Edit
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Add category button - only show when categories exist */}
        {hasFilteredCategories && (
          <Button onClick={handleCreateCategory} className="w-full">
            {getCreateButtonText()}
          </Button>
        )}
      </div>
    </>
  )
}

export default CategoryPickerPage
