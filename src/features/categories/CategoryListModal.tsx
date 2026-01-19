import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCategories'
import type { Category } from '@/types'

interface CategoryListModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: (category: Category) => void
  onCreate: () => void
}

export function CategoryListModal({
  isOpen,
  onClose,
  onEdit,
  onCreate,
}: CategoryListModalProps) {
  const { data: categories = [] } = useCategories()

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Manage Categories">
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
                onClick={() => onEdit(category)}
              >
                Edit
              </Button>
            </div>
          ))}
        </div>
        <Button onClick={onCreate} className="w-full">
          Add Category
        </Button>
      </div>
    </Dialog>
  )
}
