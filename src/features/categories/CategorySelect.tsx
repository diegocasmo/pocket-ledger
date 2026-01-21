import { useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import { CategoryPickerModal } from '@/features/categories/CategoryPickerModal'
import { ChevronDown } from 'lucide-react'

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  error?: string
  onBlur?: () => void
}

export function CategorySelect({ value, onChange, error, onBlur }: CategorySelectProps) {
  const [showPicker, setShowPicker] = useState(false)
  const { data: categories = [] } = useCategories()

  const selectedCategory = categories.find((c) => c.id === value)

  const handleClosePicker = () => {
    setShowPicker(false)
    onBlur?.()
  }

  return (
    <>
      <div className="w-full">
        {/* Visual label only - not associated with button since htmlFor doesn't work with buttons */}
        <span className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          Category
        </span>
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          data-testid="category-trigger"
          className={`
            w-full py-2 px-3 rounded-lg border text-left flex items-center gap-2
            bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            ${error ? 'border-red-500' : 'border-[var(--color-border)]'}
          `}
        >
          {selectedCategory ? (
            <>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span className="flex-1 truncate">{selectedCategory.name}</span>
            </>
          ) : (
            <span className="flex-1 text-[var(--color-text-secondary)]">
              Select a category
            </span>
          )}
          <ChevronDown className="w-5 h-5 text-[var(--color-text-secondary)] flex-shrink-0" />
        </button>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
      <CategoryPickerModal
        isOpen={showPicker}
        onClose={handleClosePicker}
        onSelect={onChange}
        selectedCategoryId={value}
      />
    </>
  )
}
