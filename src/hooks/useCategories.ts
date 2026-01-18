import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryHasExpenses,
} from '../repositories/categoriesRepo'
import type { Category } from '../types'

const CATEGORIES_KEY = ['categories']

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: listCategories,
  })
}

export function useCategoryHasExpenses(categoryId: string) {
  return useQuery({
    queryKey: ['categoryHasExpenses', categoryId],
    queryFn: () => categoryHasExpenses(categoryId),
    enabled: !!categoryId,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Pick<Category, 'name' | 'color'>) => createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      ...patch
    }: { id: string } & Partial<Pick<Category, 'name' | 'color'>>) =>
      updateCategory(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
    },
  })
}
