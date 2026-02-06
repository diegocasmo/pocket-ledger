import { useState, useCallback, useRef } from 'react'
import { RangePicker } from '@/features/insights/RangePicker'
import { PeriodNavigator } from '@/components/ui/PeriodNavigator'
import { SummaryTile } from '@/features/insights/SummaryTile'
import { CategoryBreakdownTable } from '@/features/insights/CategoryBreakdownTable'
import { CategoryExpenseList } from '@/features/insights/CategoryExpenseList'
import { useExpensesForRange } from '@/hooks/useExpenses'
import { useSettings } from '@/hooks/useSettings'
import { aggregateExpenses } from '@/services/aggregation'
import { getWeekRange, getMonthRange, getYearRange, isCurrentPeriod, formatPeriodLabel, shiftPeriod } from '@/lib/dates'
import type { RangeType } from '@/types'

export function InsightsPage() {
  const { data: settings } = useSettings()
  const [rangeType, setRangeType] = useState<RangeType>('month')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [viewDate, setViewDate] = useState(() => new Date())
  const touchStartX = useRef<number | null>(null)

  const weekStartsOn = settings?.weekStartsOn ?? 0

  const getRange = (): [string, string] => {
    switch (rangeType) {
      case 'week':
        return getWeekRange(viewDate, weekStartsOn)
      case 'month':
        return getMonthRange(viewDate.getFullYear(), viewDate.getMonth() + 1)
      case 'year':
        return getYearRange(viewDate.getFullYear())
    }
  }

  const [start, end] = getRange()
  const { data: expenses = [] } = useExpensesForRange(start, end)
  const aggregate = aggregateExpenses(expenses)

  const currentPeriod = isCurrentPeriod(viewDate, rangeType, weekStartsOn)

  const goToPrevious = useCallback(() => {
    setViewDate((prev) => shiftPeriod(prev, rangeType, 'previous'))
    setSelectedCategoryId(null)
  }, [rangeType])

  const goToNext = useCallback(() => {
    setViewDate((prev) => shiftPeriod(prev, rangeType, 'next'))
    setSelectedCategoryId(null)
  }, [rangeType])

  const goToToday = useCallback(() => {
    setViewDate(new Date())
    setSelectedCategoryId(null)
  }, [])

  const handleRangeChange = (type: RangeType) => {
    setRangeType(type)
    setViewDate(new Date())
    setSelectedCategoryId(null)
  }

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
  }

  const handleBackFromCategory = () => {
    setSelectedCategoryId(null)
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return

      const touchEndX = e.changedTouches[0].clientX
      const diff = touchEndX - touchStartX.current

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToPrevious()
        } else if (!currentPeriod) {
          goToNext()
        }
      }

      touchStartX.current = null
    },
    [goToPrevious, goToNext, currentPeriod]
  )

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
    <div
      className="p-4 space-y-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <PeriodNavigator
        label={formatPeriodLabel(viewDate, rangeType, weekStartsOn)}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onToday={goToToday}
        isCurrentPeriod={currentPeriod}
      />

      <RangePicker rangeType={rangeType} onRangeTypeChange={handleRangeChange} />

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

export default InsightsPage
