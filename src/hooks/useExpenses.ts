import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createExpense,
  updateExpense,
  deleteExpense,
  getExpense,
  listExpensesForDateRange,
  listExpensesForDay,
  listExpensesByCategory,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from '../db/expensesRepo'
import { getMonthRange } from '../lib/dates'

const EXPENSES_KEY = ['expenses']

export function useExpensesForMonth(year: number, month: number) {
  const [start, end] = getMonthRange(year, month)

  return useQuery({
    queryKey: [...EXPENSES_KEY, 'month', year, month],
    queryFn: () => listExpensesForDateRange(start, end),
  })
}

export function useExpensesForDay(date: string | null) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, 'day', date],
    queryFn: () => listExpensesForDay(date!),
    enabled: !!date,
  })
}

export function useExpensesForRange(start: string, end: string) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, 'range', start, end],
    queryFn: () => listExpensesForDateRange(start, end),
    enabled: !!start && !!end,
  })
}

export function useExpensesByCategory(
  categoryId: string | null,
  start: string,
  end: string
) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, 'category', categoryId, start, end],
    queryFn: () => listExpensesByCategory(categoryId!, start, end),
    enabled: !!categoryId && !!start && !!end,
  })
}

export function useExpense(id: string | null) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, id],
    queryFn: () => getExpense(id!),
    enabled: !!id,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateExpenseInput) => createExpense(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & UpdateExpenseInput) =>
      updateExpense(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
    },
  })
}

export function useDuplicateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateExpenseInput) => {
      return createExpense(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
