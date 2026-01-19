import { useState } from 'react'
import { RangePicker } from '@/features/insights/RangePicker'
import { SummaryTile } from '@/features/insights/SummaryTile'
import { CategoryBreakdownTable } from '@/features/insights/CategoryBreakdownTable'
import { CategoryExpenseList } from '@/features/insights/CategoryExpenseList'
import { useExpensesForRange } from '@/hooks/useExpenses'
import { useSettings } from '@/hooks/useSettings'
import { aggregateExpenses } from '@/services/aggregation'
import { getWeekRange, getMonthRange, getYearRange, getTodayISO } from '@/lib/dates'

type RangeType = 'week' | 'month' | 'year' | 'custom'

export function InsightsPage() {
  const { data: settings } = useSettings()
  const [rangeType, setRangeType] = useState<RangeType>('month')
  const [customRange, setCustomRange] = useState<[string, string]>(() => {
    const today = new Date()
    const [start, end] = getMonthRange(today.getFullYear(), today.getMonth() + 1)
    return [start, end]
  })
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const today = new Date()
  const todayISO = getTodayISO()

  const getRange = (): [string, string] => {
    switch (rangeType) {
      case 'week':
        return getWeekRange(today, settings?.weekStartsOn ?? 0)
      case 'month':
        return getMonthRange(today.getFullYear(), today.getMonth() + 1)
      case 'year':
        return getYearRange(today.getFullYear())
      case 'custom':
        return customRange
    }
  }

  const [start, end] = getRange()
  const { data: expenses = [] } = useExpensesForRange(start, end)
  const aggregate = aggregateExpenses(expenses)

  const handleRangeChange = (type: RangeType) => {
    setRangeType(type)
    setSelectedCategoryId(null)
  }

  const handleCustomRangeChange = (newStart: string, newEnd: string) => {
    setCustomRange([newStart, newEnd])
    setRangeType('custom')
    setSelectedCategoryId(null)
  }

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
  }

  const handleBackFromCategory = () => {
    setSelectedCategoryId(null)
  }

  if (selectedCategoryId) {
    return (
      <CategoryExpenseList
        categoryId={selectedCategoryId}
        start={start}
        end={end}
        onBack={handleBackFromCategory}
      />
    )
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
        Insights
      </h1>

      <RangePicker
        rangeType={rangeType}
        customStart={customRange[0]}
        customEnd={customRange[1]}
        maxDate={todayISO}
        onRangeTypeChange={handleRangeChange}
        onCustomRangeChange={handleCustomRangeChange}
      />

      <SummaryTile totalCents={aggregate.totalCents} />

      <CategoryBreakdownTable
        byCategory={aggregate.byCategory}
        totalCents={aggregate.totalCents}
        onCategoryClick={handleCategoryClick}
      />

      {expenses.length === 0 && (
        <p className="text-center text-[var(--color-text-secondary)]">
          No expenses in this period
        </p>
      )}
    </div>
  )
}
