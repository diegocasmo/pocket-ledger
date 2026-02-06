import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { useCategories } from '@/hooks/useCategories'

export function CategoriesPage() {
  const navigate = useNavigate()
  const { data: categories = [] } = useCategories()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search categories..."
          autoFocus
        />
        <div className="space-y-2">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className="flex w-full items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] cursor-pointer text-left bg-transparent border-none"
                onClick={() => navigate(`/categories/${category.id}`)}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="flex-1 text-[var(--color-text-primary)]">
                  {category.name}
                </span>
              </button>
            ))
          ) : (
            <p className="text-center py-8 text-[var(--color-text-secondary)]">
              No categories found
            </p>
          )}
        </div>
        <Button onClick={() => navigate('/categories/new')} className="w-full">
          New Category
        </Button>
      </div>
    </div>
  )
}

export default CategoriesPage
