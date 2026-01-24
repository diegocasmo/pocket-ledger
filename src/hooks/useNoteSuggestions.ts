import { useMemo } from 'react'
import { subMonths, format } from 'date-fns'
import { useExpensesByCategory } from '@/hooks/useExpenses'
import { useDebounce } from '@/hooks/useDebounce'

interface UseNoteSuggestionsOptions {
  categoryId: string | null
  query: string
  maxSuggestions?: number
  minQueryLength?: number
  debounceMs?: number
}

interface UseNoteSuggestionsResult {
  suggestions: string[]
  isLoading: boolean
}

export function useNoteSuggestions({
  categoryId,
  query,
  maxSuggestions = 3,
  minQueryLength = 1,
  debounceMs = 200,
}: UseNoteSuggestionsOptions): UseNoteSuggestionsResult {
  const debouncedQuery = useDebounce(query, debounceMs)

  const today = new Date()
  const sixMonthsAgo = subMonths(today, 6)
  const start = format(sixMonthsAgo, 'yyyy-MM-dd')
  const end = format(today, 'yyyy-MM-dd')

  const { data: expenses, isLoading } = useExpensesByCategory(
    categoryId,
    start,
    end
  )

  const suggestions = useMemo(() => {
    if (!categoryId || debouncedQuery.length < minQueryLength) {
      return []
    }

    if (!expenses) {
      return []
    }

    const normalizedQuery = debouncedQuery.toLowerCase()
    const uniqueNotes = new Set<string>()

    for (const expense of expenses) {
      if (expense.note && expense.note.toLowerCase().startsWith(normalizedQuery)) {
        uniqueNotes.add(expense.note)
        if (uniqueNotes.size >= maxSuggestions) {
          break
        }
      }
    }

    return Array.from(uniqueNotes)
  }, [categoryId, debouncedQuery, minQueryLength, maxSuggestions, expenses])

  return {
    suggestions,
    isLoading,
  }
}
