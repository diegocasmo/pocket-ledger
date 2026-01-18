import { useCategories } from '../../hooks/useCategories'
import { formatCentsToUsd } from '../../services/money'

interface CategoryBreakdownTableProps {
  byCategory: Record<string, number>
  totalCents: number
  onCategoryClick: (categoryId: string) => void
}

export function CategoryBreakdownTable({
  byCategory,
  totalCents,
  onCategoryClick,
}: CategoryBreakdownTableProps) {
  const { data: categories = [] } = useCategories()

  // Sort categories by total spent descending, filter out zero totals
  const sortedCategories = categories
    .filter((cat) => (byCategory[cat.id] ?? 0) > 0)
    .sort((a, b) => (byCategory[b.id] ?? 0) - (byCategory[a.id] ?? 0))

  if (sortedCategories.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
        By Category
      </h2>
      <div className="bg-[var(--color-bg-secondary)] rounded-xl divide-y divide-[var(--color-border)]">
        {sortedCategories.map((category) => {
          const amount = byCategory[category.id] ?? 0
          const percentage = totalCents > 0 ? (amount / totalCents) * 100 : 0

          return (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className="w-full flex items-center gap-3 p-3 hover:bg-[var(--color-bg-tertiary)] transition-colors text-left first:rounded-t-xl last:rounded-b-xl"
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--color-text-primary)] truncate">
                    {category.name}
                  </span>
                  <span className="font-medium text-[var(--color-text-primary)] flex-shrink-0 ml-2">
                    {formatCentsToUsd(amount)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                  <span className="text-sm text-[var(--color-text-secondary)] w-12 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-[var(--color-text-secondary)] flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )
        })}
      </div>
    </div>
  )
}
