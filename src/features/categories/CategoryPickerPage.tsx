import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { useCategories } from '@/hooks/useCategories'
import { useExpenseFormContext } from '@/contexts/ExpenseFormContext'

export function CategoryPickerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
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

  // Determine paths based on whether we're editing or creating an expense.
  // Preserve the date param so the expense form keeps the selected date across
  // this round trip (the date is URL-derived, not stored in the draft).
  const dateParam = searchParams.get('date')
  const dateQuery = dateParam ? `?date=${dateParam}` : ''
  const returnPath = id ? `/expenses/${id}${dateQuery}` : `/expenses/new${dateQuery}`
  const pickerPath = id
    ? `/expenses/${id}/category${dateQuery}`
    : `/expenses/new/category${dateQuery}`

  const handleCategoryClick = (categoryId: string) => {
    updateDraft({ categoryId })
    void navigate(returnPath)
  }

  const handleCreateCategory = () => {
    const params = new URLSearchParams({
      returnPath: pickerPath,
      expenseFormPath: returnPath,
    })
    if (searchQuery.trim()) {
      params.set('initialName', searchQuery.trim())
    }
    void navigate(`/categories/new?${params.toString()}`)
  }

  const handleEditCategory = (categoryId: string) => {
    const params = new URLSearchParams({
      returnPath: pickerPath,
      expenseFormPath: returnPath,
    })
    void navigate(`/categories/${categoryId}?${params.toString()}`)
  }

  const handleBack = () => {
    void navigate(returnPath)
  }

  return (
    <>
      <PageHeader title="Select Category" onBack={handleBack} />
      <div className="p-4 space-y-4">
        {/* Search input */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search categories..."
          autoFocus
        />

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
