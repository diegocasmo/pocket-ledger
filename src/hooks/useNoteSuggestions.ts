import { useMemo } from 'react'
import { subMonths } from 'date-fns'
import { useExpensesByCategory } from '@/hooks/useExpenses'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDateToISO } from '@/lib/dates'

const MAX_SUGGESTIONS = 3
const MIN_QUERY_LENGTH = 1
const DEBOUNCE_MS = 200

interface UseNoteSuggestionsOptions {
  categoryId: string | null
  query: string
}

interface UseNoteSuggestionsResult {
  suggestions: string[]
}

export function useNoteSuggestions({
  categoryId,
  query,
}: UseNoteSuggestionsOptions): UseNoteSuggestionsResult {
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS)

  const today = new Date()
  const sixMonthsAgo = subMonths(today, 6)
  const start = formatDateToISO(sixMonthsAgo)
  const end = formatDateToISO(today)

  const { data: expenses } = useExpensesByCategory(categoryId, start, end)

  const suggestions = useMemo(() => {
    if (!categoryId || debouncedQuery.length < MIN_QUERY_LENGTH) {
      return []
    }

    if (!expenses) {
      return []
    }

    const normalizedQuery = debouncedQuery.toLowerCase()
    const uniqueNotes = new Set<string>()

    for (const expense of expenses) {
      if (expense.note && expense.note.toLowerCase().includes(normalizedQuery)) {
        uniqueNotes.add(expense.note)
        if (uniqueNotes.size >= MAX_SUGGESTIONS) {
          break
        }
      }
    }

    return Array.from(uniqueNotes)
  }, [categoryId, debouncedQuery, expenses])

  return { suggestions }
}
